export type AssetCategory =
  | 'cash'
  | 'stocks'
  | 'real_estate'
  | 'crypto'
  | 'retirement'
  | 'collection'
  | 'other'

export type LiabilityCategory =
  | 'mortgage'
  | 'car'
  | 'student'
  | 'credit_card'
  | 'personal'
  | 'other'

export interface Asset {
  id: string
  user_id: string
  name: string
  category: AssetCategory
  value: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Liability {
  id: string
  user_id: string
  name: string
  category: LiabilityCategory
  value: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface AssetDetails {
  immobilier: number
  cto: number
  livrets: number
  cryptos: number
  voiture: number
  montres: number
  cartesPokemon: number
  jeuxPokemon: number
  autres: number
}

export interface LiabilityDetails {
  creditImmobilier: number
  creditConsommation: number
  cartesCredit: number
  autres: number
}

export const EMPTY_ASSET_DETAILS: AssetDetails = {
  immobilier: 0, cto: 0, livrets: 0, cryptos: 0, voiture: 0,
  montres: 0, cartesPokemon: 0, jeuxPokemon: 0, autres: 0,
}

export const EMPTY_LIABILITY_DETAILS: LiabilityDetails = {
  creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0,
}

export interface NetWorthSnapshot {
  id: string
  user_id: string
  total_assets: number
  total_liabilities: number
  net_worth: number
  snapshot_date: string
  asset_details?: AssetDetails | null
  liability_details?: LiabilityDetails | null
}

export interface Goal {
  id: string
  user_id: string
  target_net_worth: number
  target_date?: string | null
  label?: string | null
}

export interface AssetFormData {
  name: string
  category: AssetCategory
  value: string
  notes?: string
}

export interface LiabilityFormData {
  name: string
  category: LiabilityCategory
  value: string
  notes?: string
}
