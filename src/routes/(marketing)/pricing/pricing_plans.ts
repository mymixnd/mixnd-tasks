export const defaultPlanId = "free"

export const pricingPlans = [
  {
    id: "free",
    name: "Free",
    description: "A free plan to get you started!",
    price: "$0",
    priceIntervalName: "per month",
    stripe_price_id: null,
    features: ["MIT Licence", "Fast Performance", "Stripe Integration"],
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "Professional task management with advanced features",
    price: "$10",
    priceIntervalName: "per month",
    stripe_price_id: "price_1SSSZs32UtC6QOGWMF5FQ6mm",
    stripe_product_id: "prod_TPH7wa68Si2kMf",
    features: [
      "Everything in Free",
      "Advanced task management",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "Full-featured task management for teams",
    price: "$25",
    priceIntervalName: "per month",
    stripe_price_id: "price_1SSSZw32UtC6QOGWF2Bo63Ys",
    stripe_product_id: "prod_TPH7I7X2MxHUwO",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced analytics",
    ],
  },
]
