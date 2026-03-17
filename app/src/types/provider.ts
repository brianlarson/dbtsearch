export interface Provider {
  id: string
  name: string
  availability: boolean
  dbtaCertified: boolean
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  imageUrl: string
  updatedAt: string
}

export interface ProvidersQueryOptions {
  searchTerm?: string
  onlyAvailable?: boolean
  limit?: number
}
