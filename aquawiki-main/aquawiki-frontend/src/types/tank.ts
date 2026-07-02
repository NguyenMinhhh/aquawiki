import type { Species } from './species'

export type ReminderStatus = 'OK' | 'DUE' | 'OVERDUE'

export interface TankSpeciesEntry {
  species: Species
  quantity: number
}

export interface Tank {
  id: number
  name: string
  lengthCm: number
  widthCm: number
  heightCm: number
  volumeLiters: number
  waterChangeIntervalDays: number | null
  lastWaterChangeDate: string | null
  nextDueDate: string | null
  reminderStatus: ReminderStatus
  species: TankSpeciesEntry[]
}

export interface TankRequest {
  name: string
  lengthCm: number
  widthCm: number
  heightCm: number
  waterChangeIntervalDays?: number | null
  lastWaterChangeDate?: string | null
  species: { speciesId: number; quantity: number }[]
}

export interface SpeciesMatch {
  speciesId: number
  commonName: string
  scientificName: string
  confidence: number
}

export interface IdentifyResponse {
  noMatch: boolean
  candidates: SpeciesMatch[]
}
