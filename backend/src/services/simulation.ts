import { EscrowStatus } from "../models/Escrow"

export interface JourneyStage {
  currentStatus: EscrowStatus
  nextStatus: EscrowStatus | "NONE"
  secondsToNextStage: number
  isConfirmable: boolean
  message: string
  location: string
}

/**
 * Calculates the "China -> Singapore" journey stage based on the record's createdAt.
 * 
 * - PENDING: 0-1 min (Processing in China)
 * - IN_TRANSIT: 1-3 mins (Flying to Singapore)
 * - DELIVERED: 3+ mins (Arrived at Destination)
 */
export const getJourneyStage = (createdAt: Date, status?: EscrowStatus): JourneyStage => {
  if (status === EscrowStatus.PREPARED) {
    return {
      currentStatus: EscrowStatus.PREPARED,
      nextStatus: EscrowStatus.PENDING,
      secondsToNextStage: 0,
      isConfirmable: false,
      message: "Waiting for XRPL transaction to be finalized...",
      location: "Customer Checkout"
    }
  }

  const now = new Date()
  const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
  const elapsedMinutes = elapsedSeconds / 60

  if (elapsedMinutes < 1) {
    return {
      currentStatus: EscrowStatus.PENDING,
      nextStatus: EscrowStatus.IN_TRANSIT,
      secondsToNextStage: Math.max(0, 60 - elapsedSeconds),
      isConfirmable: false,
      message: "Processing shipment in Shenzhen, China",
      location: "Shenzhen, China"
    }
  } else if (elapsedMinutes < 3) {
    return {
      currentStatus: EscrowStatus.IN_TRANSIT,
      nextStatus: EscrowStatus.DELIVERED,
      secondsToNextStage: Math.max(0, 180 - elapsedSeconds),
      isConfirmable: false,
      message: "Package is on a flight to Singapore",
      location: "In Transit"
    }
  } else {
    return {
      currentStatus: EscrowStatus.DELIVERED,
      nextStatus: "NONE",
      secondsToNextStage: 0,
      isConfirmable: true,
      message: "Arrived at destination in Singapore. Ready for collection.",
      location: "Singapore"
    }
  }
}

