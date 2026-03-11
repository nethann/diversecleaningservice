export const servicePages = [
  {
    slug: "house-cleaning",
    name: "House Cleaning",
    shortName: "House Cleaning",
    heroTitle: "House cleaning that keeps your home calm, fresh, and guest-ready.",
    description:
      "Our house cleaning service is designed for homes that need dependable upkeep and a polished finish. We focus on kitchens, bathrooms, bedrooms, floors, and high-use living spaces so your home feels consistently cared for.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    alt: "Bright tidy bedroom with fresh linens",
    includes: ["Kitchen and bathroom cleaning", "Dusting and surface care", "Vacuuming and mopping", "General tidying of lived-in spaces"]
  },
  {
    slug: "recurring-cleaning-service",
    name: "Recurring Cleaning Service",
    shortName: "Recurring Cleaning",
    heroTitle: "Recurring cleaning built around your routine.",
    description:
      "Choose weekly, biweekly, or monthly visits to keep your home consistently clean without the stress of starting from scratch each time. Recurring service is perfect for busy households that want a home that always feels maintained.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    alt: "Clean modern kitchen with organized counters",
    includes: ["Flexible recurring schedules", "Consistent cleaning standards", "Reliable care for kitchens and baths", "Simple online rebooking"]
  },
  {
    slug: "deep-cleaning-service",
    name: "Deep Cleaning Service",
    shortName: "Deep Cleaning",
    heroTitle: "Deep cleaning for homes that need extra detail and extra care.",
    description:
      "Our deep cleaning service goes beyond routine maintenance to handle buildup, neglected areas, and the details that make a home feel truly reset. It is a great fit for first-time visits, seasonal refreshes, or homes needing a more intensive clean.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    alt: "Detailed clean bathroom with bright finishes",
    includes: ["Extra kitchen and bathroom detail", "Baseboards and high-touch areas", "More intensive surface work", "Ideal first-time service option"]
  },
  {
    slug: "move-in-move-out-cleaning",
    name: "Move-In/Move-Out Cleaning",
    shortName: "Move-In/Move-Out",
    heroTitle: "Move-in and move-out cleaning for a truly fresh start.",
    description:
      "Whether you are preparing to settle in or hand over a property, our move-in and move-out cleaning service helps the space feel ready. We focus on the empty-home details that matter during transitions and turnovers.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    alt: "Empty clean living room ready for move in",
    includes: ["Empty-home detailed cleaning", "Cabinets and interior wipe-downs", "Appliance exterior cleaning", "Ready-for-inspection presentation"]
  }
];

export function getServicePage(slug) {
  return servicePages.find((service) => service.slug === slug);
}
