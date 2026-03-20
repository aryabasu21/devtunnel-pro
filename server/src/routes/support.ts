import { Router, Request, Response } from "express";
import multer from "multer";
import { SupportTicket, IAttachment } from "../models/SupportTicket";
import { sendTicketNotification } from "../services/emailService";

const router = Router();

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/wav",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 5, // Max 5 files
  },
});

// POST /api/support - Create new support ticket
router.post(
  "/",
  upload.array("attachments", 5),
  async (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["name", "email", "message"],
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Process attachments
      const files = req.files as Express.Multer.File[];
      const attachments = files
        ? files.map((file) => ({
            filename: `${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            data: file.buffer,
          }))
        : [];


      // Generate unique 8-digit ticketId

      async function generateUniqueTicketId(): Promise<string> {
        let ticketId = "";
        let exists = true;
        while (exists) {
          ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
          exists = Boolean(await SupportTicket.exists({ ticketId }));
        }
        return ticketId;
      }

      const ticketId: string = await generateUniqueTicketId();

      // Create ticket
      const ticket = new SupportTicket({
        ticketId,
        name,
        email,
        subject: subject || "",
        message,
        attachments,
      });

      await ticket.save();

      console.log(
        `[Support] New ticket created: ${ticket._id} from ${email} with ${attachments.length} attachments`
      );

      // Send email notification (non-blocking)


      sendTicketNotification({
        ticketId,
        name,
        email,
        subject: subject || "",
        message,
        attachmentCount: attachments.length,
        attachments: attachments.map((a: IAttachment) => ({
          filename: a.filename,
          originalName: a.originalName,
          mimetype: a.mimetype,
          size: a.size,
        })),
      }).catch((err) => console.error("[Support] Email notification failed:", err));

      res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        ticketId,
      });
    } catch (error: any) {
      console.error("[Support] Error creating ticket:", error.message);

      if (error.message?.includes("Invalid file type")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: "Failed to create support ticket",
        details: error.message,
      });
    }
  }
);

// GET /api/support - List all tickets (admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, email, limit = 50, offset = 0 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (email) filter.email = email;

    const tickets = await SupportTicket.find(filter)
      .select("-attachments.data") // Exclude file data from listing
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(filter);

    res.json({
      tickets: tickets.map((t) => ({
        id: t._id,
        name: t.name,
        email: t.email,
        subject: t.subject,
        message: t.message.substring(0, 200) + (t.message.length > 200 ? "..." : ""),
        attachmentCount: t.attachments.length,
        status: t.status,
        createdAt: t.createdAt,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error("[Support] Error listing tickets:", error.message);
    res.status(500).json({ error: "Failed to list tickets" });
  }
});

// GET /api/support/:id - Get single ticket with attachments
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({
      id: ticket._id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      attachments: ticket.attachments.map((a) => ({
        filename: a.filename,
        originalName: a.originalName,
        mimetype: a.mimetype,
        size: a.size,
      })),
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
  } catch (error: any) {
    console.error("[Support] Error getting ticket:", error.message);
    res.status(500).json({ error: "Failed to get ticket" });
  }
});

// GET /api/support/:id/attachment/:filename - Download attachment
router.get("/:id/attachment/:filename", async (req: Request, res: Response) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const attachment = ticket.attachments.find(
      (a) => a.filename === req.params.filename
    );

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    res.set({
      "Content-Type": attachment.mimetype,
      "Content-Disposition": `inline; filename="${attachment.originalName}"`,
      "Content-Length": attachment.size,
    });

    res.send(attachment.data);
  } catch (error: any) {
    console.error("[Support] Error downloading attachment:", error.message);
    res.status(500).json({ error: "Failed to download attachment" });
  }
});

// PATCH /api/support/:id/status - Update ticket status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in_progress", "resolved", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        valid: validStatuses,
      });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-attachments.data");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({
      success: true,
      ticketId: ticket._id,
      status: ticket.status,
    });
  } catch (error: any) {
    console.error("[Support] Error updating ticket status:", error.message);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
});

export default router;
