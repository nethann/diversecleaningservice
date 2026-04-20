import { addons, services, timeSlots } from "@/components/product-data";
import { listAdminTeamMembers } from "@/lib/admin-auth";
import { getPool, query } from "@/lib/db";

let seedPromise;
let schemaUpdatePromise;

function getWeekday(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
}

function mapBookingRow(row) {
  return {
    id: row.id,
    customer: row.customer,
    email: row.email,
    phone: row.phone,
    service: row.service,
    serviceSlug: row.serviceSlug,
    homeSize: row.homeSize,
    bathCount: row.bathCount,
    date: row.date,
    time: row.time,
    cleaner: row.cleaner,
    cleanerId: row.cleanerId,
    assignedCleaners: row.assignedCleaners ?? [],
    address: row.address,
    details: row.details,
    internalNotes: row.internalNotes ?? "",
    recurring: row.recurring,
    status: row.status,
    createdAt: row.createdAt,
    selectedAddons: row.selectedAddons ?? []
  };
}

async function ensureBookingSchemaUpdates() {
  if (!schemaUpdatePromise) {
    schemaUpdatePromise = (async () => {
      const client = await getPool().connect();

      try {
        await client.query("BEGIN");
        await client.query(`
          ALTER TABLE bookings
          ADD COLUMN IF NOT EXISTS assigned_cleaners JSONB NOT NULL DEFAULT '[]'::jsonb
        `);
        await client.query(`
          ALTER TABLE bookings
          ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT ''
        `);
        await client.query(`
          UPDATE bookings
          SET assigned_cleaners = jsonb_build_array(
            jsonb_build_object('id', cleaner_id, 'name', cleaner_name)
          )
          WHERE (assigned_cleaners IS NULL OR assigned_cleaners = '[]'::jsonb)
            AND cleaner_id IS NOT NULL
            AND cleaner_name IS NOT NULL
        `);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })();
  }

  return schemaUpdatePromise;
}

async function ensureReferenceData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureBookingSchemaUpdates();
      const client = await getPool().connect();

      try {
        await client.query("BEGIN");

        for (const service of services) {
          await client.query(
            `
              INSERT INTO services (slug, name, price_label, duration_label, description, booking_mode)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (slug) DO UPDATE
              SET name = EXCLUDED.name,
                  price_label = EXCLUDED.price_label,
                  duration_label = EXCLUDED.duration_label,
                  description = EXCLUDED.description,
                  booking_mode = EXCLUDED.booking_mode
            `,
            [
              service.slug,
              service.name,
              service.priceLabel,
              service.duration,
              service.description,
              service.slug === "commercial-cleaning" ? "estimate" : "published"
            ]
          );
        }

        for (const addon of addons) {
          await client.query(
            `
              INSERT INTO addons (slug, name, price_label)
              VALUES ($1, $2, $3)
              ON CONFLICT (slug) DO UPDATE
              SET name = EXCLUDED.name,
                  price_label = EXCLUDED.price_label
            `,
            [addon.slug, addon.name, addon.priceLabel]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })();
  }

  return seedPromise;
}

function getAvailableTeams(bookings, date, slot, teamMembers) {
  const weekday = getWeekday(date);

  return teamMembers.filter((member) => {
    const isBlackoutDate = (member.blackoutDates ?? []).includes(date);
    const worksThisSlot = (member.availability ?? []).some(
      (entry) => entry.weekday === weekday && entry.timeSlot === slot
    );
    if (!worksThisSlot || isBlackoutDate) {
      return false;
    }

    return !bookings.some(
      (booking) =>
        booking.date === date && booking.time === slot && booking.cleanerId === member.id && booking.status !== "cancelled"
    );
  });
}

export async function listBookings() {
  await ensureReferenceData();

  const result = await query(
    `
      SELECT
        b.id,
        b.customer_name AS "customer",
        b.customer_email AS "email",
        b.customer_phone AS "phone",
        b.service_name AS "service",
        b.service_slug AS "serviceSlug",
        b.home_size AS "homeSize",
        b.bath_count AS "bathCount",
        b.scheduled_date::text AS "date",
        b.scheduled_time AS "time",
        b.cleaner_name AS "cleaner",
        b.cleaner_id AS "cleanerId",
        b.assigned_cleaners AS "assignedCleaners",
        b.address,
        b.special_instructions AS "details",
        b.internal_notes AS "internalNotes",
        b.recurring_frequency AS "recurring",
        b.status,
        b.created_at AS "createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'slug', ba.addon_slug,
              'name', ba.addon_name,
              'priceLabel', ba.addon_price_label
            )
            ORDER BY ba.addon_name
          ) FILTER (WHERE ba.booking_id IS NOT NULL),
          '[]'::json
        ) AS "selectedAddons"
      FROM bookings b
      LEFT JOIN booking_addons ba ON ba.booking_id = b.id
      GROUP BY b.id
      ORDER BY b.scheduled_date, b.scheduled_time, b.created_at
    `
  );

  return result.rows.map(mapBookingRow);
}

export async function bootstrapBookingDatabase() {
  await ensureReferenceData();
  return listBookings();
}

export async function getSlotSummaries(date) {
  const bookings = await listBookings();
  const teamMembers = await listAdminTeamMembers();

  return timeSlots.map((slot) => {
    const availableTeams = getAvailableTeams(bookings, date, slot, teamMembers);

    return {
      slot,
      availableTeams: availableTeams.map((member) => ({
        id: member.id,
        name: member.name
      })),
      capacity: availableTeams.length,
      isAvailable: availableTeams.length > 0
    };
  });
}

