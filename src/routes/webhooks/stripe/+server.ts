import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import Stripe from 'stripe'

const stripe = new Stripe(env.PRIVATE_STRIPE_API_KEY!, { apiVersion: '2023-08-16' })

export const POST: RequestHandler = async ({ request, locals: { supabaseServiceRole } }) => {
	const signature = request.headers.get('stripe-signature')
	const webhookSecret = env.PRIVATE_STRIPE_WEBHOOK_SECRET

	if (!signature || !webhookSecret) {
		console.error('Missing stripe signature or webhook secret')
		return json({ error: 'Webhook signature or secret missing' }, { status: 400 })
	}

	let event: Stripe.Event
	try {
		const body = await request.text()
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
	} catch (err) {
		console.error('Webhook signature verification failed:', err)
		return json({ error: 'Invalid signature' }, { status: 400 })
	}

	console.log(`Processing webhook event: ${event.type}`)

	try {
		switch (event.type) {
			case 'customer.subscription.created':
			case 'customer.subscription.updated': {
				const subscription = event.data.object as Stripe.Subscription
				await handleSubscriptionChange(subscription, supabaseServiceRole)
				break
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription
				await handleSubscriptionDeletion(subscription, supabaseServiceRole)
				break
			}

			case 'invoice.payment_succeeded': {
				const invoice = event.data.object as Stripe.Invoice
				console.log(`Payment succeeded for customer: ${invoice.customer}`)
				// Subscription is already updated via subscription.updated event
				break
			}

			case 'invoice.payment_failed': {
				const invoice = event.data.object as Stripe.Invoice
				console.error(`Payment failed for customer: ${invoice.customer}`)
				// Handle payment failure (send email, update status, etc.)
				// Stripe will retry automatically based on your settings
				break
			}

			default:
				console.log(`Unhandled event type: ${event.type}`)
		}

		return json({ received: true })
	} catch (error) {
		console.error('Error processing webhook:', error)
		return json({ error: 'Webhook processing failed' }, { status: 500 })
	}
}

async function handleSubscriptionChange(
	subscription: Stripe.Subscription,
	supabaseServiceRole: any
) {
	const customerId = subscription.customer as string
	const status = subscription.status
	const currentPeriodEnd = subscription.current_period_end
		? new Date(subscription.current_period_end * 1000)
		: null

	// Find user by stripe customer ID
	const { data: customer, error: customerError } = await supabaseServiceRole
		.from('stripe_customers')
		.select('user_id')
		.eq('stripe_customer_id', customerId)
		.single()

	if (customerError || !customer) {
		console.error('Customer not found in database:', customerId)
		return
	}

	// Update or create subscription record in database
	const { error: upsertError } = await supabaseServiceRole
		.from('stripe_customers')
		.update({
			subscription_status: status,
			subscription_id: subscription.id,
			current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', customer.user_id)

	if (upsertError) {
		console.error('Error updating subscription in database:', upsertError)
		throw upsertError
	}

	console.log(`Subscription ${status} for user ${customer.user_id}`)
}

async function handleSubscriptionDeletion(
	subscription: Stripe.Subscription,
	supabaseServiceRole: any
) {
	const customerId = subscription.customer as string

	// Find user by stripe customer ID
	const { data: customer, error: customerError } = await supabaseServiceRole
		.from('stripe_customers')
		.select('user_id')
		.eq('stripe_customer_id', customerId)
		.single()

	if (customerError || !customer) {
		console.error('Customer not found in database:', customerId)
		return
	}

	// Clear subscription data
	const { error: updateError } = await supabaseServiceRole
		.from('stripe_customers')
		.update({
			subscription_status: 'canceled',
			subscription_id: null,
			current_period_end: null,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', customer.user_id)

	if (updateError) {
		console.error('Error clearing subscription in database:', updateError)
		throw updateError
	}

	console.log(`Subscription canceled for user ${customer.user_id}`)
}