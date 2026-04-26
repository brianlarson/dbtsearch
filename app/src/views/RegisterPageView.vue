<script setup lang="ts">
import { ref } from 'vue'
import LegacyPageLayout from '@/components/directory/LegacyPageLayout.vue'

const username = ref('')
const password = ref('')

function handleRegister() {
  /* static shell — wire to API later */
}
</script>

<template>
  <LegacyPageLayout page-heading="Register" page-subheading="Add management users">
    <form class="form" @submit.prevent="handleRegister">
      <div class="row gap-3">
        <div class="col-md-8">
          <label for="username" class="form-label fs-base">Username</label>
          <input id="username" v-model="username" type="text" class="form-control form-control-lg" required />
        </div>
        <div class="col-md-8">
          <label for="password" class="form-label fs-base">Password</label>
          <input id="password" v-model="password" type="password" class="form-control form-control-lg" required />
        </div>
        <div class="col-12 mt-3 mb-5">
          <button type="submit" class="btn btn-lg btn-primary px-4">Register</button>
        </div>
      </div>
    </form>
  </LegacyPageLayout>
</template>
