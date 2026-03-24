export const servicePages = [
  {
    slug: "house-cleaning",
    name: "House Cleaning",
    shortName: "House Cleaning",
    heroTitle: "Simple, dependable house cleaning for regular home maintenance.",
    description:
      "Our standard house cleaning is designed for routine upkeep. Pricing is based on your home size, and every visit focuses on the essentials that keep your home fresh, tidy, and easy to maintain.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    alt: "Bright tidy bedroom with fresh linens",
    priceLabel: "$90 - $200",
    pricingNote: "Regular maintenance cleaning priced by bedroom and bath count.",
    pricingTiers: [
      { size: "1 Bedroom / 1 Bath", price: "$90 - $110" },
      { size: "2 Bedroom / 1-2 Bath", price: "$110 - $130" },
      { size: "3 Bedroom / 2 Bath", price: "$130 - $160" },
      { size: "4 Bedroom / 2-3 Bath", price: "$160 - $200" }
    ],
    includesHeading: "Includes",
    includes: [
      "Dusting",
      "Vacuuming",
      "Mopping floors",
      "Bathroom cleaning",
      "Kitchen cleaning",
      "Trash removal",
      "Wiping surfaces"
    ]
  },
  {
    slug: "recurring-cleaning-service",
    name: "Recurring Cleaning Service",
    shortName: "Recurring Cleaning",
    heroTitle: "Recurring cleaning built around your weekly, biweekly, or monthly routine.",
    description:
      "Recurring service is available for homes that want ongoing maintenance on a regular schedule. Pricing is confirmed based on your home size, visit frequency, and the condition of the space.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    alt: "Clean modern kitchen with organized counters",
    priceLabel: "Request quote",
    pricingNote: "Recurring plans are quoted directly based on visit frequency and home details.",
    pricingTiers: [
      { size: "Weekly plans", price: "Request quote" },
      { size: "Biweekly plans", price: "Request quote" },
      { size: "Monthly plans", price: "Request quote" }
    ],
    includesHeading: "Typical recurring service includes",
    includes: [
      "Dusting",
      "Vacuuming",
      "Mopping floors",
      "Bathroom cleaning",
      "Kitchen cleaning",
      "Trash removal",
      "Wiping surfaces"
    ]
  },
  {
    slug: "deep-cleaning-service",
    name: "Deep Cleaning Service",
    shortName: "Deep Cleaning",
    heroTitle: "Deep cleaning for first-time visits and homes that need extra attention.",
    description:
      "Our deep cleaning service goes beyond routine maintenance and is ideal for first-time service or homes that are very dirty. It includes everything in standard cleaning plus added detail work throughout the home.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    alt: "Detailed clean bathroom with bright finishes",
    priceLabel: "$150 - $400",
    pricingNote: "Best for first-time or heavily lived-in homes.",
    pricingTiers: [
      { size: "1 Bedroom", price: "$150 - $180" },
      { size: "2 Bedroom", price: "$180 - $220" },
      { size: "3 Bedroom", price: "$220 - $300" },
      { size: "4 Bedroom", price: "$300 - $400" }
    ],
    includesHeading: "Includes everything in standard cleaning plus",
    includes: [
      "Baseboards",
      "Inside appliances",
      "Window sills",
      "Heavy bathroom scrubbing",
      "Cabinet wipe-down"
    ]
  },
  {
    slug: "move-in-move-out-cleaning",
    name: "Move-In/Move-Out Cleaning",
    shortName: "Move-In/Move-Out",
    heroTitle: "Move-in and move-out cleaning for empty homes and fresh starts.",
    description:
      "This service is built for transitions, turnovers, and empty-home resets. We focus on the detailed areas most customers want addressed before move-in, after move-out, or ahead of inspection.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    alt: "Empty clean living room ready for move in",
    priceLabel: "$200 - $450",
    pricingNote: "Pricing depends on home size and the level of empty-home detail needed.",
    pricingTiers: [
      { size: "1-2 Bedroom", price: "$200 - $275" },
      { size: "3 Bedroom", price: "$275 - $350" },
      { size: "4 Bedroom", price: "$350 - $450" }
    ],
    includesHeading: "Includes",
    includes: [
      "Inside cabinets",
      "Inside refrigerator",
      "Inside oven",
      "Closets",
      "Baseboards",
      "Deep bathroom cleaning"
    ]
  }
];

export function getServicePage(slug) {
  return servicePages.find((service) => service.slug === slug);
}
