import mongoose from "mongoose";
import UserModel from "../models/users.ts";
import VerificationSessionModel from "../models/verificationSession.ts";
import AuditLogModel from "../models/auditLog.ts";

/**
 * ==============================================================================
 * ADMIN ID CONFIGURATION
 * ==============================================================================
 * You can set your Admin User ID directly in the ADMIN_USER_ID variable below,
 * or pass it via the environment variable `ADMIN_USER_ID=<id>`,
 * or pass it via CLI argument `--admin-id=<id>` or `--admin-id <id>`.
 * Run node --env-file=.env --experimental-strip-types scripts/rollback_rejected_nin_sessions.ts
 */
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";

const MONGODB_URI = process.env.MONGODB_URI;

function parseAdminIdFromArgs(): string {
  if (ADMIN_USER_ID && ADMIN_USER_ID.trim()) {
    return ADMIN_USER_ID.trim();
  }

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--admin-id=")) {
      return args[i].split("=")[1].trim();
    }
    if (args[i] === "--admin-id" && args[i + 1]) {
      return args[i + 1].trim();
    }
  }

  return "";
}

const isDryRun =
  process.argv.includes("--dry-run") || !process.argv.includes("--execute");

export async function rollbackRejectedSessions() {
  console.log("=================================================");
  console.log("Rollback: Undo Bulk Reset of Rejected NIN Sessions");
  console.log(
    `Mode: ${isDryRun ? "DRY RUN (Preview Only - No Changes)" : "EXECUTE (Applying Rollback)"}`,
  );
  console.log("=================================================");

  const rawAdminId = parseAdminIdFromArgs();

  // Validate Admin User
  if (!rawAdminId) {
    console.error(
      "\n❌ Error: Admin ID is required to authorize and audit this rollback.",
    );
    console.error(
      "Please provide your admin ID via one of the following methods:",
    );
    console.error(
      "  1. Edit ADMIN_USER_ID at the top of scripts/rollback_rejected_nin_sessions.ts",
    );
    console.error(
      '  2. Set ADMIN_USER_ID in your environment: ADMIN_USER_ID="<id>" npm run db:rollback:rejected-nin',
    );
    console.error(
      '  3. Pass the flag: npm run db:rollback:rejected-nin -- --admin-id="<id>"\n',
    );
    process.exit(1);
  }

  if (!mongoose.Types.ObjectId.isValid(rawAdminId)) {
    console.error(
      `\n❌ Error: Provided Admin ID "${rawAdminId}" is not a valid MongoDB ObjectId.\n`,
    );
    process.exit(1);
  }

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required. Ensure .env or .env.local is loaded.",
    );
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const adminUser = await UserModel.findById(rawAdminId);
  if (!adminUser) {
    console.error(
      `\n❌ Error: User with ID "${rawAdminId}" not found in database.\n`,
    );
    process.exit(1);
  }

  if (adminUser.role !== "admin") {
    console.error(
      `\n❌ Error: User "${adminUser.name}" (${adminUser.email}) does not have admin privileges (role: "${adminUser.role}").\n`,
    );
    process.exit(1);
  }

  console.log(
    `\nVerified Admin: ${adminUser.name} (${adminUser.email}) [ID: ${adminUser._id}]`,
  );

  // Look for the audit log from the bulk reset
  const auditLog = await AuditLogModel.findOne({
    action: "BULK_RESET_VERIFICATION_SESSIONS",
  }).sort({ createdAt: -1 });

  let sessionObjectIds: mongoose.Types.ObjectId[] = [];
  let userObjectIds: mongoose.Types.ObjectId[] = [];

  if (auditLog && auditLog.metadata?.affectedSessionIds?.length) {
    console.log(
      `Found previous reset audit log from ${auditLog.createdAt.toISOString()} with ${auditLog.metadata.affectedSessionIds.length} session(s).`,
    );
    sessionObjectIds = auditLog.metadata.affectedSessionIds
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    if (auditLog.metadata?.affectedUserIds?.length) {
      userObjectIds = auditLog.metadata.affectedUserIds
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));
    }
  } else {
    console.log(
      "No audit log entry found. Falling back to sessions with reset status reason...",
    );
    const sessions = await VerificationSessionModel.find({
      status_reason: "Admin reset: Re-enabled for user retry without payment",
      status: "pending",
    });
    sessionObjectIds = sessions.map((s) => s._id as mongoose.Types.ObjectId);
    userObjectIds = sessions
      .map((s) => s.user_id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
  }

  if (sessionObjectIds.length === 0) {
    console.log("\nNo reset sessions found to rollback.");
    return;
  }

  // Fetch the current records to be rolled back
  const sessionsToRollback = await VerificationSessionModel.find({
    _id: { $in: sessionObjectIds },
  });

  const usersToRollback = await UserModel.find({
    _id: { $in: userObjectIds },
  });

  const userMap = new Map(usersToRollback.map((u) => [u._id.toString(), u]));

  console.log(
    `\nFound ${sessionsToRollback.length} session(s) and ${usersToRollback.length} user(s) to restore to REJECTED status:\n`,
  );
  console.log("-------------------------------------------------");
  sessionsToRollback.forEach((session, index) => {
    const user = userMap.get(session.user_id);
    const userName = user
      ? `${user.firstName} ${user.lastName}`
      : "Unknown User";
    const userEmail = user?.email || "Unknown Email";
    console.log(
      `[${index + 1}] Session ID: ${session._id} | User: ${userName} (${userEmail})`,
    );
    console.log(
      `    Current Session Status: ${session.status} -> will be REJECTED`,
    );
    console.log(
      `    Current User NIN Status: ${user?.ninStatus || "N/A"} -> will be REJECTED`,
    );
  });
  console.log("-------------------------------------------------");

  if (isDryRun) {
    console.log("\n[DRY RUN COMPLETE]");
    console.log(
      `To execute the rollback and restore these ${sessionsToRollback.length} session(s) and user(s) back to REJECTED, run:`,
    );
    console.log(
      `  node --env-file=.env --experimental-strip-types scripts/rollback_rejected_nin_sessions.ts --admin-id=${rawAdminId} --execute\n`,
    );
    return;
  }

  // EXECUTE MODE: Apply Rollback
  console.log("\nRestoring sessions and users to rejected status...");

  const sessionUpdateResult = await VerificationSessionModel.updateMany(
    { _id: { $in: sessionObjectIds } },
    {
      $set: {
        status: "rejected",
        status_reason:
          "Your profile information does not match your official NIN record. Please pay and verify again.",
      },
    },
  );

  const userUpdateResult = await UserModel.updateMany(
    { _id: { $in: userObjectIds } },
    {
      $set: {
        ninStatus: "rejected",
      },
    },
  );

  // Create Audit Log for Rollback
  await AuditLogModel.create({
    adminId: adminUser._id,
    action: "ROLLBACK_BULK_RESET_VERIFICATION_SESSIONS",
    targetModel: "VerificationSession",
    details: `Admin ${adminUser.name} (${adminUser.email}) rolled back the bulk reset, restoring ${sessionUpdateResult.modifiedCount} session(s) and ${userUpdateResult.modifiedCount} user(s) back to rejected status.`,
    metadata: {
      sessionsRolledBack: sessionUpdateResult.modifiedCount,
      usersRolledBack: userUpdateResult.modifiedCount,
      affectedSessionIds: sessionObjectIds.map((id) => id.toString()),
      affectedUserIds: userObjectIds.map((id) => id.toString()),
      originalAuditLogId: auditLog?._id?.toString(),
      adminEmail: adminUser.email,
    },
  });

  console.log("\n=================================================");
  console.log("✅ Rollback Completed Successfully!");
  console.log(
    `Verification sessions restored to rejected: ${sessionUpdateResult.modifiedCount}`,
  );
  console.log(
    `Users restored to rejected:               ${userUpdateResult.modifiedCount}`,
  );
  console.log(
    `Audit log created under:                  ${adminUser.name} (${adminUser.email})`,
  );
  console.log("=================================================\n");
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("rollback_rejected_nin_sessions.ts")
) {
  rollbackRejectedSessions()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Fatal Error:", err);
      process.exit(1);
    });
}
