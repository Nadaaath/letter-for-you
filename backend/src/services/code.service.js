import { randomBytes, randomInt } from "node:crypto";
const PREFIXES = ["ROSE", "LOVE", "NOTE", "DEAR", "STAR", "MOON", "LILY", "HUGS"];
export function generateAccessCode() {
  return PREFIXES[randomInt(PREFIXES.length)] + "-" +
    randomBytes(12).toString("hex").toUpperCase();
}
export function generateManagementToken() {
  return randomBytes(32).toString("hex");
}
export function normalizeCode(code) {
  return String(code).trim().toUpperCase();
}
