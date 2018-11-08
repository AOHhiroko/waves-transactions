import { publicKey, LEN, LONG, BYTE, SHORT, BYTES, STRING, concat, BASE58_STRING, COUNT, signBytes, hashBytes } from "waves-crypto"
import { DataTransaction, TransactionType } from "../transactions"
import { pullSeedAndIndex, addProof, valOrDef, mapSeed, getSenderPublicKey } from "../generic"
import { SeedTypes, Params} from "../types";

export interface DataEntry {
  key: string
  value: string | number | boolean | Buffer | Uint8Array | number[]
}

export interface DataParams extends Params {
  data: DataEntry[]
  fee?: number,
  timestamp?: number
}

/* @echo DOCS */
export function data( paramsOrTx: DataParams | DataTransaction, seed?: SeedTypes): DataTransaction {
  const { nextSeed } = pullSeedAndIndex(seed)
  const { data: _data, fee, timestamp} = paramsOrTx

  const senderPublicKey = getSenderPublicKey(seed, paramsOrTx)

  const typeMap:any = {
    number: ['integer', 0, LONG],
    boolean: ['boolean', 1, BYTE],
    string: ['string', 3, LEN(SHORT)(STRING)],
    _: ['binary', 2, LEN(SHORT)(BYTES)],
  }

  const mapType = (value: any) => typeMap[typeof value] || typeMap['_']

  const _timestamp = valOrDef(timestamp, Date.now())

  let bytes = concat(
    BYTE(TransactionType.Data),
    BYTE(1),
    BASE58_STRING(senderPublicKey),
    COUNT(SHORT)((x: DataEntry) => concat(LEN(SHORT)(STRING)(x.key), [mapType(x.value)[1]], mapType(x.value)[2](x.value)))(_data),
    LONG(_timestamp)
  )

  const computedFee = (Math.floor(1 + (bytes.length + 8/*feeLong*/ - 1) / 1024) * 100000)

  const _fee = valOrDef(fee, computedFee)

  const proofs = (<any>paramsOrTx)['proofs']
  const tx: DataTransaction = proofs && proofs.length > 0 ?
    paramsOrTx as DataTransaction : {
      type: 12,
      version: 1,
      senderPublicKey,
      fee: _fee,
      timestamp: _timestamp,
      data: (_data as Array<DataEntry>).map(x => {
        const type = mapType(x.value)[0]
        const v = {
          type,
          key: x.key,
          value: type === 'binary' ? 'base64:' + Buffer.from(x.value as any[]).toString('base64') : x.value as (string | number | boolean)
        }
        return v
      }),
      proofs: [],
      id: ''
    }

  bytes = concat(bytes, LONG(tx.fee))
  mapSeed(seed, (s, i) => addProof(tx, signBytes(bytes, s), i))
  tx.id = hashBytes(bytes)
  return nextSeed ? data(tx, nextSeed) : tx
} 