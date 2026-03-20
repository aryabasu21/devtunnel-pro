import mongoose, { Schema, Document } from "mongoose";
export interface ISupportTicket extends Document {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    data: Buffer;
  }[];
  status: "pending" | "in_progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
});

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true },
    attachments: { type: [AttachmentSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
SupportTicketSchema.index({ ticketId: 1 }, { unique: true });
SupportTicketSchema.index({ email: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicket>(
  "SupportTicket",
  SupportTicketSchema,
);
