import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { getPool, initDatabase, query } from "@/lib/db";

const SESSION_COOKIE = "dcs-admin-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ADMIN_USERS = [
  {
    username: "wanda richardson",
    displayName: "Wanda Richardson",
    passwordEnv: "ADMIN_PASSWORD_WANDA_RICHARDSON",
    zone: "Atlanta Area",
    legacyIds: ["team-1"],
    legacyNames: ["Wonda Robinson", "Wanda Richardson"]
  },
  {
    username: "nethan nagendran",
    displayName: "Nethan Nagendran",
    passwordEnv: "ADMIN_PASSWORD_NETHAN_NAGENDRAN",
    zone: "Atlanta Area",
    legacyIds: ["team-2"],
    legacyNames: ["Nethan Nagendran"]
  },
  {
    username: "roshan nagendran",
    displayName: "Roshan Nagendran",
    passwordEnv: "ADMIN_PASSWORD_ROSHAN_NAGENDRAN",
    zone: "Gwinnett + Atlanta",
    legacyIds: ["team-3"],
    legacyNames: ["Roshan Nagendran"]
  }
];

let adminSchemaPromise;
let adminSeedPromise;

function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function sortTimeSlots(left, right) {
  const baseDate = "1970-01-01";
  const leftTime = Date.parse(`${baseDate} ${left}`);
  const rightTime = Date.parse(`${baseDate} ${right}`);

  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime - rightTime;
  }

  return left.localeCompare(right);
}

export function normalizeUsername(value) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, expectedHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

