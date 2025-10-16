import mongoose, { Schema, Document } from "mongoose";

export interface IURL extends Document {
  stdId: string;
  originalUrl: string;
  userId: mongoose.Types.ObjectId;         
  isActive: boolean;
  expiresAt: Date | null;
}

const urlSchema = new Schema<IURL>(
  {
    stdId: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true ,ref:"User"}, 
    isActive: { type: Boolean, default: true,required: true },
    expiresAt: { type: Date, default: null, required: true },
  },
  { timestamps: true }
);

const URL = mongoose.models.URL || mongoose.model("URL", urlSchema);

export default URL;
