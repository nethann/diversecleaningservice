import { addons, services, team, timeSlots } from "@/components/product-data";
import { getPool, query } from "@/lib/db";

let seedPromise;

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
    address: row.address,
    details: row.details,
    recurring: row.recurring,
    status: row.status,
    createdAt: row.createdAt,
    selectedAddons: row.selectedAddons ?? []
  };
}

async function ensureReferenceData() {
  if (!seedPromise) {
    seedPromise = (async () => {
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

function getAvailableTeams(bookings, date, slot) {
  const weekday = getWeekday(date);

  return team.filter((member) => {
    const worksThisSlot = member.days.includes(weekday) && member.slots.includes(slot);
    if (!worksThisSlot) {
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
        b.address,
        b.special_instructions AS "details",
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

  return timeSlots.map((slot) => {
    const availableTeams = getAvailableTeams(bookings, date, slot);

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

export async function updateBookingStatus(id, status) {
  const allowedStatuses = new Set(["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]);

  if (!allowedStatuses.has(status)) {
    return { error: "Invalid status.", status: 400 };
  }

  const result = await query(
    `
      UPDATE bookings
      SET status = $2
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
        address,
        special_instructions AS "details",
        recurring_frequency AS "recurring",
        status,
        created_at AS "createdAt"
    `,
    [id, status]
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
  const availableTeams = getAvailableTeams(bookings, payload.date, payload.time);

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
          special_instructions,
          recurring_frequency,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'confirmed')
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
      address: payload.address,
      details: payload.details ?? "",
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
