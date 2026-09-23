import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AuthenticatedIdentity {
  subject: string;
  email?: string;
  name?: string;
  organizationId?: string;
  claims: JWTPayload;
}

// Express module augmentation requires a namespace declaration.
declare global {
  namespace Express {
    interface Request {
      identity?: AuthenticatedIdentity;
    }
  }
}

const issuer = process.env.OIDC_ISSUER;
const audience = process.env.OIDC_AUDIENCE;
const jwksUrl = process.env.OIDC_JWKS_URL ||
  (issuer ? `${issuer.replace(/\/$/, "")}/.well-known/jwks.json` : undefined);

const remoteJwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;

function getBearerToken(request: Request): string | null {
  return getBearerTokenFromHeaders(request.headers);
}

export async function verifyAccessToken(token: string): Promise<AuthenticatedIdentity> {
  if (!remoteJwks || !issuer || !audience) {
    throw new Error("OIDC authentication is not configured");
  }

  const { payload } = await jwtVerify(token, remoteJwks, {
    issuer,
    audience,
  });

  if (!payload.sub) {
    throw new Error("Access token has no subject");
  }

  return {
    subject: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    organizationId:
      typeof payload.organization_id === "string"
        ? payload.organization_id
        : undefined,
    claims: payload,
  };
}

export function getBearerTokenFromHeaders(
  headers: Pick<Request["headers"], "authorization">,
): string | null {
  const authorization = headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = getBearerToken(request);
  if (!token) {
    response.status(401).json({
      error: "authentication_required",
      message: "A bearer access token is required.",
    });
    return;
  }

  try {
    request.identity = await verifyAccessToken(token);
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid access token";
    const status = message === "OIDC authentication is not configured" ? 503 : 401;

    response.status(status).json({
      error: status === 503 ? "authentication_unavailable" : "invalid_token",
      message:
        status === 503
          ? "Authentication is temporarily unavailable."
          : "The access token is invalid or expired.",
    });
  }
}

export function requireIdentity(request: Request): AuthenticatedIdentity {
  if (!request.identity) {
    throw new Error("Authenticated identity is missing");
  }

  return request.identity;
}

export function requireRole(role: string) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const identity = request.identity;
    const roles = identity?.claims.roles;
    const roleList = Array.isArray(roles)
      ? roles.filter((value): value is string => typeof value === "string")
      : [];

    if (!identity || !roleList.includes(role)) {
      response.status(403).json({
        error: "insufficient_permissions",
        message: "You do not have permission to access this resource.",
      });
      return;
    }

    next();
  };
}
