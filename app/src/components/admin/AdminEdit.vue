<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Provider } from '@/types/provider'

const props = defineProps<{
  provider: Provider | null
}>()

const emit = defineEmits<{
  save: [payload: { id: string; name: string; availability: boolean }]
  cancel: []
}>()

const name = ref('')
const availability = ref(false)

const providerName = computed(() => name.value || props.provider?.name || '')

watch(
  () => props.provider,
  (provider) => {
    name.value = provider?.name ?? ''
    availability.value = provider?.availability ?? false
  },
  { immediate: true },
)

function handleSubmit() {
  if (!props.provider) return
  emit('save', {
    id: props.provider.id,
    name: name.value,
    availability: availability.value,
  })
}
</script>

<template>
  <div class="vstack gap-5 px-0">
    <div class="list-group">
      <div class="list-group-item p-4">
        <div class="pe-4">
          <h3 class="fs-5 mb-4 fw-semibold">{{ providerName }}</h3>
          <form class="form" @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-md-8 mb-3">
                <label for="name" class="form-label">Name</label>
                <input id="name" v-model="name" name="name" type="text" class="form-control w-full" />
              </div>
              <div class="col-md-8 mb-3">
                <div class="form-check">
                  <input id="availability" v-model="availability" name="availability" type="checkbox" class="form-check-input" />
                  <label for="availability" class="form-check-label">Has availability</label>
                </div>
              </div>
              <div class="col-12 mb-3">
                <div class="mt-4">
                  <button type="submit" class="btn btn-secondary d-inline me-3">Save Changes</button>
                  <button type="button" class="btn btn-outline-secondary d-inline me-3" @click="emit('cancel')">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
