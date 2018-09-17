export const enum TransactionType {
  Genesis = 1,
  Payment = 2,
  Issue = 3,
  Transfer = 4,
  Reissue = 5,
  Burn = 6,
  Exchange = 7,
  Lease = 8,
  CancelLease = 9,
  Alias = 10,
  MassTransfer = 11,
  Data = 12,
}

export interface Transaction {
  id: string
  type: number
  timestamp: number
  fee: number
  proofs: string[]
  version: number
}

export type Tx =
  | IssueTransaction
  | TransferTransaction
  | ReissueTransaction
  | BurnTransaction
  | LeaseTransaction
  | CancelLeaseTransaction
  | MassTransferTransaction
  | DataTransaction

export interface WithSender {
  sender?: string
  senderPublicKey: string
}

export interface IssueTransaction extends Transaction, WithSender {
  type: TransactionType.Issue
  name: string
  description: string
  decimals: number
  quantity: number
  reissuable: boolean
  chainId: string
}

export interface TransferTransaction extends Transaction, WithSender {
  type: TransactionType.Transfer
  recipient: string
  amount: number
  feeAssetId?: string
  assetId?: string
  attachment?: string
}

export interface Transfer {
  recipient: string
  amount: number
}

export interface ReissueTransaction extends Transaction, WithSender {
  type: TransactionType.Reissue
  assetId: string
  quantity: number
  chainId: string
  reissuable: boolean
}

export interface BurnTransaction extends Transaction, WithSender {
  type: TransactionType.Burn
  assetId: string
  quantity: number
  chainId: string
}

export interface LeaseTransaction extends Transaction, WithSender {
  type: TransactionType.Lease
  amount: number
  recipient: string
}

export interface CancelLeaseTransaction extends Transaction, WithSender {
  type: TransactionType.CancelLease
  leaseId: string
  chainId: number
}

export interface MassTransferTransaction extends Transaction, WithSender {
  type: TransactionType.MassTransfer
  transfers: Transfer[]
  assetId?: string
  attachment?: string
}

export interface DataTransaction extends Transaction, WithSender {
  type: TransactionType.Data
  data: { key: string, type: string, value: string | number | boolean }[]
}
