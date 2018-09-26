import { Transaction } from "./transactions";

export interface Params {
  senderPublicKey?: string
}

export interface SeedsAndIndexes {
  [index: number]: string
}

export function addProof(tx: Transaction, proof: string, index?: number) {
  if (index == undefined) {
    tx.proofs = [...(tx.proofs || []), proof]
    return tx
  }

  if (tx.proofs != undefined && tx.proofs[index] != undefined)
    throw `Proof at index ${index} is already exists.`

  tx.proofs = tx.proofs || []

  for (let i = tx.proofs.length; i < index; i++)
    tx.proofs.push(null)

  tx.proofs.push(proof)

  return tx
}

export const valOrDef = <T>(val: T, def: T): T => val != undefined ? val : def

export type SeedTypes = string | string[] | SeedsAndIndexes

export const isSeedsAndIndexes = (seed: SeedTypes): seed is SeedsAndIndexes =>
  typeof seed != 'string' && typeof seed == 'object' && (<string[]>seed).length == undefined

export const isArrayOfSeeds = (seed: SeedTypes): seed is string[] =>
  typeof seed != 'string' && typeof seed == 'object' && (<string[]>seed).length != undefined

export const pullSeedAndIndex = (seed: SeedTypes): { seed: string, index?: number, newSeed?: SeedTypes } => {
  if (isSeedsAndIndexes(seed)) {
    const keys = Object.keys(seed).map(k => parseInt(k))
    const index = keys[0]
    const newSeed = { ...<Object>seed }
    delete newSeed[index]

    if (keys && keys.length > 0)
      return { seed: seed[keys[0]], index, newSeed: Object.keys(newSeed).length > 0 ? newSeed : undefined }
  }
  if (isArrayOfSeeds(seed)) {
    const [, ...newSeed] = seed
    if (seed.length > 0)
      return { seed: seed[0], newSeed: newSeed.length > 0 ? newSeed : undefined }

    return undefined
  }

  return { seed: <string>seed }
}