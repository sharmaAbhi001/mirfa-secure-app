import crypto from "crypto";
import { assertLength, safeFromHex } from "./src/utils/helper";
const ALGO = "aes-256-gcm";

// Load master key from environment variable
const MASTER_KEY_HEX = process.env.MASTER_KEY;
if (!MASTER_KEY_HEX) {
  throw new Error(
    "MASTER_KEY environment variable is required (hex-encoded 32 bytes = 64 hex characters)"
  );
}

// Validate MASTER_KEY is exactly 64 hex characters (32 bytes)
if (MASTER_KEY_HEX.length !== 64) {
  throw new Error(
    `MASTER_KEY must be exactly 64 hex characters (32 bytes), got ${MASTER_KEY_HEX.length} characters`
  );
}

const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, "hex");

// Validate MASTER_KEY is exactly 32 bytes
if (MASTER_KEY.length !== 32) {
  throw new Error(
    `MASTER_KEY must be exactly 32 bytes, got ${MASTER_KEY.length} bytes`
  );
}

function toHex(buf: Buffer) {
  return buf.toString("hex");
}

function fromHex(hex: string) {
  return Buffer.from(hex, "hex");
}

// Generate Data Encryption Key
export function generateDEK() {
  return crypto.randomBytes(32);
}

// Encrypt payload using DEK
export function encryptPayload(payload: any) {
  const dek = generateDEK();
  const nonce = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGO, dek, nonce);

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload)),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    dek,
    payload_nonce: toHex(nonce),
    payload_ct: toHex(ciphertext),
    payload_tag: toHex(tag),
  };
}

// Wrap DEK with Master Key
export function wrapDEK(dek: Buffer) {
  const nonce = crypto.randomBytes(12);
  console.log(MASTER_KEY)

  const cipher = crypto.createCipheriv(ALGO, MASTER_KEY, nonce);

  const wrapped = Buffer.concat([
    cipher.update(dek),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    dek_wrap_nonce: toHex(nonce),
    dek_wrapped: toHex(wrapped),
    dek_wrap_tag: toHex(tag),
  };
}

// Unwrap DEK
export function unwrapDEK(
  wrappedHex: string,
  nonceHex: string,
  tagHex: string
) {
  const nonce = safeFromHex(nonceHex, "nonce");
  const tag = safeFromHex(tagHex, "tag");

  assertLength(nonce, 12, "nonce");
  assertLength(tag, 16, "tag");

  const decipher = crypto.createDecipheriv(ALGO, MASTER_KEY, nonce);
  decipher.setAuthTag(tag);

  const dek = Buffer.concat([
    decipher.update(safeFromHex(wrappedHex, "ciphertext")),
    decipher.final(),
  ]);

  return dek;
}


// Decrypt payload
export function decryptPayload(
  ctHex: string,
  nonceHex: string,
  tagHex: string,
  dek: Buffer
) {
  const nonce = safeFromHex(nonceHex, "nonce");
  const tag = safeFromHex(tagHex, "tag");

  assertLength(nonce, 12, "nonce");
  assertLength(tag, 16, "tag");

  const decipher = crypto.createDecipheriv(ALGO, dek, nonce);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(safeFromHex(ctHex, "ciphertext")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString());
}

