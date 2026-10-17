import crypto from "crypto";

/**
 * Validates and retrieves the 32-byte encryption key from the environment.
 * Accepts either:
 * - A 64-character hexadecimal string representing 32 bytes
 * - A raw 32-byte UTF-8 string
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("CRITICAL: ENCRYPTION_KEY environment variable is not defined.");
  }

  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, "hex");
  }

  const utf8Buffer = Buffer.from(key, "utf8");
  if (utf8Buffer.length === 32) {
    return utf8Buffer;
  }

  throw new Error(
    `CRITICAL: Invalid ENCRYPTION_KEY length. Expected 32 bytes (or 64-character hex string), but received ${utf8Buffer.length} bytes.`
  );
}

/**
 * Validates and retrieves the blind index secret key from the environment.
 */
function getBlindIndexSecret(): string {
  const secret = process.env.BLIND_INDEX_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("CRITICAL: BLIND_INDEX_SECRET environment variable is not defined or empty.");
  }
  return secret;
}

/**
 * Normalizes an identifier string (such as NIN or VIN) prior to encryption or hashing.
 * - Strips all whitespace (leading, trailing, and internal)
 * - Converts all alphabetic characters to uppercase for deterministic matching
 *
 * @param value Raw identifier string
 * @returns Normalized identifier string
 */
export function normalizeIdentifier(value: string): string {
  if (value === null || value === undefined) {
    throw new TypeError("Cannot normalize null or undefined value");
  }
  if (typeof value !== "string") {
    throw new TypeError(`Expected string for normalization, received ${typeof value}`);
  }
  return value.replace(/\s+/g, "").toUpperCase();
}

export const normalizeNIN = normalizeIdentifier;
export const normalizeVIN = normalizeIdentifier;

/**
 * Computes a deterministic blind index using HMAC-SHA256.
 * The value MUST be normalized before computing the HMAC.
 *
 * @param normalizedValue Normalized identifier string
 * @returns 64-character hexadecimal HMAC string
 */
export function generateBlindIndex(normalizedValue: string): string {
  if (!normalizedValue || typeof normalizedValue !== "string") {
    throw new TypeError("Blind index requires a non-empty string input");
  }
  const secret = getBlindIndexSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(normalizedValue, "utf8")
    .digest("hex");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Generates a fresh, cryptographically secure 12-byte (96-bit) IV per call.
 * Serializes the output into the standard format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`.
 *
 * @param plaintext Plaintext string to encrypt
 * @returns Serialized encrypted string `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
export function encryptAES256GCM(plaintext: string): string {
  if (typeof plaintext !== "string") {
    throw new TypeError(`Expected string to encrypt, received ${typeof plaintext}`);
  }

  const key = getEncryptionKey();
  // 12-byte IV standard for AES-GCM (NIST SP 800-38D)
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertextBuffer = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTagBuffer = cipher.getAuthTag(); // 16 bytes default

  const ivHex = iv.toString("hex");
  const authTagHex = authTagBuffer.toString("hex");
  const ciphertextHex = ciphertextBuffer.toString("hex");

  return `${ivHex}:${authTagHex}:${ciphertextHex}`;
}

/**
 * Decrypts a serialized AES-256-GCM string formatted as `<iv_hex>:<authTag_hex>:<ciphertext_hex>`.
 * Verifies authentication tag integrity before returning the decrypted string.
 *
 * @param encryptedPayload Serialized string `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 * @returns Decrypted UTF-8 plaintext string
 */
export function decryptAES256GCM(encryptedPayload: string): string {
  if (!encryptedPayload || typeof encryptedPayload !== "string") {
    throw new TypeError("Encrypted payload must be a non-empty string");
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error(
      "Invalid ciphertext structure. Expected format '<iv_hex>:<authTag_hex>:<ciphertext_hex>'"
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  if (!ivHex || !authTagHex || ciphertextHex === undefined) {
    throw new Error(
      "Invalid ciphertext structure. Expected format '<iv_hex>:<authTag_hex>:<ciphertext_hex>'"
    );
  }

  // Validate IV length: 12 bytes = 24 hex characters
  if (ivHex.length !== 24 || !/^[0-9a-fA-F]+$/.test(ivHex)) {
    throw new Error(
      `Invalid IV: expected 24 hex characters (12 bytes), received length ${ivHex.length}`
    );
  }

  // Validate Auth Tag length: 16 bytes = 32 hex characters
  if (authTagHex.length !== 32 || !/^[0-9a-fA-F]+$/.test(authTagHex)) {
    throw new Error(
      `Invalid Auth Tag: expected 32 hex characters (16 bytes), received length ${authTagHex.length}`
    );
  }

  if (ciphertextHex.length > 0 && !/^[0-9a-fA-F]+$/.test(ciphertextHex)) {
    throw new Error("Invalid ciphertext: non-hex characters detected");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decryptedBuffer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decryptedBuffer.toString("utf8");
}

/**
 * Safely masks a NIN string for display (e.g., "1234*****89").
 * If the value has fewer than 6 characters, masks all characters.
 */
export function maskNin(nin?: string | null): string {
  if (!nin) return "—";
  const trimmed = nin.trim();
  if (trimmed.length < 6) return "•••••••••••";
  return `${trimmed.slice(0, 4)}•••••${trimmed.slice(-2)}`;
}

/**
 * Safely masks a VIN string for display (e.g., "90F0••••••••••451").
 * If the value has fewer than 8 characters, masks all characters.
 */
export function maskVin(vin?: string | null): string {
  if (!vin) return "—";
  const trimmed = vin.trim();
  if (trimmed.length < 8) return "•••••••••••••••••••";
  return `${trimmed.slice(0, 4)}••••••••••${trimmed.slice(-3)}`;
}
