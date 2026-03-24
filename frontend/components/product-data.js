export const timeSlots = ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"];

export const services = [
  {
    name: "Standard House Cleaning",
    slug: "standard-cleaning",
    price: 90,
    priceLabel: "$90 - $200",
    duration: "3 to 5 hours",
    description: "Regular maintenance cleaning for lived-in homes with pricing based on bedroom and bath count.",
    badge: "Most popular"
  },
  {
    name: "Deep Cleaning",
    slug: "deep-cleaning",
    price: 150,
    priceLabel: "$150 - $400",
    duration: "4 to 7 hours",
    description: "Best for first-time visits or very dirty homes that need extra detail work and scrubbing.",
    badge: "Best for first visits"
  },
  {
    name: "Move-in / Move-out Cleaning",
    slug: "move-in-move-out",
    price: 200,
    priceLabel: "$200 - $450",
    duration: "5 to 8 hours",
    description: "Detailed empty-home cleaning for move-ins, move-outs, and turnover prep.",
    badge: "Property reset"
  },
  {
    name: "Airbnb Cleaning",
    slug: "airbnb-cleaning",
    price: 120,
    priceLabel: "Custom quote",
    duration: "2 to 4 hours",
    description: "Fast turnover cleaning for short-term rentals, guest-ready resets, and restocking support.",
    badge: "Turnover ready"
  }
];

export const addons = [
  { name: "Oven cleaning", slug: "oven-cleaning", price: 35, turnaround: "+30 min" },
  { name: "Fridge cleaning", slug: "fridge-cleaning", price: 25, turnaround: "+20 min" },
  { name: "Interior windows", slug: "interior-windows", price: 30, turnaround: "+25 min" },
  { name: "Pet hair removal", slug: "pet-hair-removal", price: 20, turnaround: "+15 min" }
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

export const initialBookings = [
  {
    id: "DCS-2401",
    customer: "Rachel Green",
    service: "Deep Cleaning",
    serviceSlug: "deep-cleaning",
    date: "2026-03-11",
    time: "10:00 AM",
    cleaner: "Maya Thompson",
    cleanerId: "team-1",
    address: "124 Park Row, Downtown",
    status: "assigned",
    amount: 229,
    paymentStatus: "Paid in full"
  },
  {
    id: "DCS-2402",
    customer: "Taylor Kim",
    service: "Airbnb Cleaning",
    serviceSlug: "airbnb-cleaning",
    date: "2026-03-11",
    time: "3:00 PM",
    cleaner: "Jordan Lee",
    cleanerId: "team-2",
    address: "88 Orchard Ave, East Austin",
    status: "confirmed",
    amount: 149,
    paymentStatus: "Deposit paid"
  },
  {
    id: "DCS-2403",
    customer: "Noah Perez",
    service: "Standard Cleaning",
    serviceSlug: "standard-cleaning",
    date: "2026-03-12",
    time: "8:00 AM",
    cleaner: "Sofia Patel",
    cleanerId: "team-3",
    address: "403 Willow St, Northside",
    status: "assigned",
    amount: 129,
    paymentStatus: "Pending balance"
  },
  {
    id: "DCS-2404",
    customer: "Erin Watts",
    service: "Move-in / Move-out Cleaning",
    serviceSlug: "move-in-move-out",
    date: "2026-03-12",
    time: "12:30 PM",
    cleaner: "Nico Alvarez",
    cleanerId: "team-4",
    address: "21 River Bend, Riverside",
    status: "confirmed",
    amount: 279,
    paymentStatus: "Deposit paid"
  }
];

export const adminStats = [
  { label: "Jobs scheduled today", value: "18", detail: "+4 from yesterday" },
  { label: "Staff utilization", value: "86%", detail: "4 teams active" },
  { label: "Payments captured", value: "$4,260", detail: "92% success rate" },
  { label: "Automations sent", value: "42", detail: "Email and SMS reminders" }
];

export const notificationFeed = [
  { id: "NF-1", title: "Booking confirmed", channel: "Email + SMS", audience: "Rachel Green", status: "Delivered" },
  { id: "NF-2", title: "Cleaner dispatched", channel: "SMS", audience: "Taylor Kim", status: "Queued" },
  { id: "NF-3", title: "Invoice sent", channel: "Email", audience: "Noah Perez", status: "Delivered" }
];

export const paymentQueue = [
  { id: "INV-1012", customer: "Rachel Green", amount: "$229.00", status: "Paid", due: "Mar 11" },
  { id: "INV-1013", customer: "Taylor Kim", amount: "$104.30", status: "Deposit paid", due: "Mar 11" },
  { id: "INV-1014", customer: "Noah Perez", amount: "$90.30", status: "Due after service", due: "Mar 12" }
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
