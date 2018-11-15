export type Option<T> = T | undefined | null

export interface SeedsAndIndexes {
  [key: number]: string
}

export type SeedTypes = Option<string> | Option<string>[] | SeedsAndIndexes

export interface Params {
  senderPublicKey?: string
  timestamp?: number
}