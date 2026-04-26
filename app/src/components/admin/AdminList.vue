<script setup lang="ts">
import type { Provider } from '@/types/provider'

defineProps<{
  providers: Provider[]
}>()

const emit = defineEmits<{
  edit: [id: string]
}>()
</script>

<template>
  <div class="vstack gap-5 px-0">
    <div class="list-group">
      <div
        v-for="provider in providers"
        :key="provider.id"
        class="list-group-item d-flex align-items-center justify-content-between p-4"
      >
        <div class="pe-4">
          <div class="d-flex gap-2 align-items-center mb-3">
            <div class="me-4">
              <span class="badge border" :class="provider.availability ? 'text-success border-success' : 'text-secondary border-secondary'">
                {{ provider.availability ? 'Availability' : 'No Availability' }}
              </span>
            </div>
            <div v-if="provider.dbtaCertified" class="me-4">
              <span class="badge text-brand border-info border">DBT-A Certified</span>
            </div>
          </div>
          <div class="fs-5 fw-semibold">{{ provider.name }}</div>
          <div class="fs-sm text-secondary mt-1">
            {{ provider.primaryLocation.address }} <br />
            {{ provider.primaryLocation.city }}, {{ provider.primaryLocation.state }} {{ provider.primaryLocation.zip }}
          </div>
        </div>
        <button type="button" class="btn btn-secondary ms-4" @click="emit('edit', provider.id)">Edit</button>
      </div>
    </div>
  </div>
</template>
