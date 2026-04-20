INSERT INTO services (slug, name, price_label, duration_label, description, booking_mode) VALUES
  ('standard-cleaning', 'Standard House Cleaning', '$90 - $200', 'Varies by home size', 'Regular maintenance cleaning priced by bedroom and bath count.', 'published'),
  ('deep-cleaning', 'Deep Cleaning', '$150 - $400', 'Varies by home size', 'First-time or very dirty homes with added detail work.', 'published'),
  ('move-in-move-out', 'Move-in / Move-out Cleaning', '$200 - $450', 'Varies by home size', 'Empty-home detailed cleaning for move-ins, move-outs, and turnovers.', 'published'),
  ('commercial-cleaning', 'Commercial Cleaning', 'On-site estimate', 'Scheduled after walk-through', 'Commercial spaces are priced after a technician visits and reviews the scope of work.', 'estimate')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  price_label = EXCLUDED.price_label,
  duration_label = EXCLUDED.duration_label,
  description = EXCLUDED.description,
  booking_mode = EXCLUDED.booking_mode;

INSERT INTO addons (slug, name, price_label) VALUES
  ('oven-cleaning', 'Inside Oven', '$25 - $40'),
  ('fridge-cleaning', 'Inside Refrigerator', '$25 - $40'),
  ('inside-cabinets', 'Inside Cabinets', '$25 - $50'),
  ('interior-windows', 'Interior Windows', '$5 per window'),
  ('laundry', 'Laundry', '$20 - $30'),
  ('pet-hair-removal', 'Pet Hair Removal', '$25 - $50')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  price_label = EXCLUDED.price_label;
