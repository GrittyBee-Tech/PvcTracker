import mongoose, { type QueryFilter } from "mongoose";
import UserModel, { type IUser } from "../models/users.ts";
import {
  normalizeIdentifier,
  generateBlindIndex,
  encryptAES256GCM,
} from "../lib/crypto.ts";

interface MigrationStats {
  totalScanned: number;
  migrated: number;
  skipped: number;
  concurrentlyModified: number;
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
 * Migration filter: Only selects records where at least one identifier exists
 * in plaintext but has not yet been migrated to encrypted/hashed storage.
 *
 * Excludes documents with `{ migrationStatus: "failed" }` to prevent infinite retry loops.
 */
const MIGRATION_QUERY: QueryFilter<IUser> = {
  migrationStatus: { $ne: "failed" },
  $or: [
    {
      nin: { $exists: true, $type: "string", $ne: "" },
      $or: [
        { ninEncrypted: { $exists: false } },
        { ninEncrypted: null },
        { ninHash: { $exists: false } },
        { ninHash: null },
      ],
    },
    {
      vin: { $exists: true, $type: "string", $ne: "" },
      $or: [
        { vinEncrypted: { $exists: false } },
        { vinEncrypted: null },
        { vinHash: { $exists: false } },
        { vinHash: null },
      ],
    },
  ],
};

/**
 * Persistently tags a failed document in MongoDB to prevent infinite retry loops.
 */
async function tagFailedRecord(
  docId: string,
  reason: string,
  errorCode?: number
): Promise<void> {
  try {
    await UserModel.updateOne(
      { _id: docId },
      {
        $set: {
          migrationStatus: "failed",
          migrationError: errorCode
            ? `[Code ${errorCode}] ${reason}`
            : reason,
          migrationAttemptedAt: new Date(),
        },
      }
    );
  } catch (tagErr: any) {
    console.error(
      `[Quarantine Error] Failed to persist error tag on document ${docId}:`,
      tagErr.message
    );
  }
}

/**
 * Executes a batch of bulkWrite operations with error isolation and persistent error tagging.
 */
async function executeBatch(
  operations: any[],
  docIds: string[],
  failures: FailedRecord[],
  stats: MigrationStats
): Promise<void> {
  if (operations.length === 0) return;

  try {
    const result = await UserModel.bulkWrite(operations, { ordered: false });
    const modifiedCount = result.modifiedCount || 0;
    const matchedCount = result.matchedCount || 0;

    stats.migrated += modifiedCount;

    const missedMatches = operations.length - matchedCount;
    if (missedMatches > 0) {
      stats.concurrentlyModified += missedMatches;
    }
  } catch (err: any) {
    if (err.name === "MongoBulkWriteError" || err.writeErrors) {
      const writeErrors: any[] = err.writeErrors || [];
      const failedIndices = new Set<number>();

      for (const writeErr of writeErrors) {
        failedIndices.add(writeErr.index);
        const failedId = docIds[writeErr.index] || "unknown_id";
        const reason = writeErr.errmsg || writeErr.message || "Bulk write error";

        failures.push({
          docId: failedId,
          reason,
          errorCode: writeErr.code,
        });
        stats.failed++;

        await tagFailedRecord(failedId, reason, writeErr.code);
      }

      const successfulCount = operations.length - failedIndices.size;
      stats.migrated += successfulCount;
    } else {
      for (const id of docIds) {
        const reason = err.message || "Unknown batch execution error";
        failures.push({
          docId: id,
          reason,
        });
        stats.failed++;
        await tagFailedRecord(id, reason);
      }
    }
  }
}

/**
 * Main migration execution function.
 */
export async function runMigration(): Promise<MigrationStats> {
  console.log("=================================================");
  console.log("Starting NIN/VIN Zero-Downtime Migration");
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(
    `Database URI: ${MONGODB_URI ? MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@") : "undefined"}`
  );
  console.log("=================================================");

  if (!MONGODB_URI) {
    throw new Error("Pre-flight validation failed: MONGODB_URI is required.");
  }

  if (!process.env.ENCRYPTION_KEY || !process.env.BLIND_INDEX_SECRET) {
    throw new Error(
      "Pre-flight validation failed: ENCRYPTION_KEY and BLIND_INDEX_SECRET must be set."
    );
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const stats: MigrationStats = {
    totalScanned: 0,
    migrated: 0,
    skipped: 0,
    concurrentlyModified: 0,
    failed: 0,
    startTime: Date.now(),
  };

  const failures: FailedRecord[] = [];

  const cursor = UserModel.find(MIGRATION_QUERY)
    .lean()
    .cursor({ batchSize: BATCH_SIZE });

  let batchOperations: any[] = [];
  let batchDocIds: string[] = [];

  for await (const doc of cursor) {
    stats.totalScanned++;
    const updateSet: Record<string, any> = {};
    const updateUnset: Record<string, any> = {};
    let shouldUpdate = false;

    try {
      // 1. Process NIN (if legacy plaintext exists and encrypted form is missing)
      if (
        doc.nin &&
        typeof doc.nin === "string" &&
        doc.nin.trim() !== "" &&
        (!doc.ninEncrypted || !doc.ninHash)
      ) {
        const normalizedNin = normalizeIdentifier(doc.nin);
        const ninEncrypted = encryptAES256GCM(normalizedNin);
        const ninHash = generateBlindIndex(normalizedNin);

        updateSet.ninEncrypted = ninEncrypted;
        updateSet.ninHash = ninHash;
        shouldUpdate = true;
      }

      // 2. Process VIN (handle optional/sparse logic strictly)
      if (
        doc.vin &&
        typeof doc.vin === "string" &&
        doc.vin.trim() !== "" &&
        (!doc.vinEncrypted || !doc.vinHash)
      ) {
        const normalizedVin = normalizeIdentifier(doc.vin);
        const vinEncrypted = encryptAES256GCM(normalizedVin);
        const vinHash = generateBlindIndex(normalizedVin);

        updateSet.vinEncrypted = vinEncrypted;
        updateSet.vinHash = vinHash;
        shouldUpdate = true;
      } else if (
        !doc.vin ||
        typeof doc.vin !== "string" ||
        doc.vin.trim() === ""
      ) {
        // Defensive handling for sparse index:
        // Ensure no null/empty vinHash or vinEncrypted exists on documents without a VIN
        if (doc.vinHash !== undefined || doc.vinEncrypted !== undefined) {
          updateUnset.vinHash = "";
          updateUnset.vinEncrypted = "";
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        updateSet.migrationStatus = "completed";
        updateSet.migrationAttemptedAt = new Date();
        if (doc.migrationError) {
          updateUnset.migrationError = "";
        }

        const updateDoc: Record<string, any> = { $set: updateSet };
        if (Object.keys(updateUnset).length > 0) {
          updateDoc.$unset = updateUnset;
        }

        const conditionalFilter: Record<string, any> = {
          _id: doc._id,
        };

        if (doc.updatedAt) {
          conditionalFilter.updatedAt = doc.updatedAt;
        }

        if (updateSet.ninHash) {
          conditionalFilter.$or = [
            { ninHash: { $exists: false } },
            { ninHash: null },
          ];
        }

        batchOperations.push({
          updateOne: {
            filter: conditionalFilter,
            update: updateDoc,
          },
        });
        batchDocIds.push(String(doc._id));
      } else {
        stats.skipped++;
      }
    } catch (docProcessingError: any) {
      const reason = `Data transformation error: ${docProcessingError.message}`;
      failures.push({
        docId: String(doc._id),
        reason,
      });
      stats.failed++;
      await tagFailedRecord(String(doc._id), reason);
    }

    if (batchOperations.length >= BATCH_SIZE) {
      await executeBatch(batchOperations, batchDocIds, failures, stats);
      batchOperations = [];
      batchDocIds = [];
      console.log(
        `[Progress] Scanned: ${stats.totalScanned} | Migrated: ${stats.migrated} | Concurrently Modified: ${stats.concurrentlyModified} | Failed: ${stats.failed}`
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
  console.log("Migration Run Summary");
  console.log(`Total scanned:           ${stats.totalScanned}`);
  console.log(`Total migrated:          ${stats.migrated}`);
  console.log(`Total skipped:           ${stats.skipped}`);
  console.log(`Concurrently modified:   ${stats.concurrentlyModified} (preserved by optimistic lock)`);
  console.log(`Total quarantined/failed:${stats.failed}`);
  console.log(`Duration:                ${durationSec}s`);
  console.log("=================================================");

  if (failures.length > 0) {
    console.error(
      `Migration encountered ${failures.length} errors (all quarantined with migrationStatus: "failed"):`
    );
    console.error(JSON.stringify(failures.slice(0, 50), null, 2));
    if (failures.length > 50) {
      console.error(`...and ${failures.length - 50} more errors.`);
    }
  }

  return stats;
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith("migrate_nin_vin.ts")) {
  runMigration()
    .then(() => {
      console.log("Migration script completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration fatal error:", err);
      process.exit(1);
    });
}
