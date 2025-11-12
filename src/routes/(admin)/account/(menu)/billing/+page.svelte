<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { page } from "$app/stores"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte"
  import {
    pricingPlans,
    defaultPlanId,
  } from "../../../../(marketing)/pricing/pricing_plans"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  let { data } = $props()

  let currentPlanId = data.currentPlanId ?? defaultPlanId
  let currentPlanName = pricingPlans.find(
    (x) => x.id === data.currentPlanId,
  )?.name

  // Format subscription details
  let subscriptionStatus = data.subscriptionStatus
  let isCanceled = subscriptionStatus === 'canceled' || subscriptionStatus === 'canceling'
  let periodEndDate = data.currentPeriodEnd
    ? new Date(data.currentPeriodEnd * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  // Check for success messages
  let showSubscribedMessage = $page.url.searchParams.get('subscribed') === 'true'
  let showUpdatedMessage = $page.url.searchParams.get('updated') === 'true'
  let showCanceledMessage = $page.url.searchParams.get('canceled') === 'true'
  let showReactivatedMessage = $page.url.searchParams.get('reactivated') === 'true'

  // Handle cancel confirmation
  function handleCancelSubmit(event: Event) {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      event.preventDefault()
    }
  }
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-2">
  {data.isActiveCustomer ? "Billing" : "Select a Plan"}
</h1>
<div>
  View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.
</div>

{#if showSubscribedMessage}
  <div class="alert alert-success mt-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Subscription activated successfully!</span>
  </div>
{/if}

{#if showUpdatedMessage}
  <div class="alert alert-success mt-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Subscription updated successfully! Changes will be reflected immediately.</span>
  </div>
{/if}

{#if showCanceledMessage}
  <div class="alert alert-warning mt-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <span>Subscription canceled. Your plan will remain active until {periodEndDate}.</span>
  </div>
{/if}

{#if showReactivatedMessage}
  <div class="alert alert-success mt-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Subscription reactivated! Your plan will renew automatically.</span>
  </div>
{/if}

{#if !data.isActiveCustomer}
  <div class="mt-8">
    <PricingModule {currentPlanId} callToAction="Select Plan" center={false} />
  </div>

  {#if data.hasEverHadSubscription}
    <div class="mt-10">
      <a href="/account/billing/manage" class="link">View past invoices</a>
    </div>
  {/if}
{:else}
  <div class="card bg-base-200 mt-8">
    <div class="card-body">
      <h2 class="card-title">Subscription Details</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <p class="text-sm text-gray-500">Current Plan</p>
          <p class="text-lg font-semibold">{currentPlanName || "Unknown"}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Status</p>
          <p class="text-lg font-semibold">
            {subscriptionStatus
              ? (data.cancelAtPeriodEnd ? "Canceling (active until period end)" : subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1))
              : "Unknown"}
          </p>
        </div>
        {#if periodEndDate}
          <div>
            <p class="text-sm text-gray-500">{data.cancelAtPeriodEnd ? "Active Until" : "Renews On"}</p>
            <p class="text-lg font-semibold">{periodEndDate}</p>
          </div>
        {/if}
      </div>

      <div class="card-actions justify-end mt-6">
        {#if data.cancelAtPeriodEnd}
          <form method="POST" action="?/reactivateSubscription">
            <button type="submit" class="btn btn-success">
              Reactivate Subscription
            </button>
          </form>
        {:else}
          <form method="POST" action="?/cancelSubscription" on:submit={handleCancelSubmit}>
            <button type="submit" class="btn btn-error">
              Cancel Subscription
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>

  <div class="mt-10">
    <h2 class="text-xl font-bold mb-4">Change Plan</h2>
    <p class="text-sm text-gray-600 mb-6">
      Upgrade or downgrade your subscription. You'll see full details before confirming.
    </p>
    <div class="flex flex-col lg:flex-row gap-10 flex-wrap">
      {#each pricingPlans as plan}
        <div
          class="flex-none card card-bordered {plan.id === currentPlanId ? 'border-primary' : 'border-gray-200'} shadow-xl flex-1 grow min-w-[260px] max-w-[310px] p-6"
        >
          <div class="flex flex-col h-full">
            <div class="text-xl font-bold">{plan.name}</div>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">
              {plan.description}
            </p>
            <div class="mt-auto pt-4 text-sm text-gray-600">
              Plan Includes:
              <ul class="list-disc list-inside mt-2 space-y-1">
                {#each plan.features as feature}
                  <li class="">{feature}</li>
                {/each}
              </ul>
            </div>
            <div class="pt-8">
              <span class="text-4xl font-bold">{plan.price}</span>
              <span class="text-gray-400">{plan.priceIntervalName}</span>
              <div class="mt-6 pt-4 flex-1 flex flex-row items-center">
                {#if plan.id === currentPlanId}
                  <div
                    class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default"
                  >
                    Current Plan
                  </div>
                {:else if plan.stripe_price_id}
                  <a
                    href={"/account/billing/confirm-change/" + plan.stripe_price_id}
                    class="btn btn-primary w-[80%] mx-auto"
                  >
                    Change to {plan.name}
                  </a>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if data.invoices && data.invoices.length > 0}
  <div class="mt-10">
    <h2 class="text-xl font-bold mb-4">Billing History</h2>
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {#each data.invoices as invoice}
            <tr>
              <td>{new Date(invoice.date * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td>${invoice.amount.toFixed(2)} {invoice.currency}</td>
              <td>
                <span class="badge {invoice.status === 'paid' ? 'badge-success' : invoice.status === 'open' ? 'badge-warning' : 'badge-error'}">
                  {invoice.status}
                </span>
              </td>
              <td>
                {#if invoice.pdfUrl}
                  <a href={invoice.pdfUrl} target="_blank" class="link link-primary">Download PDF</a>
                {:else if invoice.hostedUrl}
                  <a href={invoice.hostedUrl} target="_blank" class="link link-primary">View Invoice</a>
                {:else}
                  <span class="text-gray-400">N/A</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
