CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_label TEXT NOT NULL,
  duration_label TEXT NOT NULL,
  description TEXT NOT NULL,
  booking_mode TEXT NOT NULL CHECK (booking_mode IN ('published', 'estimate'))
);

CREATE TABLE IF NOT EXISTS addons (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  service_slug TEXT NOT NULL REFERENCES services(slug),
  service_name TEXT NOT NULL,
  home_size TEXT,
  bath_count TEXT,
  address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  cleaner_id TEXT NOT NULL,
  cleaner_name TEXT NOT NULL,
  assigned_cleaners JSONB NOT NULL DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  recurring_frequency TEXT NOT NULL DEFAULT 'one-time',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_addons (
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_slug TEXT NOT NULL REFERENCES addons(slug),
  addon_name TEXT NOT NULL,
  addon_price_label TEXT NOT NULL,
  PRIMARY KEY (booking_id, addon_slug)
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_cleaner_slot
  ON bookings (cleaner_id, scheduled_date, scheduled_time)
  WHERE status <> 'cancelled';
