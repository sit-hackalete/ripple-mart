import dayjs from "dayjs"
import "dotenv/config"
import { getXrplClient } from "./client"
import { isoTimeToRippleTime, xrpToDrops } from "xrpl"
import { WALLET_1, WALLET_2 } from "./wallets"
import { createEscrow, finishEscrow } from "./transactions"
import { generateConditionAndFulfillment } from "./helpers"


// const pinataClient = getPinataClient()
const xrplClient = getXrplClient()

// const { PINATA_GATEWAY } = process.env

const main = async () => {
  await xrplClient.connect()

  // // Time based escrow

  // // we can claim the funds from wallet 2 after 15 seconds
  // const finishAfter = dayjs().add(15, "seconds").toISOString()
  // // we cannot claim funds from the escrow after 5 minutes
  // const cancelAfter = dayjs().add(5, "minutes").toISOString()

  // const { condition, fulfillment } = generateConditionAndFulfillment()
  // console.log("Condition:", condition)
  // console.log("Fulfillment:", fulfillment)

  // await createEscrow({
  //   txn: {
  //     Amount: xrpToDrops(1),
  //     Condition: condition,
  //     // FinishAfter: isoTimeToRippleTime(finishAfter),
  //     Destination: WALLET_2.address,
  //     CancelAfter: isoTimeToRippleTime(cancelAfter),
  //   },
  //   wallet: WALLET_1,
  // })

  await finishEscrow({
    txn: {
      OfferSequence: 13800743,
      Owner: WALLET_1.address,
      Fulfillment: "A0228020192BFF3F9AACAC417C812E0C0D62AA45CA41C5184D9F89B7E0B7D413FABCE9D8",
      Condition: "A02580209281BDD5D27022880EA954AE1C21E663E5102DCC0A29B55CFD173A560072F133810120"
    },
    wallet: WALLET_2,
  })

  await xrplClient.disconnect()
}

main()
