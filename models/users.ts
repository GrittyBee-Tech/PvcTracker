import mongoose, {
  Schema,
  Document,
  Model,
  type HydratedDocument,
} from "mongoose";
import type { UserType } from "../types/index.ts";
import {
  decryptAES256GCM,
  generateBlindIndex,
  normalizeIdentifier,
} from "../lib/crypto.ts";

export interface IUserMethods {
  getDecryptedIdentifiers(): { nin: string | null; vin: string | null };
}

export interface IUser extends UserType, Document {
  pvcStatusUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser, Record<string, never>, IUserMethods> {
  findByNIN(
    plainNIN: string
  ): Promise<HydratedDocument<IUser, IUserMethods> | null>;
  findByVIN(
    plainVIN: string
  ): Promise<HydratedDocument<IUser, IUserMethods> | null>;
}

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    datePvcCollected: { type: Date },
    gender: { type: String, required: true, enum: ["male", "female"] },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },

    // Legacy plaintext fields - made optional for zero-downtime backwards compatibility
    nin: { type: String, required: false },
    vin: { type: String, required: false },

    // Encrypted storage (AES-256-GCM)
    // Structure: <12_byte_iv_hex>:<16_byte_authTag_hex>:<ciphertext_hex>
    ninEncrypted: { type: String, required: false },
    vinEncrypted: { type: String, required: false },

    // Deterministic Blind Indexes (HMAC-SHA256)
    ninHash: { type: String, required: false },
    vinHash: { type: String, required: false },

    // Migration lifecycle & quarantine fields
    migrationStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: false,
    },
    migrationError: { type: String, required: false },
    migrationAttemptedAt: { type: Date, required: false },

    ninStatus: {
      type: String,
      enum: ["pending", "rejected", "verified"],
      default: "pending",
      required: true,
    },
    pvcStatus: {
      type: String,
      enum: ["collected", "not_collected"],
      default: "not_collected",
      required: true,
    },
    pvcStatusUpdatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    stateOfOrigin: { type: String, required: false },
    lgaOfOrigin: { type: String, required: false },
    votingState: { type: String, required: false },
    votingLga: { type: String, required: false },
    homeAddress: { type: String, required: false },
    isDisabled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "restricted", "deleted"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

/**
 * EXACT INDEX DEFINITIONS:
 *
 * 1. ninHash Index:
 *    - unique: true -> Enforces strict one-user-per-NIN constraint on the blind index.
 *    - sparse: true -> Prevents collision on documents where ninHash is not yet set.
 *    - partialFilterExpression -> Excludes null/undefined documents from indexing to prevent E11000 null key collisions.
 *
 * 2. vinHash Index:
 *    - unique: true -> Guarantees unique VIN if provided.
 *    - sparse: true -> Excludes documents without VIN.
 *    - partialFilterExpression -> Guarantees that null/missing values never conflict in sparse unique index.
 */
UserSchema.index(
  { ninHash: 1 },
  {
    unique: true,
    sparse: true,
    name: "idx_users_ninHash_unique_sparse",
    partialFilterExpression: { ninHash: { $type: "string" } },
  }
);

UserSchema.index(
  { vinHash: 1 },
  {
    unique: true,
    sparse: true,
    name: "idx_users_vinHash_unique_sparse",
    partialFilterExpression: { vinHash: { $type: "string" } },
  }
);

/**
 * INSTANCE METHOD: getDecryptedIdentifiers
 * Safely decrypts authenticated ciphertexts for authorized view/audit flows.
 * Seamlessly falls back to plaintext if the document is still in transitional state.
 */
UserSchema.methods.getDecryptedIdentifiers = function (
  this: HydratedDocument<IUser, IUserMethods>
): { nin: string | null; vin: string | null } {
  let nin: string | null = null;
  let vin: string | null = null;

  if (this.ninEncrypted) {
    try {
      nin = decryptAES256GCM(this.ninEncrypted);
    } catch {
      nin = this.nin || null;
    }
  } else if (this.nin) {
    nin = this.nin;
  }

  if (this.vinEncrypted) {
    try {
      vin = decryptAES256GCM(this.vinEncrypted);
    } catch {
      vin = this.vin || null;
    }
  } else if (this.vin) {
    vin = this.vin;
  }

  return { nin, vin };
};

/**
 * Dual-read query helper for NIN:
 * 1. Computes deterministic blind index for normalized input.
 * 2. Attempts exact-match lookup on `ninHash`.
 * 3. Falls back to plaintext query on `nin` if not yet migrated.
 */
export async function findUserByNIN(
  plainNIN: string
): Promise<HydratedDocument<IUser, IUserMethods> | null> {
  if (!plainNIN || typeof plainNIN !== "string") {
    return null;
  }

  const normalized = normalizeIdentifier(plainNIN);
  const blindIndex = generateBlindIndex(normalized);

  const migratedDoc = await UserModel.findOne({ ninHash: blindIndex });
  if (migratedDoc) {
    return migratedDoc;
  }

  return UserModel.findOne({
    $or: [{ nin: plainNIN }, { nin: normalized }],
  });
}

/**
 * Dual-read query helper for VIN.
 */
export async function findUserByVIN(
  plainVIN: string
): Promise<HydratedDocument<IUser, IUserMethods> | null> {
  if (!plainVIN || typeof plainVIN !== "string") {
    return null;
  }

  const normalized = normalizeIdentifier(plainVIN);
  const blindIndex = generateBlindIndex(normalized);

  const migratedDoc = await UserModel.findOne({ vinHash: blindIndex });
  if (migratedDoc) {
    return migratedDoc;
  }

  return UserModel.findOne({
    $or: [{ vin: plainVIN }, { vin: normalized }],
  });
}

UserSchema.statics.findByNIN = findUserByNIN;
UserSchema.statics.findByVIN = findUserByVIN;

// Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: IUserModel =
  ((mongoose.models.User as unknown) as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", UserSchema);

// If model was cached in Next.js development hot-reload without statics,
// attach the statics directly so both UserModel.findByVIN and findUserByVIN work
if (UserModel) {
  UserModel.findByNIN = findUserByNIN;
  UserModel.findByVIN = findUserByVIN;
}

export default UserModel;
