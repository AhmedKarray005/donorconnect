import "dotenv/config";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret?.trim() || secret === "dev-secret") {
    throw new Error("JWT_SECRET must be configured with a unique signing secret");
  }
  return secret;
}
