import { IssueTransaction, TransactionType } from "../transactions"
import { publicKey, concat, BASE58_STRING, BYTE, LEN, SHORT, STRING, LONG, signBytes, hashBytes, BYTES, BOOL } from "waves-crypto"
import { Params, pullSeedAndIndex, SeedTypes, addProof, valOrDef, mapSeed, validateParams } from "../generic"

export interface IssueParams extends Params {
  name: string
  description: string
  decimals?: number
  quantity: number
  reissuable?: boolean
  fee?: number
  timestamp?: number
  chainId?: string
}

/* @echo DOCS */
export function issue(seed: SeedTypes, paramsOrTx: IssueParams | IssueTransaction): IssueTransaction {
  const { nextSeed } = pullSeedAndIndex(seed)
  const { name, description, decimals, quantity, reissuable, fee, timestamp, chainId, senderPublicKey } = paramsOrTx

  validateParams(seed, paramsOrTx)

  const proofs = paramsOrTx['proofs']
  const tx: IssueTransaction = proofs && proofs.length > 0 ?
    paramsOrTx as IssueTransaction : {
      type: TransactionType.Issue,
      version: 2,
      name,
      description,
      decimals: valOrDef(decimals, 8),
      quantity,
      reissuable: reissuable || false,
      fee: valOrDef(fee, 100000000),
      senderPublicKey: senderPublicKey || mapSeed(seed, s => publicKey(s)),
      timestamp: valOrDef(timestamp, Date.now()),
      chainId: chainId || 'W',
      proofs: [],
      id: ''
    }

  const bytes = concat(
    BYTES([TransactionType.Issue, tx.version, tx.chainId.charCodeAt(0)]),
    BASE58_STRING(tx.senderPublicKey),
    LEN(SHORT)(STRING)(tx.name),
    LEN(SHORT)(STRING)(tx.description),
    LONG(tx.quantity),
    BYTE(tx.decimals),
    BOOL(tx.reissuable),
    LONG(tx.fee),
    LONG(tx.timestamp),
    [0] //Script
  )

  mapSeed(seed, (s, i) => addProof(tx, signBytes(bytes, s), i))
  tx.id = hashBytes(bytes)
  return nextSeed ? issue(nextSeed, tx) : tx
}