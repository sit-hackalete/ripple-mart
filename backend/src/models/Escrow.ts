import mongoose, { Schema, Document } from "mongoose"

export enum EscrowStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED"
}

export interface IEscrow extends Document {
  txHash: string
  offerSequence: number
  condition: string
  fulfillment: string // Encrypted
  buyerAddress: string
  sellerAddress: string
  amount: string
  cancelAfter: number
  status: EscrowStatus
  isProcessing: boolean
  createdAt: Date
}

const EscrowSchema: Schema = new Schema({
  txHash: { type: String, required: true, unique: true },
  offerSequence: { type: Number, required: true },
  condition: { type: String, required: true },
  fulfillment: { type: String, required: true }, // Store encrypted
  buyerAddress: { type: String, required: true },
  sellerAddress: { type: String, required: true },
  amount: { type: String, required: true },
  cancelAfter: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.PENDING 
  },
  isProcessing: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'escrow-oracle' })

export default mongoose.model<IEscrow>("Escrow", EscrowSchema)

