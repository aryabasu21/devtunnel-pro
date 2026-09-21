import { z } from "zod";

const identifier = z.string().trim().min(1).max(128);

export const registerMessageSchema = z
  .object({
    type: z.literal("register"),
    deviceId: identifier,
    localPort: z.number().int().min(1).max(65535),
    remotePort: z.number().int().min(1).max(65535).optional(),
    subdomain: z.string().trim().min(1).max(63).optional(),
    password: z.string().min(8).max(256).optional(),
    demo: z.boolean().optional(),
  })
  .strict();

export const responseMessageSchema = z
  .object({
    type: z.literal("response"),
    requestId: identifier,
    status: z.number().int().min(100).max(599),
    headers: z.record(z.string(), z.string()).default({}),
    body: z.string().max(20_000_000).default(""),
  })
  .strict();

export const stopMessageSchema = z
  .object({
    type: z.literal("stop"),
    tunnelId: identifier,
  })
  .strict();

export const pingMessageSchema = z
  .object({
    type: z.literal("ping"),
  })
  .strict();

export const clientMessageSchema = z.discriminatedUnion("type", [
  registerMessageSchema,
  responseMessageSchema,
  stopMessageSchema,
  pingMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
