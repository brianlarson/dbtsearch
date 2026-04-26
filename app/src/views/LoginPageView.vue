<script setup lang="ts">
import { ref } from 'vue'
import LegacyPageLayout from '@/components/directory/LegacyPageLayout.vue'

const username = ref('')
const password = ref('')

function handleLogIn() {
  /* static shell — wire to API later */
}
</script>

<template>
  <LegacyPageLayout page-heading="Provider Login" page-subheading="Manage Listings">
    <form class="form" @submit.prevent="handleLogIn">
      <div class="row gap-3">
        <div class="col-md-8">
          <label for="login-username" class="form-label fs-base">Username</label>
          <input id="login-username" v-model="username" type="text" class="form-control form-control-lg" required />
        </div>
        <div class="col-md-8">
          <label for="login-password" class="form-label fs-base">Password</label>
          <input id="login-password" v-model="password" type="password" class="form-control form-control-lg" required />
        </div>
        <div class="col-12 mt-3 mb-5">
          <button type="submit" class="btn btn-lg btn-primary px-4">Log In</button>
        </div>
      </div>
    </form>
  </LegacyPageLayout>
</template>
