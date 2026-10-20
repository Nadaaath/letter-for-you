import crypto from "crypto";
import bcrypt from "bcrypt";

const PREFIXES = ["ROSE", "LOVE", "NOTE", "DEAR", "STAR", "MOON", "LILY", "HUGS"];
const SALT_ROUNDS = 12;

export function generateAccessCode() {
  // 96 bits of random entropy for newly issued reader codes.
  const prefix = PREFIXES[crypto.randomInt(PREFIXES.length)];
  return `${prefix}-${crypto.randomBytes(12).toString("hex").toUpperCase()}`;
}

export function generateManagementToken() {
  // 256 bits: this is effectively the creator's password, not a reader code.
  return crypto.randomBytes(32).toString("hex");
}

export function normalizeCode(code) {
  return code.trim().toUpperCase();
}

export async function hashAccessCode(code) {
  return bcrypt.hash(normalizeCode(code), SALT_ROUNDS);
}

export async function compareAccessCode(code, hash) {
  return bcrypt.compare(normalizeCode(code), hash);
}
