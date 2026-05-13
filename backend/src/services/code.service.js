import crypto from "crypto";
import bcrypt from "bcrypt";

const CODE_PREFIXES = [
  "ROSE",
  "LOVE",
  "NOTE",
  "DEAR",
  "STAR",
  "MOON",
  "LILY",
  "HUGS",
];

const SALT_ROUNDS = 12;

export function generateAccessCode() {
  const prefix = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `${prefix}-${randomPart}`;
}

export async function hashAccessCode(code) {
  return bcrypt.hash(normalizeCode(code), SALT_ROUNDS);
}

export async function compareAccessCode(code, hash) {
  return bcrypt.compare(normalizeCode(code), hash);
}

export function normalizeCode(code) {
  return code.trim().toUpperCase();
}