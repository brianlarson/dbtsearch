import type { Provider, ProviderLocation } from '@/types/provider'

/** One row per physical location; `id` is read-only and used for merge only. */
export type ProviderLocationSelfEdit = Pick<
  ProviderLocation,
  'id' | 'name' | 'address' | 'city' | 'state' | 'zip' | 'phone' | 'email' | 'website' | 'availability'
>

/** Documented allowlist for API parity checks. */
export const PROVIDER_SELF_EDIT_ALLOWLIST_KEYS = [
  'name',
  'dbtaCertified',
  'phone',
  'email',
  'website',
  'locations[].id',
  'locations[].name',
  'locations[].address',
  'locations[].city',
  'locations[].state',
  'locations[].zip',
  'locations[].phone',
  'locations[].email',
  'locations[].website',
  'locations[].availability',
] as const

/**
 * Fields a logged-in provider may change on their own entry.
 * `provider.availability` is derived on save (any location has availability).
 */
export type ProviderSelfEditDraft = {
  name: string
  dbtaCertified: boolean
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
    phone: loc.phone,
    email: loc.email,
    website: loc.website,
    availability: loc.availability,
  }
}

export function draftFromProvider(provider: Provider): ProviderSelfEditDraft {
  return {
    name: provider.name,
    dbtaCertified: provider.dbtaCertified,
    phone: provider.phone,
    email: provider.email,
    website: provider.website,
    locations: provider.locations.map((loc) => locationSelfEditFromLocation(loc)),
  }
}

/** Apply allowlisted fields. Sets `provider.availability` when any location is available. */
export function applyDraftToProvider(provider: Provider, draft: ProviderSelfEditDraft): Provider {
  const primaryId = provider.primaryLocation.id

  const locations = provider.locations.map((loc) => {
    const row = draft.locations.find((d) => d.id === loc.id)
    if (!row) return loc
    return {
      ...loc,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      email: row.email,
      website: row.website,
      availability: row.availability,
      id: loc.id,
    }
  })

  const primary = locations.find((l) => l.id === primaryId) ?? locations[0] ?? provider.primaryLocation
  const anyAvailability = locations.some((l) => l.availability)

  return {
    ...provider,
    name: draft.name,
    dbtaCertified: draft.dbtaCertified,
    phone: draft.phone,
    email: draft.email,
    website: draft.website,
    availability: anyAvailability,
    primaryLocation: primary,
    locations,
  }
}
