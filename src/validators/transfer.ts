import { TRANSACTION_TYPE } from '../transactions'
import {
    isEq,
    orEq,
    isAssetId,
    isRecipient,
    isNumber,
    isNumberLike,
    isAttachment,
    isArray,
    getError,
    validateByShema,
    ifElse, defaultValue
} from './validators'


const transferScheme = {
    type: isEq(TRANSACTION_TYPE.TRANSFER),
    version: orEq([undefined, 0, 1, 2]),
    assetId: isAssetId,
    feeAssetId: isAssetId,
    recipient: isRecipient,
    amount: isNumberLike,
    attachment: isAttachment,
    fee: isNumberLike,
    timestamp: isNumber,
    proofs: ifElse(isArray, defaultValue(true), orEq([ undefined ]))
 };


export const transferValidator = validateByShema(transferScheme, getError)
