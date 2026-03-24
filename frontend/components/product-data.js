export const timeSlots = ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"];

export const services = [
  {
    name: "Standard House Cleaning",
    slug: "standard-cleaning",
    priceLabel: "$90 - $200",
    duration: "Varies by home size",
    description: "Regular maintenance cleaning priced by bedroom and bath count.",
    badge: "Most popular"
  },
  {
    name: "Deep Cleaning",
    slug: "deep-cleaning",
    priceLabel: "$150 - $400",
    duration: "Varies by home size",
    description: "First-time or very dirty homes with added detail work.",
    badge: "Best for first visits"
  },
  {
    name: "Move-in / Move-out Cleaning",
    slug: "move-in-move-out",
    priceLabel: "$200 - $450",
    duration: "Varies by home size",
    description: "Empty-home detailed cleaning for move-ins, move-outs, and turnovers.",
    badge: "Property reset"
  },
  {
    name: "Airbnb Cleaning",
    slug: "airbnb-cleaning",
    priceLabel: "Request quote",
    duration: "Varies by turnover scope",
    description: "Short-term rental turnovers are quoted based on layout, turnover needs, and visit frequency.",
    badge: "Custom quote"
  }
];

export const addons = [
  { name: "Oven cleaning", slug: "oven-cleaning", priceLabel: "Extra charge" },
  { name: "Fridge cleaning", slug: "fridge-cleaning", priceLabel: "Extra charge" },
  { name: "Interior windows", slug: "interior-windows", priceLabel: "Extra charge" },
  { name: "Pet hair removal", slug: "pet-hair-removal", priceLabel: "Extra charge" }
];

export const testimonials = [
  {
    name: "Dana S.",
    role: "Recurring customer",
    quote: "Booking took less than two minutes and the cleaner arrived fully briefed. The experience felt premium."
  },
  {
    name: "Luis M.",
    role: "Airbnb host",
    quote: "The dashboard makes recurring Airbnb turnovers simple. diversecleaningservice feels built for operators, not just homeowners."
  },
  {
    name: "Priya R.",
    role: "Move-out customer",
    quote: "Clear reminders, great communication, and the place looked staged when they finished."
  }
];

export const serviceAreas = [
  { name: "Downtown", eta: "Same day", coverage: "High-rise apartments and condos" },
  { name: "Northside", eta: "Next day", coverage: "Family homes and recurring plans" },
  { name: "East Austin", eta: "Same day", coverage: "Studios, lofts, and rentals" },
  { name: "Riverside", eta: "48 hours", coverage: "Move-outs and student housing" }
];

export const team = [
  {
    id: "team-1",
    name: "Maya Thompson",
    status: "On route",
    zone: "Downtown",
    rating: 4.9,
    jobsToday: 4,
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    slots: ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM"]
  },
  {
    id: "team-2",
    name: "Jordan Lee",
    status: "Available",
    zone: "Northside",
    rating: 4.8,
    jobsToday: 3,
    days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"]
  },
  {
    id: "team-3",
    name: "Sofia Patel",
    status: "In job",
    zone: "East Austin",
    rating: 5,
    jobsToday: 4,
    days: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"]
  },
  {
    id: "team-4",
    name: "Nico Alvarez",
    status: "Available",
    zone: "Riverside",
    rating: 4.7,
    jobsToday: 2,
    days: ["Monday", "Tuesday", "Wednesday", "Saturday"],
    slots: ["8:00 AM", "10:00 AM", "3:00 PM", "5:30 PM"]
  }
];

export const initialBookings = [];

export const adminStats = [
  { label: "Jobs scheduled today", value: "18", detail: "+4 from yesterday" },
  { label: "Staff utilization", value: "86%", detail: "4 teams active" },
  { label: "Payments captured", value: "Available on request", detail: "Pricing now follows manual quote ranges" },
  { label: "Automations sent", value: "42", detail: "Email and SMS reminders" }
];

export const notificationFeed = [
  { id: "NF-1", title: "Booking confirmed", channel: "Email + SMS", audience: "Rachel Green", status: "Delivered" },
  { id: "NF-2", title: "Cleaner dispatched", channel: "SMS", audience: "Taylor Kim", status: "Queued" },
  { id: "NF-3", title: "Invoice sent", channel: "Email", audience: "Noah Perez", status: "Delivered" }
];

export const paymentQueue = [
  { id: "INV-1012", customer: "Rachel Green", amount: "Quoted range", status: "Confirmed", due: "Mar 11" },
  { id: "INV-1013", customer: "Taylor Kim", amount: "Quoted range", status: "Awaiting final quote", due: "Mar 11" },
  { id: "INV-1014", customer: "Noah Perez", amount: "Quoted range", status: "Due after service", due: "Mar 12" }
];

export const staffSchedule = [
  { day: "Wednesday", assigned: 18, open: 3, onCall: 2 },
  { day: "Thursday", assigned: 14, open: 6, onCall: 1 },
  { day: "Friday", assigned: 16, open: 4, onCall: 2 },
  { day: "Saturday", assigned: 11, open: 7, onCall: 2 }
];

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}
