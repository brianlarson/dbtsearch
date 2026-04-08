<script setup lang="ts">
/** Matches Storybook loading row: spinner + “Loading providers…”. */
</script>

<template>
  <div class="mt-6 flex items-center gap-3 py-12 text-slate-400" role="status" aria-live="polite">
    <span
      class="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-slate-500 border-t-transparent motion-reduce:animate-none"
      aria-hidden="true"
    />
    <span>Loading providers…</span>
  </div>
</template>
