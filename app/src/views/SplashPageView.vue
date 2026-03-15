<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SplashPage from '@/components/SplashPage.vue'

interface ProviderRow {
  id: number
  name: string
}

const providersRaw = ref<ProviderRow[]>([])

onMounted(async () => {
  try {
    const res = await fetch('/data/dbt-providers.json')
    const data = await res.json()
    providersRaw.value = Array.isArray(data) ? data : []
  } catch {
    providersRaw.value = []
  }
})

const providers = computed(() => {
  const byName = new Map<string, { id: number; name: string }>()
  for (const p of providersRaw.value) {
    if (!byName.has(p.name)) byName.set(p.name, { id: p.id, name: p.name })
  }
  return [...byName.values()]
})
</script>

<template>
  <SplashPage :providers="providers" />
</template>
