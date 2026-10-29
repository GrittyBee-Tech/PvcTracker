import mongoose, { type QueryFilter } from "mongoose";
import UserModel, { type IUser } from "../models/users.ts";
import { decryptAES256GCM } from "../lib/crypto.ts";

// Run * node --env-file=.env --experimental-strip-types scripts/rollback_nin_vin.ts
interface RollbackStats {
  totalScanned: number;
  rolledBack: number;
  skipped: number;
  failed: number;
  startTime: number;
  endTime?: number;
}

interface FailedRecord {
  docId: string;
  reason: string;
  errorCode?: number;
}

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "500", 10);
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Filter to find any documents that still have encrypted or blind-indexed fields.
 */
const ROLLBACK_QUERY: QueryFilter<IUser> = {
  $or: [
    { ninEncrypted: { $exists: true } },
    { ninHash: { $exists: true } },
    { vinEncrypted: { $exists: true } },
    { vinHash: { $exists: true } },
    { migrationStatus: { $exists: true } },
  ],
};

/**
 * Executes a batch of bulkWrite operations with error isolation.
 */
async function executeBatch(
  operations: any[],
  docIds: string[],
  failures: FailedRecord[],
  stats: RollbackStats,
): Promise<void> {
  if (operations.length === 0) return;

  try {
    const result = await UserModel.bulkWrite(operations, { ordered: false });
    const modifiedCount = result.modifiedCount || 0;
    stats.rolledBack += modifiedCount;
    stats.skipped += operations.length - modifiedCount;
  } catch (err: any) {
    if (err.name === "MongoBulkWriteError" || err.writeErrors) {
      const writeErrors: any[] = err.writeErrors || [];
      const failedIndices = new Set<number>();

      for (const writeErr of writeErrors) {
        failedIndices.add(writeErr.index);
        const failedId = docIds[writeErr.index] || "unknown_id";
        failures.push({
          docId: failedId,
          reason: writeErr.errmsg || writeErr.message,
          errorCode: writeErr.code,
        });
        stats.failed++;
      }

      const successfulCount = operations.length - failedIndices.size;
      stats.rolledBack += successfulCount;
    } else {
      for (const id of docIds) {
        failures.push({
          docId: id,
          reason:
            err.message || "Unknown batch execution error during rollback",
        });
        stats.failed++;
      }
    }
  }
}

/**
 * Main rollback execution function.
 * Restores plaintext nin and vin from ciphertext if they were omitted/cleared,
 * and unsets ninEncrypted, ninHash, vinEncrypted, and vinHash.
 */
export async function runRollback(): Promise<RollbackStats> {
  console.log("=================================================");
  console.log("Starting NIN/VIN Schema Rollback Script");
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(
    `Database URI: ${MONGODB_URI ? MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@") : "undefined"}`,
  );
  console.log("=================================================");

  if (!MONGODB_URI) {
    throw new Error("Pre-flight validation failed: MONGODB_URI is required.");
  }

  if (!process.env.ENCRYPTION_KEY) {
    throw new Error(
      "Pre-flight validation failed: ENCRYPTION_KEY is required to restore plaintext fields if missing.",
    );
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const stats: RollbackStats = {
    totalScanned: 0,
    rolledBack: 0,
    skipped: 0,
    failed: 0,
    startTime: Date.now(),
  };

  const failures: FailedRecord[] = [];

  const cursor = UserModel.find(ROLLBACK_QUERY)
    .lean()
    .cursor({ batchSize: BATCH_SIZE });

  let batchOperations: any[] = [];
  let batchDocIds: string[] = [];

  for await (const doc of cursor) {
    stats.totalScanned++;
    const updateSet: Record<string, any> = {};
    const updateUnset: Record<string, any> = {
      ninEncrypted: "",
      ninHash: "",
      vinEncrypted: "",
      vinHash: "",
      migrationStatus: "",
      migrationError: "",
      migrationAttemptedAt: "",
    };

    try {
      // 1. If plaintext `nin` was dropped or missing, decrypt `ninEncrypted` to restore it
      if (
        (!doc.nin || typeof doc.nin !== "string" || doc.nin.trim() === "") &&
        doc.ninEncrypted
      ) {
        updateSet.nin = decryptAES256GCM(doc.ninEncrypted);
      }

      // 2. If plaintext `vin` was dropped or missing, decrypt `vinEncrypted` to restore it
      if (
        (!doc.vin || typeof doc.vin !== "string" || doc.vin.trim() === "") &&
        doc.vinEncrypted
      ) {
        updateSet.vin = decryptAES256GCM(doc.vinEncrypted);
      }

      const updateDoc: Record<string, any> = { $unset: updateUnset };
      if (Object.keys(updateSet).length > 0) {
        updateDoc.$set = updateSet;
      }

      batchOperations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: updateDoc,
        },
      });
      batchDocIds.push(String(doc._id));
    } catch (docError: any) {
      failures.push({
        docId: String(doc._id),
        reason: `Decryption/Rollback error: ${docError.message}`,
      });
      stats.failed++;
    }

    if (batchOperations.length >= BATCH_SIZE) {
      await executeBatch(batchOperations, batchDocIds, failures, stats);
      batchOperations = [];
      batchDocIds = [];
      console.log(
        `[Rollback Progress] Scanned: ${stats.totalScanned} | Rolled back: ${stats.rolledBack} | Failed: ${stats.failed}`,
      );
    }
  }

  if (batchOperations.length > 0) {
    await executeBatch(batchOperations, batchDocIds, failures, stats);
    batchOperations = [];
    batchDocIds = [];
  }

  stats.endTime = Date.now();
  const durationSec = ((stats.endTime - stats.startTime) / 1000).toFixed(2);

  console.log("=================================================");
  console.log("Rollback Run Summary");
  console.log(`Total scanned:     ${stats.totalScanned}`);
  console.log(`Total rolled back: ${stats.rolledBack}`);
  console.log(`Total skipped:     ${stats.skipped}`);
  console.log(`Total failed:      ${stats.failed}`);
  console.log(`Duration:          ${durationSec}s`);
  console.log("=================================================");

  if (failures.length > 0) {
    console.error(`Rollback encountered ${failures.length} errors:`);
    console.error(JSON.stringify(failures.slice(0, 50), null, 2));
  }

  return stats;
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith("rollback_nin_vin.ts")) {
  runRollback()
    .then(() => {
      console.log("Rollback script completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Rollback fatal error:", err);
      process.exit(1);
    });
}
