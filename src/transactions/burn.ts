import { TransactionType, BurnTransaction } from "../transactions"
import { publicKey, concat, BASE58_STRING, LONG, signBytes, hashBytes, BYTES } from "waves-crypto"
import { pullSeedAndIndex, addProof, valOrDef, mapSeed, getSenderPublicKey } from "../generic"
import { SeedTypes, Params} from "../types";


export interface BurnParams extends Params {
  assetId: string
  quantity: number
  fee?: number
  timestamp?: number
  chainId?: string
}

/* @echo DOCS */
export function burn(paramsOrTx: BurnParams | BurnTransaction, seed?: SeedTypes): BurnTransaction {
  const { nextSeed } = pullSeedAndIndex(seed)
  const { assetId, quantity, chainId, fee, timestamp } = paramsOrTx

  const senderPublicKey = getSenderPublicKey(seed, paramsOrTx)

  const proofs = (<any>paramsOrTx)['proofs']
  const tx: BurnTransaction = proofs && proofs.length > 0 ?
    paramsOrTx as BurnTransaction : {
      type: TransactionType.Burn,
      version: 2,
      assetId,
      quantity,
      chainId: chainId || 'W',
      fee: valOrDef(fee, 100000),
      senderPublicKey,
      timestamp: valOrDef(timestamp, Date.now()),
      proofs: [],
      id: ''
    }

  const bytes = concat(
    BYTES([TransactionType.Burn, tx.version, tx.chainId.charCodeAt(0)]),
    BASE58_STRING(tx.senderPublicKey),
    BASE58_STRING(tx.assetId),
    LONG(tx.quantity),
    LONG(tx.fee),
    LONG(tx.timestamp)
  )

  mapSeed(seed, (s, i) => addProof(tx, signBytes(bytes, s), i))
  tx.id = hashBytes(bytes)
  return nextSeed ? burn(tx, nextSeed) : tx
}
