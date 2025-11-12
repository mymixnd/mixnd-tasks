import { env } from "$env/dynamic/private"
import { error, redirect } from "@sveltejs/kit"
import Stripe from "stripe"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../../../subscription_helpers.server"
import { pricingPlans } from "../../../../../../(marketing)/pricing/pricing_plans"
import type { Actions, PageServerLoad } from "./$types"

const stripe = new Stripe(env.PRIVATE_STRIPE_API_KEY!, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
  params,
  locals: { safeGetSession, supabaseServiceRole },
}) => {
  const { session, user } = await safeGetSession()
  if (!session || !user?.id) {
    throw redirect(303, "/login")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    user,
  })
  if (idError || !customerId) {
    console.error("Error creating customer id", idError)
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  const { primarySubscription } = await fetchSubscription({
    customerId,
  })

  if (!primarySubscription) {
    // No current subscription, redirect to regular checkout
    throw redirect(303, `/account/subscribe/${params.priceId}`)
  }

  // Find current and new plans
  const currentPlan = pricingPlans.find(
    (p) => p.stripe_product_id === (primarySubscription.stripeSubscription?.items.data[0]?.price.product ?? "")
  )
  const newPlan = pricingPlans.find((p) => p.stripe_price_id === params.priceId)

  if (!currentPlan || !newPlan) {
    throw error(404, "Plan not found")
  }

  // Calculate proration (rough estimate)
  const currentSubscription = primarySubscription.stripeSubscription!
  const periodEnd = currentSubscription.current_period_end
  const now = Math.floor(Date.now() / 1000)
  const daysRemaining = Math.ceil((periodEnd - now) / 86400)
  const daysInPeriod = Math.ceil((periodEnd - currentSubscription.current_period_start) / 86400)

  const currentPrice = parseFloat(currentPlan.price.replace("$", ""))
  const newPrice = parseFloat(newPlan.price.replace("$", ""))
  const unusedAmount = (currentPrice / daysInPeriod) * daysRemaining
  const newChargeForRemaining = (newPrice / daysInPeriod) * daysRemaining
  const proratedCharge = Math.max(0, newChargeForRemaining - unusedAmount)

  return {
    currentPlan,
    newPlan,
    priceId: params.priceId,
    daysRemaining,
    proratedCharge: proratedCharge.toFixed(2),
    isUpgrade: newPrice > currentPrice,
  }
}

export const actions: Actions = {
  confirm: async ({ params, locals: { safeGetSession, supabaseServiceRole } }) => {
    const { session, user } = await safeGetSession()
    if (!session) {
      throw redirect(303, "/login")
    }

    const { error: idError, customerId } = await getOrCreateCustomerId({
      supabaseServiceRole,
      user,
    })
    if (idError || !customerId) {
      throw error(500, "Unknown error. If issue persists, please contact us.")
    }

    const { primarySubscription } = await fetchSubscription({
      customerId,
    })

    if (!primarySubscription?.stripeSubscription) {
      throw error(400, "No active subscription found")
    }

    const currentSubscription = primarySubscription.stripeSubscription
    const subscriptionItemId = currentSubscription.items.data[0].id

    try {
      await stripe.subscriptions.update(currentSubscription.id, {
        items: [
          {
            id: subscriptionItemId,
            price: params.priceId,
          },
        ],
        proration_behavior: 'always_invoice',
      })
    } catch (e) {
      console.error("Error updating subscription", e)
      throw error(500, "Unable to update subscription. If issue persists please contact us.")
    }

    throw redirect(303, "/account/billing?updated=true")
  },
}