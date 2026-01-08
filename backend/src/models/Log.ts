import mongoose, { Schema, Document } from "mongoose"

export enum ActionType {
  CREATE = "CREATE",
  FINISH = "FINISH",
  CANCEL = "CANCEL"
}

export interface ILog extends Document {
  txHash: string
  engineResult: string
  engineMessage: string
  actionType: ActionType
  timestamp: Date
}

const LogSchema: Schema = new Schema({
  txHash: { type: String, required: true },
  engineResult: { type: String, required: true },
  engineMessage: { type: String, required: true },
  actionType: { 
    type: String, 
    enum: Object.values(ActionType),
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model<ILog>("Log", LogSchema)

