import * as crypto from "crypto"
// @ts-ignore
import * as cc from "five-bells-condition"

export const generateConditionAndFulfillment = () => {
  const preImage = crypto.randomBytes(32)
  const fulfillment = new cc.PreimageSha256()
  fulfillment.setPreimage(preImage)

  const condition = fulfillment.getConditionBinary().toString("hex").toUpperCase()
  const fulfillmentHex = fulfillment.serializeBinary().toString("hex").toUpperCase()

  return {
    condition,
    fulfillment: fulfillmentHex,
  }
}

