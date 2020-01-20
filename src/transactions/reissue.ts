/**
 * @module index
 */
import {  IReissueParams, WithSender } from '../transactions'
import { signBytes, blake2b, base58Encode } from '@waves/ts-lib-crypto'
import { TRANSACTION_TYPE, TReissueTransaction, TReissueTransactionWithId} from '@waves/ts-types'
import { addProof, convertToPairs, fee, getSenderPublicKey, networkByte } from '../generic'
import { TSeedTypes } from '../types'
import { binary } from '@waves/marshall'
import { validate } from '../validators'
import { txToProtoBytes } from '../proto-serialize'


/* @echo DOCS */
export function reissue(paramsOrTx: IReissueParams, seed: TSeedTypes): TReissueTransactionWithId
export function reissue(paramsOrTx: IReissueParams & WithSender | TReissueTransaction, seed?: TSeedTypes): TReissueTransactionWithId
export function reissue(paramsOrTx: any, seed?: TSeedTypes): TReissueTransactionWithId{
  const type = TRANSACTION_TYPE.REISSUE
  const version = paramsOrTx.version || 3
  const seedsAndIndexes = convertToPairs(seed)
  const senderPublicKey = getSenderPublicKey(seedsAndIndexes, paramsOrTx)

  const tx: TReissueTransactionWithId = {
    type,
    version,
    senderPublicKey,
    assetId: paramsOrTx.assetId,
    quantity: paramsOrTx.quantity,
    reissuable: paramsOrTx.reissuable,
    chainId: networkByte(paramsOrTx.chainId, 87),
    fee: fee(paramsOrTx,100000000),
    timestamp: paramsOrTx.timestamp || Date.now(),
    proofs: paramsOrTx.proofs || [],
    id: '',
  }

  validate.reissue(tx)

  const bytes = version > 2 ? txToProtoBytes(tx) : binary.serializeTx(tx)

  seedsAndIndexes.forEach(([s,i]) => addProof(tx, signBytes(s, bytes),i))
  tx.id = base58Encode(blake2b(bytes))

  return tx
}
