import { env } from "$env/dynamic/private"
import { error, redirect } from "@sveltejs/kit"
import Stripe from "stripe"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
const stripe = new Stripe(env.PRIVATE_STRIPE_API_KEY!, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
  params,
  url,
  locals: { safeGetSession, supabaseServiceRole },
}) => {
  const { session, user } = await safeGetSession()
  if (!session) {
    throw redirect(303, "/login")
  }

  if (params.slug === "free_plan") {
    // plan with no stripe_price_id. Redirect to account home
    throw redirect(303, "/account")
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

  // If user has existing subscription, upgrade/downgrade it instead of creating new one
  if (primarySubscription?.stripeSubscription) {
    const currentSubscription = primarySubscription.stripeSubscription
    const subscriptionItemId = currentSubscription.items.data[0].id

    try {
      // Update the subscription to the new price
      await stripe.subscriptions.update(currentSubscription.id, {
        items: [
          {
            id: subscriptionItemId,
            price: params.slug,
          },
        ],
        proration_behavior: 'always_invoice', // Stripe handles proration automatically
      })
    } catch (e) {
      console.error("Error updating subscription", e)
      throw error(500, "Unable to update subscription. If issue persists please contact us.")
    }

    // Redirect to billing page to show updated subscription (outside try-catch)
    throw redirect(303, "/account/billing?updated=true")
  }

  // No existing subscription - create new checkout session
  let checkoutUrl
  try {
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: params.slug,
          quantity: 1,
        },
      ],
      customer: customerId,
      mode: "subscription",
      success_url: `${url.origin}/account/billing?subscribed=true`,
      cancel_url: `${url.origin}/account/billing`,
    })
    checkoutUrl = stripeSession.url
  } catch (e) {
    console.error("Error creating checkout session", e)
    throw error(500, "Unknown Error (SSE): If issue persists please contact us.")
  }

  throw redirect(303, checkoutUrl ?? "/pricing")
}
