import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;
  ownerSubject: string;
  createdAt: Date;
  lastSeenAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    ownerSubject: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const Device = mongoose.model<IDevice>("Device", DeviceSchema);
