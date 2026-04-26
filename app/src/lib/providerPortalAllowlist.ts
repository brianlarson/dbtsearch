import type { Provider, ProviderLocation } from '@/types/provider'

/** One row per physical location; `id` is read-only and used for merge only. */
export type ProviderLocationSelfEdit = Pick<
  ProviderLocation,
  'id' | 'name' | 'address' | 'city' | 'state' | 'zip' | 'availability'
>

/** Documented allowlist for API parity checks. */
export const PROVIDER_SELF_EDIT_ALLOWLIST_KEYS = [
  'name',
  'phone',
  'email',
  'website',
  'locations[].id',
  'locations[].name', // maps to Craft location entry title
  'locations[].availability',
] as const

/**
 * Fields a logged-in provider may change on their own entry.
 * `provider.availability` is derived on save (any location has availability).
 */
export type ProviderSelfEditDraft = {
  name: string
  phone: string
  email: string
  website: string
  locations: ProviderLocationSelfEdit[]
}

export function locationSelfEditFromLocation(loc: ProviderLocation): ProviderLocationSelfEdit {
  return {
    id: loc.id,
    name: loc.name,
    address: loc.address,
    city: loc.city,
    state: loc.state,
    zip: loc.zip,
    availability: loc.availability,
  }
}

export function draftFromProvider(provider: Provider): ProviderSelfEditDraft {
  return {
    name: provider.name,
    phone: provider.phone,
    email: provider.email,
    website: provider.website,
    locations: provider.locations.map((loc) => locationSelfEditFromLocation(loc)),
  }
}

/** Apply allowlisted fields. Sets `provider.availability` when any location is available. */
export function applyDraftToProvider(provider: Provider, draft: ProviderSelfEditDraft): Provider {
  const locations = provider.locations.map((loc) => {
    const row = draft.locations.find((d) => d.id === loc.id)
    if (!row) return loc
    return {
      ...loc,
      name: row.name,
      availability: row.availability,
      id: loc.id,
    }
  })

  const anyAvailability = locations.some((l) => l.availability)

  return {
    ...provider,
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    website: draft.website,
    availability: anyAvailability,
    locations,
  }
}
