<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LegacyPageLayout from '@/components/directory/LegacyPageLayout.vue'
import { attemptProviderLogin } from '@/lib/providerAuth'
import { isProviderPortalLoggedIn } from '@/lib/providerSession'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return '/portal'
  return raw
}

onMounted(() => {
  if (isProviderPortalLoggedIn()) {
    void router.replace(safeRedirectPath(route.query.redirect))
  }
})

async function handleLogIn() {
  errorMessage.value = ''
  submitting.value = true
  try {
    const result = await attemptProviderLogin(username.value, password.value)
    if (!result.ok) {
      errorMessage.value = result.error
      return
    }
    await router.replace(safeRedirectPath(route.query.redirect))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <LegacyPageLayout page-heading="Provider Login" page-subheading="Manage Listings">
    <p v-if="errorMessage" class="text-danger small mb-3">{{ errorMessage }}</p>
    <form class="form" @submit.prevent="handleLogIn">
      <div class="row gap-3">
        <div class="col-md-8">
          <label for="login-username" class="form-label fs-base">Username</label>
          <input
            id="login-username"
            v-model="username"
            type="text"
            class="form-control form-control-lg"
            autocomplete="username"
            required
          />
        </div>
        <div class="col-md-8">
          <label for="login-password" class="form-label fs-base">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-control form-control-lg"
            autocomplete="current-password"
            required
          />
        </div>
        <div class="col-12 mt-3 mb-5">
          <button type="submit" class="btn btn-lg btn-primary px-4" :disabled="submitting">
            {{ submitting ? 'Signing in…' : 'Log In' }}
          </button>
        </div>
      </div>
    </form>
  </LegacyPageLayout>
</template>
