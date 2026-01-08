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

//   // Time based escrow

//   // we cannot claim funds from the escrow after 5 minutes
//   const cancelAfter = dayjs().add(5, "minutes").toISOString()

//   const { condition, fulfillment } = generateConditionAndFulfillment()
//   console.log("Condition:", condition)
//   console.log("Fulfillment:", fulfillment)

//   await createEscrow({
//     txn: {
//       Amount: xrpToDrops(1),
//       Condition: condition,
//       Destination: WALLET_2.address,
//       CancelAfter: isoTimeToRippleTime(cancelAfter),
//     },
//     wallet: WALLET_1,
//   })

  await finishEscrow({
    txn: {
      OfferSequence: 13800746,
      Owner: WALLET_1.address,
      Fulfillment: "A022802075DFCF50B3FEAA53B5519601ACB8ABB915445663325D914D71D0FBAC7EB67E15",
      Condition: "A0258020092F5ABC77D5728D0D0EEDD0415C3AEC7AB5B53543A1D9CD01AD0CB668D698E4810120"
    },
    wallet: WALLET_2,
  })

  await xrplClient.disconnect()
}

main()
