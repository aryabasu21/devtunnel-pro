import mongoose, { Schema, Document } from "mongoose";

export interface IRequestLog extends Document {
  tunnelId: string;
  tunnelName: string;
  deviceId: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  requestBody?: string;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

const RequestLogSchema = new Schema<IRequestLog>(
  {
    tunnelId: { type: String, required: true },
    tunnelName: { type: String, required: true },
    deviceId: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    query: { type: Schema.Types.Mixed, default: {} },
    headers: { type: Schema.Types.Mixed, default: {} },
    requestBody: { type: String },
    responseStatus: { type: Number },
    responseHeaders: { type: Schema.Types.Mixed },
    responseBody: { type: String },
    duration: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
  },
  {
    timestamps: false, // We use our own timestamp field
  },
);

// Indexes for efficient queries
RequestLogSchema.index({ deviceId: 1, timestamp: -1 });
RequestLogSchema.index({ tunnelId: 1, timestamp: -1 });
RequestLogSchema.index({ timestamp: -1 });

// TTL index - auto-delete logs older than 7 days
RequestLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 },
);

export const RequestLog = mongoose.model<IRequestLog>(
  "RequestLog",
  RequestLogSchema,
);
