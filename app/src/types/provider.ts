export interface Provider {
  id: string
  name: string
  /** True if any related location has availability */
  availability: boolean
  dbtaCertified: boolean
  imageUrl: string
  updatedAt: string
  phone: string
  email: string
  website: string
  primaryLocation: ProviderLocation
  locations: ProviderLocation[]
}

export interface ProviderLocation {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  availability: boolean
}

export interface ProvidersQueryOptions {
  searchTerm?: string
  onlyAvailable?: boolean
  limit?: number
}
