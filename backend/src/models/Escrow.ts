import mongoose, { Schema, Document } from "mongoose"

export enum EscrowStatus {
  PREPARED = "PREPARED",
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED"
}

export interface IEscrow extends Document {
  txHash?: string
  offerSequence?: number
  condition: string
  fulfillment: string // Encrypted
  buyerAddress: string
  sellerAddress: string
  amount: string
  cancelAfter: number
  status: EscrowStatus
  isProcessing: boolean
  isFinalized: boolean
  retryCount: number
  createdAt: Date
}

const EscrowSchema: Schema = new Schema({
  txHash: { type: String, unique: true, sparse: true },
  offerSequence: { type: Number },
  condition: { type: String, required: true },
  fulfillment: { type: String, required: true }, // Store encrypted
  buyerAddress: { type: String, required: true },
  sellerAddress: { type: String, required: true },
  amount: { type: String, required: true },
  cancelAfter: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.PREPARED 
  },
  isProcessing: { type: Boolean, default: false },
  isFinalized: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'escrow-oracle' })

export default mongoose.model<IEscrow>("Escrow", EscrowSchema)

