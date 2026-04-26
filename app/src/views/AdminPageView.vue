<script setup lang="ts">
import { computed, ref } from 'vue'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminEdit from '@/components/admin/AdminEdit.vue'
import { providerPortalMock } from '@/mocks/providerPortalMock'
import type { Provider } from '@/types/provider'

const providers = ref<Provider[]>(providerPortalMock.map((provider) => ({ ...provider })))
const editingId = ref<string | null>(null)
const username = 'tinytree'

const editingProvider = computed(
  () => providers.value.find((provider) => provider.id === editingId.value) ?? null,
)

function handleEdit(id: string) {
  editingId.value = id
}

function handleCancel() {
  editingId.value = null
}

function handleSave(payload: { id: string; name: string; availability: boolean }) {
  providers.value = providers.value.map((provider) =>
    provider.id === payload.id
      ? {
          ...provider,
          name: payload.name,
          availability: payload.availability,
        }
      : provider,
  )
  editingId.value = null
}
</script>

<template>
  <LegacyHeader is-admin />

  <main class="content-wrapper">
    <LegacyPageHeader page-heading="Admin" page-subheading="Provider Management" />

    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="pb-4 d-md-flex align-items-center justify-content-between w-100">
            <h1 class="h3 mb-2">{{ editingId ? 'Edit Provider' : 'My Providers' }}</h1>
            <div class="mt-0 text-light-subtle mb-n1">
              <em>Logged in as {{ username }}</em>
              <button type="button" class="btn btn-sm btn-outline-secondary ms-3">
                <i class="fi-lock fs-base me-2" />
                Logout
              </button>
            </div>
          </div>

          <AdminEdit
            v-if="editingId"
            :provider="editingProvider"
            @save="handleSave"
            @cancel="handleCancel"
          />
          <AdminList v-else :providers="providers" @edit="handleEdit" />

          <div class="my-5" />
          <div class="py-5" />
        </div>
      </div>
    </div>
  </main>

  <LegacyFooter />
</template>
