function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3001),
  domain: process.env.DOMAIN || "localhost:3001",
  mongodbUri: required("MONGODB_URI"),
  oidcIssuer: process.env.OIDC_ISSUER,
  oidcAudience: process.env.OIDC_AUDIENCE,
  oidcJwksUrl: process.env.OIDC_JWKS_URL,
  requireRedis: process.env.REQUIRE_REDIS === "true",
};

if ((config.oidcIssuer && !config.oidcAudience) || (!config.oidcIssuer && config.oidcAudience)) {
  throw new Error("OIDC_ISSUER and OIDC_AUDIENCE must be configured together");
}

if (config.requireRedis && !process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required when REQUIRE_REDIS=true");
}
