/**
 * @module index
 */
import { IMassTransferParams, WithSender } from '../transactions'
import {
  addProof,
  chainIdFromRecipient,
  convertToPairs,
  fee,
  getSenderPublicKey,
  networkByte,
  normalizeAssetId
} from '../generic'
import { TSeedTypes } from '../types'
import { base58Encode, blake2b, signBytes } from '@waves/ts-lib-crypto'
import { TRANSACTION_TYPE, TMassTransferTransaction,TMassTransferTransactionWithId} from '@waves/ts-types'
import { binary } from '@waves/marshall'
import { validate } from '../validators'
import { txToProtoBytes } from '../proto-serialize'


/* @echo DOCS */
export function massTransfer(params: IMassTransferParams, seed: TSeedTypes): TMassTransferTransactionWithId
export function massTransfer(paramsOrTx: IMassTransferParams & WithSender | TMassTransferTransaction, seed?: TSeedTypes): TMassTransferTransactionWithId
export function massTransfer(paramsOrTx: any, seed?: TSeedTypes): TMassTransferTransactionWithId {
  const type = TRANSACTION_TYPE.MASS_TRANSFER
  const version = paramsOrTx.version || 2
  const seedsAndIndexes = convertToPairs(seed)
  const senderPublicKey = getSenderPublicKey(seedsAndIndexes, paramsOrTx)

  if (!Array.isArray(paramsOrTx.transfers) || paramsOrTx.transfers.length === 0) throw new Error('Should contain at least one transfer')

  const tx: TMassTransferTransactionWithId = {
    type,
    version,
    senderPublicKey,
    assetId: normalizeAssetId(paramsOrTx.assetId),
    transfers: paramsOrTx.transfers,
    fee: fee(paramsOrTx, 100000 + Math.ceil(0.5 * paramsOrTx.transfers.length) * 100000),
    timestamp: paramsOrTx.timestamp || Date.now(),
    attachment: paramsOrTx.attachment,
    proofs: paramsOrTx.proofs || [],
    chainId: networkByte(paramsOrTx.chainId, chainIdFromRecipient(paramsOrTx.transfers[0]?.recipient)),
    id: '',
  }

  validate.massTransfer(tx)

  const bytes = version > 1 ? txToProtoBytes(tx) : binary.serializeTx(tx)

  seedsAndIndexes.forEach(([s, i]) => addProof(tx, signBytes(s, bytes), i))
  tx.id = base58Encode(blake2b(bytes))

  return tx
}
