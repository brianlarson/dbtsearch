import { ref } from 'vue'
import type { Provider, ProvidersQueryOptions } from '@/types/provider'

interface CraftLocationEntry {
  id?: string | number
  title?: string
  locationName?: string
  address?: string
  city?: string
  state?: string
  zip?: string | number
  phone?: string
  email?: string
  website?: string
  availability?: boolean
}

interface CraftProviderEntry {
  id?: string | number
  title?: string
  name?: string
  phone?: string
  email?: string
  website?: string
  /** Legacy flat JSON / old schema only; Craft uses per-location availability */
  availability?: boolean
  address?: string
  city?: string
  state?: string
  zip?: string | number
  dbtaCertified?: boolean
  dbta_certified?: boolean
  dateUpdated?: string
  updatedAt?: string
  updated_at?: string
  locations?: CraftLocationEntry[]
  providerLocations?: CraftLocationEntry[]
  providerLogo?: Array<{ url?: string | null }> | { url?: string | null } | null
  image?: Array<{ url?: string | null }> | { url?: string | null } | string | null
}

interface GraphQlPayload {
  data?: {
    entries?: CraftProviderEntry[]
  }
  errors?: Array<{ message?: string }>
}

const DIRECTORY_PROVIDERS_QUERY = `
  query DirectoryProviders($search: String, $limit: Int) {
    entries(section: ["providers"], limit: $limit, search: $search) {
      ... on providers_default_Entry {
        id
        title
        name
        phone
        email
        website
        dbtaCertified
        dateUpdated
        providerLocations {
          ... on locations_default_Entry {
            id
            title
            locationName
            address
            city
            state
            zip
            phone
            email
            website
            availability
          }
        }
        providerLogo {
          url
        }
      }
    }
  }
`

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function getImageUrl(entry: CraftProviderEntry): string {
  const candidate = entry.providerLogo ?? entry.image
  if (!candidate) return ''
  if (Array.isArray(candidate)) return asString(candidate[0]?.url)
  if (typeof candidate === 'string') return candidate
  return asString(candidate.url)
}

function mapLocation(entry: CraftLocationEntry): Provider['locations'][number] {
  return {
    id: asString(entry.id),
    name: asString(entry.locationName) || asString(entry.title),
    address: asString(entry.address),
    city: asString(entry.city),
    state: asString(entry.state),
    zip: asString(entry.zip),
    phone: asString(entry.phone),
    email: asString(entry.email),
    website: asString(entry.website),
    availability: Boolean(entry.availability),
  }
}

function emptyLocation(): Provider['locations'][number] {
  return {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    availability: false,
  }
}

function mapEntryToProvider(entry: CraftProviderEntry): Provider {
  let rawLocations = entry.locations ?? entry.providerLocations ?? []
  if ((!Array.isArray(rawLocations) || rawLocations.length === 0) && entry.address) {
    rawLocations = [
      {
        id: `${entry.id ?? 'row'}-loc`,
        locationName: entry.title,
        address: entry.address,
        city: entry.city,
        state: entry.state,
        zip: entry.zip,
        phone: entry.phone,
        email: entry.email,
        website: entry.website,
        availability: entry.availability,
      },
    ]
  }
  const locations = Array.isArray(rawLocations) ? rawLocations.map(mapLocation) : []
  const primaryLocation = locations[0] ?? emptyLocation()

  const availabilityAggregate = locations.some((l) => l.availability)

  return {
    id: asString(entry.id) || crypto.randomUUID(),
    name: asString(entry.name) || asString(entry.title),
    availability: availabilityAggregate,
    dbtaCertified: Boolean(entry.dbtaCertified ?? entry.dbta_certified),
    phone: asString(entry.phone),
    email: asString(entry.email),
    website: asString(entry.website),
    imageUrl: getImageUrl(entry),
    primaryLocation,
    locations,
    updatedAt: asString(entry.dateUpdated ?? entry.updatedAt ?? entry.updated_at),
  }
}

function applyClientFilters(items: Provider[], options: ProvidersQueryOptions): Provider[] {
  const normalizedSearch = options.searchTerm?.trim().toLowerCase() ?? ''
  return items.filter((item) => {
    if (options.onlyAvailable && !item.availability) return false
    if (!normalizedSearch) return true
    return item.name.toLowerCase().includes(normalizedSearch)
  })
}

export function useProvidersQuery() {
  const providers = ref<Provider[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const activeDataSource = ref<'craft' | 'fallback'>('fallback')

  async function fetchFromCraft(options: ProvidersQueryOptions): Promise<Provider[]> {
    const endpoint = import.meta.env.VITE_CRAFT_GRAPHQL_ENDPOINT || '/api'
    const token = import.meta.env.VITE_CRAFT_GQL_TOKEN
    const searchTerm = options.searchTerm?.trim() ? options.searchTerm.trim() : null

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: DIRECTORY_PROVIDERS_QUERY,
        variables: {
          search: searchTerm,
          limit: options.limit ?? 500,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed with HTTP ${response.status}`)
    }

    const payload = (await response.json()) as GraphQlPayload
    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message || 'GraphQL error')
    }

    const entries = payload.data?.entries ?? []
    return entries.map(mapEntryToProvider)
  }

  async function fetchFromLocalJson(): Promise<Provider[]> {
    const response = await fetch('/data/dbt-providers.json')
    if (!response.ok) {
      throw new Error(`Local provider fallback failed with HTTP ${response.status}`)
    }
    const json = (await response.json()) as CraftProviderEntry[]
    const entries = Array.isArray(json) ? json : []
    return entries.map(mapEntryToProvider)
  }

  async function fetchProviders(options: ProvidersQueryOptions = {}) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      try {
        const craftItems = await fetchFromCraft(options)
        providers.value = applyClientFilters(craftItems, options)
        activeDataSource.value = 'craft'
        return
      } catch (craftError) {
        console.warn('Craft GraphQL unavailable, using local provider JSON fallback.', craftError)
      }

      try {
        const fallbackItems = await fetchFromLocalJson()
        providers.value = applyClientFilters(fallbackItems, options)
        activeDataSource.value = 'fallback'
      } catch (fallbackError) {
        errorMessage.value = fallbackError instanceof Error ? fallbackError.message : 'Failed to load providers.'
        providers.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    providers,
    isLoading,
    errorMessage,
    activeDataSource,
    fetchProviders,
  }
}
