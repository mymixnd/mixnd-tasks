<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  let { data } = $props()
</script>

<svelte:head>
  <title>Confirm Plan Change</title>
</svelte:head>

<div class="max-w-2xl">
  <h1 class="text-2xl font-bold mb-6">Confirm Plan Change</h1>

  <div class="alert alert-info mb-6">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <div>
      <p class="font-semibold">Review your plan change</p>
      <p class="text-sm">You'll be charged a prorated amount for the change.</p>
    </div>
  </div>

  <div class="card bg-base-200 mb-6">
    <div class="card-body">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 mb-2">Current Plan</h3>
          <p class="text-xl font-bold">{data.currentPlan.name}</p>
          <p class="text-gray-600">{data.currentPlan.price} per month</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-500 mb-2">New Plan</h3>
          <p class="text-xl font-bold">{data.newPlan.name}</p>
          <p class="text-gray-600">{data.newPlan.price} per month</p>
        </div>
      </div>

      <div class="divider"></div>

      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Days remaining in current period:</span>
          <span class="font-semibold">{data.daysRemaining} days</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Prorated {data.isUpgrade ? 'charge' : 'credit'}:</span>
          <span class="font-semibold text-lg">${data.proratedCharge}</span>
        </div>
        {#if data.isUpgrade}
          <p class="text-sm text-gray-500">
            You'll be charged ${data.proratedCharge} now for the upgraded features for the remainder of your billing period.
            Your next full charge of {data.newPlan.price} will be on your renewal date.
          </p>
        {:else}
          <p class="text-sm text-gray-500">
            You'll receive a ${data.proratedCharge} credit applied to your next invoice.
            Your subscription will continue at {data.newPlan.price} per month starting on your renewal date.
          </p>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex gap-4">
    <form method="POST" action="?/confirm" class="flex-1">
      <button type="submit" class="btn btn-primary w-full">
        Confirm {data.isUpgrade ? 'Upgrade' : 'Downgrade'}
      </button>
    </form>
    <a href="/account/billing" class="btn btn-ghost flex-1">
      Cancel
    </a>
  </div>
</div>