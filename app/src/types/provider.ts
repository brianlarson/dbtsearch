export interface Provider {
  id: string
  name: string
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
}

export interface ProvidersQueryOptions {
  searchTerm?: string
  onlyAvailable?: boolean
  limit?: number
}
