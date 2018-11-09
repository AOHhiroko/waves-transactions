import { WithProofs } from "./transactions"

export interface Params {
  senderPublicKey?: string
  timestamp?: number
}

export function validateParams(seed: SeedTypes, params: Params) {
  const { seed: s } = pullSeedAndIndex(seed)

  if (s == undefined && params.senderPublicKey == undefined)
    throw new Error('Please provide either seed or senderPublicKey')
}

export interface SeedsAndIndexes {
  [index: number]: string
}

export function addProof(tx: WithProofs, proof: string, index?: number) {
  tx.proofs = tx.proofs || [];
  if (index == null) {
    tx.proofs = [...tx.proofs, proof];
    return tx;
  }
  if (tx.proofs != null && !!tx.proofs[index])
    throw new Error(`Proof at index ${index} is already exists.`);
  for (let i = tx.proofs.length; i < index; i++)
    tx.proofs.push(null);
  tx.proofs[index] = (proof);
  return tx;
}

export const valOrDef = <T>(val: T, def: T): T => val != undefined ? val : def

export type SeedTypes = string | string[] | SeedsAndIndexes | undefined

export const isSeedsAndIndexes = (seed: SeedTypes): seed is SeedsAndIndexes =>
  typeof seed != 'string' && typeof seed == 'object' && (<string[]>seed).length == undefined

export const isArrayOfSeeds = (seed: SeedTypes): seed is string[] =>
  typeof seed != 'string' && typeof seed == 'object' && (<string[]>seed).length != undefined

export const mapSeed = <T>(seed: SeedTypes, map: (seed: string, index?: number) => T): T => {
  const { seed: _seed, index } = pullSeedAndIndex(seed)
  if (_seed != undefined)
    return map(_seed, index)
  return undefined
}

export const pullSeedAndIndex = (seed: SeedTypes): { seed: string, index?: number, nextSeed?: SeedTypes } => {
  const empty = { seed: undefined, index: undefined, nextSeed: undefined }
  if (seed == undefined || seed == null || seed == '')
    return empty

  if (isSeedsAndIndexes(seed)) {
    const keys = Object.keys(seed).map(k => parseInt(k)).filter(k => !isNaN(k))

    if (keys == undefined || keys.length == 0)
      return empty

    const index = keys[0]
    const newSeed = { ...<Object>seed }
    delete newSeed[index]

    if (keys && keys.length > 0)
      return { seed: seed[keys[0]], index, nextSeed: Object.keys(newSeed).length > 0 ? newSeed : undefined }
  }
  if (isArrayOfSeeds(seed)) {
    return pullSeedAndIndex(
      Object.entries(seed).filter(([k, v]) => !!v).reduce((acc, next) => {
        acc[next[0]] = next[1];
        return acc
      }, {})
    )
  }

  return { seed: <string>seed }
}