import { Router, Request, Response } from "express";
import { RequestLog } from "../models/RequestLog";
import { z } from "zod";

const router = Router();

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});

const requestFilterSchema = z.object({
  deviceId: z.string().trim().min(1).max(128).optional(),
  tunnelId: z.string().trim().min(1).max(128).optional(),
});

// GET /api/requests?deviceId=xxx&tunnelId=xxx&limit=50&offset=0
router.get("/", async (req: Request, res: Response) => {
  try {
    const pagination = paginationSchema.safeParse(req.query);
    const filters = requestFilterSchema.safeParse(req.query);
    if (!pagination.success || !filters.success) {
      return res.status(400).json({
        error: "invalid_request_parameters",
        message: "Invalid request log filters or pagination values.",
      });
    }

    const { limit, offset } = pagination.data;
    const { deviceId, tunnelId } = filters.data;

    const filter: Record<string, string> = {};
    if (deviceId) filter.deviceId = deviceId;
    if (tunnelId) filter.tunnelId = tunnelId;

    const logs = await RequestLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .lean();

    const total = await RequestLog.countDocuments(filter);

    res.json({
      logs: logs.map((log) => ({
        id: log._id,
        tunnelId: log.tunnelId,
        tunnelName: log.tunnelName,
        method: log.method,
        path: log.path,
        query: log.query,
        status: log.responseStatus || 0,
        duration: log.duration,
        timestamp: log.timestamp,
        userAgent: log.userAgent,
        ip: log.ip,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error("[Requests] Error fetching logs:", error.message);
    res.status(500).json({ error: "Failed to fetch request logs" });
  }
});

// GET /api/requests/:id - Get single request with full details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const log = await RequestLog.findById(req.params.id).lean();

    if (!log) {
      return res.status(404).json({ error: "Request log not found" });
    }

    res.json({
      id: log._id,
      tunnelId: log.tunnelId,
      tunnelName: log.tunnelName,
      method: log.method,
      path: log.path,
      query: log.query,
      headers: log.headers,
      requestBody: log.requestBody,
      responseStatus: log.responseStatus,
      responseHeaders: log.responseHeaders,
      responseBody: log.responseBody,
      duration: log.duration,
      timestamp: log.timestamp,
      userAgent: log.userAgent,
      ip: log.ip,
    });
  } catch (error: any) {
    console.error("[Requests] Error fetching log:", error.message);
    res.status(500).json({ error: "Failed to fetch request log" });
  }
});

// POST /api/requests/:id/replay - Replay a request
router.post("/:id/replay", async (req: Request, res: Response) => {
  try {
    const log = await RequestLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ error: "Request log not found" });
    }

    // TODO: Implement actual replay logic
    // For now, just return the request details that would be replayed

    res.json({
      success: true,
      message: "Request replay initiated",
      request: {
        method: log.method,
        path: log.path,
        headers: log.headers,
        body: log.requestBody,
      },
    });
  } catch (error: any) {
    console.error("[Requests] Error replaying request:", error.message);
    res.status(500).json({ error: "Failed to replay request" });
  }
});

// DELETE /api/requests - Delete old logs (cleanup endpoint)
router.delete("/", async (req: Request, res: Response) => {
  try {
    const olderThan = z.coerce.number().int().min(1).max(365).safeParse(req.query.olderThan ?? 7);
    if (!olderThan.success) {
      return res.status(400).json({
        error: "invalid_retention_period",
        message: "olderThan must be an integer between 1 and 365 days.",
      });
    }

    const cutoff = new Date(Date.now() - olderThan.data * 24 * 60 * 60 * 1000);

    const result = await RequestLog.deleteMany({ timestamp: { $lt: cutoff } });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      cutoff: cutoff.toISOString(),
    });
  } catch (error: any) {
    console.error("[Requests] Error deleting logs:", error.message);
    res.status(500).json({ error: "Failed to delete logs" });
  }
});

export default router;