<script setup lang="ts">
import { ref } from 'vue'
import LegacyContentLayout from '@/components/directory/LegacyContentLayout.vue'

const username = ref('')
const password = ref('')

function onSubmit() {
  /* Wire to registration when backend is ready */
}
</script>

<template>
  <LegacyContentLayout page-heading="Register" page-subheading="Add management users">
    <form class="max-w-xl space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="register-username" class="mb-2 block text-sm font-medium text-slate-200">Username</label>
        <input
          id="register-username"
          v-model="username"
          type="text"
          autocomplete="username"
          required
          class="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label for="register-password" class="mb-2 block text-sm font-medium text-slate-200">Password</label>
        <input
          id="register-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          class="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div class="pt-2">
        <button
          type="submit"
          class="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          Register
        </button>
      </div>
    </form>
  </LegacyContentLayout>
</template>
