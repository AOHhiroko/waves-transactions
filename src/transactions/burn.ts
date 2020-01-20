/**
 * @module index
 */
import {  IBurnParams, WithId, WithSender } from '../transactions'
import { binary } from '@waves/marshall'
import { signBytes, blake2b, base58Encode } from '@waves/ts-lib-crypto'
import { addProof, getSenderPublicKey, convertToPairs, networkByte, fee } from '../generic'
import { TSeedTypes } from '../types'
import { validate } from '../validators'
import { txToProtoBytes } from '../proto-serialize'
import { TBurnTransaction, TRANSACTION_TYPE,TBurnTransactionWithId } from '@waves/ts-types'


/* @echo DOCS */
export function burn(params: IBurnParams, seed: TSeedTypes): TBurnTransactionWithId
export function burn(paramsOrTx: IBurnParams & WithSender | TBurnTransaction, seed?: TSeedTypes): TBurnTransactionWithId
export function burn(paramsOrTx: any, seed?: TSeedTypes): TBurnTransactionWithId {
  const type = TRANSACTION_TYPE.BURN
  const version = paramsOrTx.version || 3
  const seedsAndIndexes = convertToPairs(seed)
  const senderPublicKey = getSenderPublicKey(seedsAndIndexes, paramsOrTx)

  const tx: TBurnTransactionWithId = {
    type,
    version,
    senderPublicKey,
    assetId: paramsOrTx.assetId,
    quantity: paramsOrTx.quantity,
    chainId: networkByte(paramsOrTx.chainId, 87),
    fee: fee(paramsOrTx, 100000),
    timestamp: paramsOrTx.timestamp || Date.now(),
    proofs: paramsOrTx.proofs || [],
    id: '',
  }

  validate.burn(tx)

  const bytes = version > 2 ? txToProtoBytes(tx) : binary.serializeTx(tx)

  seedsAndIndexes.forEach(([s, i]) => addProof(tx, signBytes(s, bytes), i))
  tx.id = base58Encode(blake2b(bytes))

  return tx
}