async function ensureAdminSchema() {
  if (!adminSchemaPromise) {
    adminSchemaPromise = (async () => {
      await initDatabase();
      const client = await getPool().connect();

      try {
        await client.query("BEGIN");
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            zone TEXT NOT NULL DEFAULT 'Atlanta Area',
            password_hash TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS zone TEXT NOT NULL DEFAULT 'Atlanta Area'
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS password_hash TEXT
        `);
        await client.query(`
          ALTER TABLE admin_users
          ADD COLUMN IF NOT EXISTS availability_configured BOOLEAN NOT NULL DEFAULT FALSE
        `);
        // Migrate slot-based table to working-hours table if needed
        await client.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'admin_weekly_availability'
                AND column_name = 'time_slot'
            ) THEN
              DROP TABLE IF EXISTS admin_weekly_availability;
            END IF;
          END $$
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_weekly_availability (
            admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
            weekday TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            PRIMARY KEY (admin_user_id, weekday)
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_blackout_dates (
            admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
            blackout_date DATE NOT NULL,
            PRIMARY KEY (admin_user_id, blackout_date)
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_sessions (
            id TEXT PRIMARY KEY,
            admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
            session_token_hash TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
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

  return adminSchemaPromise;
}

async function ensureAdminUsersSeeded() {
  if (!adminSeedPromise) {
    adminSeedPromise = (async () => {
      await ensureAdminSchema();
      const client = await getPool().connect();

      try {
        await client.query("BEGIN");

        for (const admin of ADMIN_USERS) {
          const password = process.env[admin.passwordEnv];
          const passwordHash = password ? createPasswordHash(password) : null;
          const adminId = admin.username.replace(/\s+/g, "-");

          await client.query(
            `
              INSERT INTO admin_users (id, username, display_name, zone, password_hash, is_active)
              VALUES ($1, $2, $3, $4, $5, TRUE)
              ON CONFLICT (username) DO UPDATE
              SET display_name = EXCLUDED.display_name,
                  zone = EXCLUDED.zone,
                  password_hash = COALESCE(EXCLUDED.password_hash, admin_users.password_hash),
                  is_active = TRUE,
                  updated_at = NOW()
            `,
            [adminId, normalizeUsername(admin.username), admin.displayName, admin.zone, passwordHash]
          );

          const configRows = await client.query(
            `SELECT availability_configured AS "availabilityConfigured" FROM admin_users WHERE id = $1 LIMIT 1`,
            [adminId]
          );

          if (!configRows.rows[0]?.availabilityConfigured) {
            await client.query(`DELETE FROM admin_weekly_availability WHERE admin_user_id = $1`, [adminId]);
          }

          await client.query(
            `
              UPDATE bookings
              SET cleaner_id = $1::text,
                  cleaner_name = $2::text,
                  assigned_cleaners = jsonb_build_array(jsonb_build_object('id', $1::text, 'name', $2::text))
              WHERE cleaner_id = ANY($3::text[])
                 OR cleaner_name = ANY($4::text[])
            `,
            [adminId, admin.displayName, admin.legacyIds, admin.legacyNames]
          );
        }

        await client.query(
          `
            UPDATE admin_users
            SET is_active = FALSE,
                updated_at = NOW()
            WHERE username <> ALL($1::text[])
          `,
          [ADMIN_USERS.map((admin) => normalizeUsername(admin.username))]
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })();
  }

  return adminSeedPromise;
}

export function getAdminConfigStatus() {
  return {
    configuredUsers: ADMIN_USERS.filter((admin) => Boolean(process.env[admin.passwordEnv])).map((admin) => admin.displayName),
    missingUsers: ADMIN_USERS.filter((admin) => !process.env[admin.passwordEnv]).map((admin) => admin.displayName)
  };
}

export async function listAdminTeamMembers() {
  await ensureAdminUsersSeeded();

  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name AS "displayName",
        u.zone,
        COALESCE(
          json_agg(
            json_build_object(
              'weekday', a.weekday,
              'startTime', a.start_time,
              'endTime', a.end_time
            )
            ORDER BY a.weekday
          ) FILTER (WHERE a.admin_user_id IS NOT NULL),
          '[]'::json
        ) AS availability,
        COALESCE(
          json_agg(DISTINCT bd.blackout_date::text)
          FILTER (WHERE bd.admin_user_id IS NOT NULL),
          '[]'::json
        ) AS "blackoutDates"
      FROM admin_users u
      LEFT JOIN admin_weekly_availability a ON a.admin_user_id = u.id
      LEFT JOIN admin_blackout_dates bd ON bd.admin_user_id = u.id
      WHERE u.is_active = TRUE
      GROUP BY u.id
      ORDER BY u.display_name
    `
  );

  return result.rows.map((row) => {
    const availability = row.availability ?? [];
    const days = availability
      .map((entry) => entry.weekday)
      .sort((left, right) => WEEKDAYS.indexOf(left) - WEEKDAYS.indexOf(right));

    return {
      id: row.id,
      username: row.username,
      name: row.displayName,
      zone: row.zone,
      days,
      availability,
      blackoutDates: (row.blackoutDates ?? []).sort()
    };
  });
}

export async function updateAdminAvailability(adminUserId, selectedEntries, blackoutDates = []) {
  await ensureAdminUsersSeeded();

  const normalizedEntries = (selectedEntries ?? [])
    .filter((entry) => WEEKDAYS.includes(entry?.weekday) && entry?.startTime && entry?.endTime)
    .map((entry) => ({
      weekday: entry.weekday,
      startTime: String(entry.startTime).trim(),
      endTime: String(entry.endTime).trim()
    }));
  const normalizedBlackoutDates = Array.from(
    new Set(
      (blackoutDates ?? [])
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean)
    )
  ).sort();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM admin_weekly_availability WHERE admin_user_id = $1`, [adminUserId]);
    await client.query(`DELETE FROM admin_blackout_dates WHERE admin_user_id = $1`, [adminUserId]);
    await client.query(
      `UPDATE admin_users SET availability_configured = TRUE, updated_at = NOW() WHERE id = $1`,
      [adminUserId]
    );

    for (const entry of normalizedEntries) {
      await client.query(
        `
          INSERT INTO admin_weekly_availability (admin_user_id, weekday, start_time, end_time)
          VALUES ($1, $2, $3, $4)
        `,
        [adminUserId, entry.weekday, entry.startTime, entry.endTime]
      );
    }

    for (const blackoutDate of normalizedBlackoutDates) {
      await client.query(
        `
          INSERT INTO admin_blackout_dates (admin_user_id, blackout_date)
          VALUES ($1, $2::date)
        `,
        [adminUserId, blackoutDate]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return listAdminTeamMembers();
}

export async function authenticateAdmin(username, password) {
  await ensureAdminUsersSeeded();

  const normalized = normalizeUsername(username);
  const result = await query(
    `
      SELECT id, username, display_name AS "displayName", password_hash AS "passwordHash", is_active AS "isActive"
      FROM admin_users
      WHERE username = $1
      LIMIT 1
    `,
    [normalized]
  );

  const user = result.rows[0];
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName
  };
}

export async function createAdminSession(adminUser) {
  await ensureAdminUsersSeeded();

  const token = randomBytes(32).toString("hex");
  const sessionId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `
      INSERT INTO admin_sessions (id, admin_user_id, session_token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
    `,
    [sessionId, adminUser.id, hashSessionToken(token), expiresAt.toISOString()]
  );

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearAdminSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (token) {
    await ensureAdminSchema();
    await query(`DELETE FROM admin_sessions WHERE session_token_hash = $1`, [hashSessionToken(token)]);
  }

  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function getAdminSession() {
  await ensureAdminUsersSeeded();

  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const result = await query(
    `
      SELECT
        s.id,
        s.expires_at AS "expiresAt",
        u.id AS "userId",
        u.username,
        u.display_name AS "displayName",
        u.is_active AS "isActive"
      FROM admin_sessions s
      INNER JOIN admin_users u ON u.id = s.admin_user_id
      WHERE s.session_token_hash = $1
      LIMIT 1
    `,
    [hashSessionToken(token)]
  );

  const session = result.rows[0];
  if (!session || !session.isActive) {
    await clearAdminSession();
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await clearAdminSession();
    return null;
  }

  return {
    id: session.id,
    user: {
      id: session.userId,
      username: session.username,
      displayName: session.displayName
    },
    expiresAt: session.expiresAt
  };
}
