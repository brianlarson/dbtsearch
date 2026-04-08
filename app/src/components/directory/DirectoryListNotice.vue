<script setup lang="ts">
/**
 * Matches Storybook `renderProviderListNoticePanel` — centered bordered panel + primary action.
 */
defineProps<{
  title: string
  detail?: string
  buttonLabel: string
  role?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div
    class="directory-list-notice text-center border border-slate-700/80 rounded-2xl bg-slate-900/70 py-12 px-4"
    :role="role"
  >
    <p :class="detail ? 'mb-2 text-slate-400' : 'mb-4 text-slate-400'">
      {{ title }}
    </p>
    <p v-if="detail" class="mb-4 text-sm text-slate-400 break-words">
      {{ detail }}
    </p>
    <button
      type="button"
      class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      @click="$emit('action')"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>
