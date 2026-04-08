<script setup lang="ts">
import LegacyContentLayout from '@/components/directory/LegacyContentLayout.vue'
</script>

<template>
  <LegacyContentLayout
    page-heading="About"
    page-subheading="DBT provider availability in Minnesota"
  >
    <p class="mb-4">
      DBTsearch is a website that allows clinicians and prospective clients to search for certified DBT
      providers in Minnesota and more specifically, locate providers that have current availability.
      Dialectical Behavior Therapy (DBT) is a highly structured, empirically supported therapy that helps
      people learn to manage intense emotions and get behaviors under control. It is used to treat mental
      health conditions rooted in severe emotional and behavioral dysregulation often present in untreated
      Borderline Personality Disorder, Posttraumatic Stress Disorder, Bipolar Disorder, Major Depression,
      and more.
    </p>
    <p class="mb-4">
      Frequently people in need of DBT are in crisis and are at high risk for suicide, and are often unable
      to tolerate the patience required to find available providers. Referring providers are busy and often
      do not have the time to call around in order to provide reliable referral information to clients. This
      is because the current process of finding an available provider is cumbersome and inefficient, combined
      with the reality of high demand and low access to certified DBT programs.
    </p>
    <p class="mb-6">
      The Minnesota Department of Human Services offers a single page with a long list of certified DBT
      providers but the only way to discover availability is to go through the list and call or email each
      clinic. DBTsearch aims to ease the process of finding access to this treatment by offering a searchable
      list of DBT providers where those with current availability appear first. Clients get faster access to
      treatment, providers have more time, and treatment programs remain full: win-win-win!
    </p>
    <RouterLink
      to="/directory"
      class="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90"
    >
      Find DBT Providers
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="ml-2 h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </RouterLink>
  </LegacyContentLayout>
</template>
