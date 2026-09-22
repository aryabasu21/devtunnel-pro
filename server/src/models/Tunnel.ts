import mongoose, { Document, Schema } from "mongoose";

export type TunnelRecordStatus =
  | "pending"
  | "live"
  | "disconnected"
  | "expired"
  | "stopped";

export interface ITunnel extends Document {
  tunnelId: string;
  name: string;
  url: string;
  deviceId: string;
  ownerSubject?: string;
  localPort: number;
  status: TunnelRecordStatus;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date | null;
}

const TunnelSchema = new Schema<ITunnel>(
  {
    tunnelId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    deviceId: { type: String, required: true, index: true },
    ownerSubject: { type: String, index: true },
    localPort: { type: Number, required: true, min: 1, max: 65535 },
    status: {
      type: String,
      enum: ["pending", "live", "disconnected", "expired", "stopped"],
      required: true,
      index: true,
    },
    createdAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: false },
);

TunnelSchema.index({ deviceId: 1, createdAt: -1 });
TunnelSchema.index({ expiresAt: 1 }, { sparse: true });

export const TunnelRecord = mongoose.model<ITunnel>("Tunnel", TunnelSchema);
