import { env } from "$env/dynamic/private"
import { error, redirect, fail } from "@sveltejs/kit"
import Stripe from "stripe"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../subscription_helpers.server"
import type { Actions, PageServerLoad } from "./$types"

const stripe = new Stripe(env.PRIVATE_STRIPE_API_KEY!, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
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

  const {
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr,
  } = await fetchSubscription({
    customerId,
  })
  if (fetchErr) {
    console.error("Error fetching subscription", fetchErr)
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  // Fetch invoice history
  let invoices = []
  try {
    const stripeInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    })
    invoices = stripeInvoices.data.map((invoice) => ({
      id: invoice.id,
      date: invoice.created,
      amount: invoice.amount_paid / 100, // Convert cents to dollars
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }))
  } catch (e) {
    console.error("Error fetching invoices", e)
    // Don't fail the page load if invoices fail
  }

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
    subscriptionStatus: primarySubscription?.stripeSubscription?.status,
    currentPeriodEnd: primarySubscription?.stripeSubscription?.current_period_end,
    subscriptionId: primarySubscription?.stripeSubscription?.id,
    cancelAtPeriodEnd: primarySubscription?.stripeSubscription?.cancel_at_period_end ?? false,
    invoices,
  }
}

export const actions: Actions = {
  cancelSubscription: async ({ locals: { safeGetSession, supabaseServiceRole } }) => {
    const { session, user } = await safeGetSession()
    if (!session || !user?.id) {
      throw redirect(303, "/login")
    }

    const { error: idError, customerId } = await getOrCreateCustomerId({
      supabaseServiceRole,
      user,
    })
    if (idError || !customerId) {
      return fail(500, { message: "Unknown error. If issue persists, please contact us." })
    }

    const { primarySubscription } = await fetchSubscription({
      customerId,
    })

    if (!primarySubscription?.stripeSubscription) {
      return fail(400, { message: "No active subscription found" })
    }

    try {
      await stripe.subscriptions.update(primarySubscription.stripeSubscription.id, {
        cancel_at_period_end: true,
      })
    } catch (e) {
      console.error("Error canceling subscription", e)
      return fail(500, { message: "Unable to cancel subscription. Please try again." })
    }

    throw redirect(303, "/account/billing?canceled=true")
  },

  reactivateSubscription: async ({ locals: { safeGetSession, supabaseServiceRole } }) => {
    const { session, user } = await safeGetSession()
    if (!session || !user?.id) {
      throw redirect(303, "/login")
    }

    const { error: idError, customerId } = await getOrCreateCustomerId({
      supabaseServiceRole,
      user,
    })
    if (idError || !customerId) {
      return fail(500, { message: "Unknown error. If issue persists, please contact us." })
    }

    const { primarySubscription } = await fetchSubscription({
      customerId,
    })

    if (!primarySubscription?.stripeSubscription) {
      return fail(400, { message: "No subscription found" })
    }

    try {
      await stripe.subscriptions.update(primarySubscription.stripeSubscription.id, {
        cancel_at_period_end: false,
      })
    } catch (e) {
      console.error("Error reactivating subscription", e)
      return fail(500, { message: "Unable to reactivate subscription. Please try again." })
    }

    throw redirect(303, "/account/billing?reactivated=true")
  },
}