export async function updateBookingStatus(id, status, assignedCleaners, internalNotes) {
  const allowedStatuses = new Set(["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]);

  if (!allowedStatuses.has(status)) {
    return { error: "Invalid status.", status: 400 };
  }

  const normalizedAssignedCleaners =
    assignedCleaners?.map((item) => ({
      id: item.id,
      name: item.name
    })) ?? null;

  if (normalizedAssignedCleaners && normalizedAssignedCleaners.length > 3) {
    return { error: "Only up to 3 team members can be assigned.", status: 400 };
  }

  const primaryCleaner = normalizedAssignedCleaners?.[0];
  const normalizedInternalNotes = typeof internalNotes === "string" ? internalNotes : null;

  const result = await query(
    `
      UPDATE bookings
      SET status = $2
        , cleaner_id = COALESCE($3, cleaner_id)
        , cleaner_name = COALESCE($4, cleaner_name)
        , assigned_cleaners = COALESCE($5::jsonb, assigned_cleaners)
        , internal_notes = COALESCE($6, internal_notes)
      WHERE id = $1
      RETURNING
        id,
        customer_name AS "customer",
        customer_email AS "email",
        customer_phone AS "phone",
        service_name AS "service",
        service_slug AS "serviceSlug",
        home_size AS "homeSize",
        bath_count AS "bathCount",
        scheduled_date::text AS "date",
        scheduled_time AS "time",
        cleaner_name AS "cleaner",
        cleaner_id AS "cleanerId",
        assigned_cleaners AS "assignedCleaners",
        address,
        special_instructions AS "details",
        internal_notes AS "internalNotes",
        recurring_frequency AS "recurring",
        status,
        created_at AS "createdAt"
    `,
    [
      id,
      status,
      primaryCleaner?.id ?? null,
      primaryCleaner?.name ?? null,
      normalizedAssignedCleaners ? JSON.stringify(normalizedAssignedCleaners) : null,
      normalizedInternalNotes
    ]
  );

  if (!result.rowCount) {
    return { error: "Booking not found.", status: 404 };
  }

  return {
    booking: mapBookingRow(result.rows[0]),
    status: 200
  };
}

function validateBookingPayload(payload) {
  if (!payload.fullName || !payload.email || !payload.address || !payload.date || !payload.time || !payload.service) {
    return "Please complete the required booking details before submitting your request.";
  }

  if (["standard-cleaning", "deep-cleaning", "move-in-move-out"].includes(payload.service) && !payload.homeSize) {
    return "Please choose your home size so we can match your request to the price guide.";
  }

  if (payload.service === "standard-cleaning" && !payload.bathCount) {
    return "Please choose the bath count for standard cleaning pricing.";
  }

  return null;
}

export async function createBooking(payload) {
  await ensureReferenceData();

  const validationError = validateBookingPayload(payload);
  if (validationError) {
    return { error: validationError, status: 400 };
  }

  const bookings = await listBookings();
  const teamMembers = await listAdminTeamMembers();
  const availableTeams = getAvailableTeams(bookings, payload.date, payload.time, teamMembers);

  if (availableTeams.length === 0) {
    return { error: "That slot was just taken. Choose another available time.", status: 409 };
  }

  const service = services.find((item) => item.slug === payload.service);
  if (!service) {
    return { error: "The selected service is not available right now.", status: 400 };
  }

  const assignedCleaner = availableTeams[0];
  const nextId = `DCS-${2400 + bookings.length + 1}`;
  const selectedAddons = addons.filter((addon) => (payload.selectedAddons ?? []).includes(addon.slug));
  const assignedCleaners = [
    {
      id: assignedCleaner.id,
      name: assignedCleaner.name
    }
  ];
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO bookings (
          id,
          customer_name,
          customer_email,
          customer_phone,
          service_slug,
          service_name,
          home_size,
          bath_count,
          address,
          scheduled_date,
          scheduled_time,
          cleaner_id,
          cleaner_name,
          assigned_cleaners,
          special_instructions,
          internal_notes,
          recurring_frequency,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, '', $16, 'confirmed')
      `,
      [
        nextId,
        payload.fullName,
        payload.email,
        payload.phone ?? "",
        service.slug,
        service.name,
        payload.homeSize ?? "",
        payload.bathCount ?? "",
        payload.address,
        payload.date,
        payload.time,
        assignedCleaner.id,
        assignedCleaner.name,
        JSON.stringify(assignedCleaners),
        payload.details ?? "",
        payload.recurring ?? "one-time"
      ]
    );

    for (const addon of selectedAddons) {
      await client.query(
        `
          INSERT INTO booking_addons (booking_id, addon_slug, addon_name, addon_price_label)
          VALUES ($1, $2, $3, $4)
        `,
        [nextId, addon.slug, addon.name, addon.priceLabel]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return { error: "That slot was just taken. Choose another available time.", status: 409 };
    }

    throw error;
  } finally {
    client.release();
  }

  return {
    booking: {
      id: nextId,
      customer: payload.fullName,
      email: payload.email,
      phone: payload.phone ?? "",
      service: service.name,
      serviceSlug: service.slug,
      homeSize: payload.homeSize ?? "",
      bathCount: payload.bathCount ?? "",
      date: payload.date,
      time: payload.time,
      cleaner: assignedCleaner.name,
      cleanerId: assignedCleaner.id,
      assignedCleaners,
      address: payload.address,
      details: payload.details ?? "",
      internalNotes: "",
      recurring: payload.recurring ?? "one-time",
      status: "confirmed",
      selectedAddons: selectedAddons.map((addon) => ({
        slug: addon.slug,
        name: addon.name,
        priceLabel: addon.priceLabel
      }))
    },
    slotSummaries: await getSlotSummaries(payload.date),
    status: 201
  };
}
