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
 * Run   node --env-file=.env --experimental-strip-types scripts/reset_rejected_nin_sessions.ts
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

export async function resetRejectedSessions() {
  console.log("=================================================");
  console.log("Bulk Reset: Rejected NIN Verification Sessions");
  console.log(
    `Mode: ${isDryRun ? "DRY RUN (Preview Only - No Changes)" : "EXECUTE (Applying Database Changes)"}`,
  );
  console.log("=================================================");

  const rawAdminId = parseAdminIdFromArgs();

  // Validate Admin User
  if (!rawAdminId) {
    console.error(
      "\n❌ Error: Admin ID is required to authorize and audit this reset.",
    );
    console.error(
      "Please provide your admin ID via one of the following methods:",
    );
    console.error(
      "  1. Edit ADMIN_USER_ID at the top of scripts/reset_rejected_nin_sessions.ts",
    );
    console.error(
      '  2. Set ADMIN_USER_ID in your environment: ADMIN_USER_ID="<id>" npm run db:reset:rejected-nin',
    );
    console.error(
      '  3. Pass the flag: npm run db:reset:rejected-nin -- --admin-id="<id>"\n',
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

  // Query all rejected verification sessions
  const rejectedSessions = await VerificationSessionModel.find({
    status: "rejected",
  }).sort({ createdAt: -1 });

  console.log(
    `Found ${rejectedSessions.length} rejected verification session(s) in the database.\n`,
  );

  if (rejectedSessions.length === 0) {
    console.log("No rejected sessions to reset.");
    return;
  }

  const userIds = [
    ...new Set(rejectedSessions.map((s) => s.user_id).filter(Boolean)),
  ];

  // Fetch all associated users
  const userObjectIds = userIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const associatedUsers = await UserModel.find({
    $or: [{ _id: { $in: userObjectIds } }, { _id: { $in: userIds } }],
  });

  const userMap = new Map(associatedUsers.map((u) => [u._id.toString(), u]));

  console.log("Listing Sessions to Reset:");
  console.log("-------------------------------------------------");
  rejectedSessions.forEach((session, index) => {
    const user = userMap.get(session.user_id);
    const userName = user
      ? `${user.firstName} ${user.lastName}`
      : "Unknown User";
    const userEmail = user?.email || "Unknown Email";
    const ninStatus = user?.ninStatus || "N/A";
    console.log(
      `[${index + 1}] Session ID: ${session._id} | User: ${userName} (${userEmail}) | User NIN Status: ${ninStatus}`,
    );
    console.log(`    Reason: ${session.status_reason || "None specified"}`);
    if (session.mismatches && session.mismatches.length > 0) {
      console.log(
        `    Mismatches (${session.mismatches.length}): ${session.mismatches
          .map((m) => `${m.field}: DB="${m.dbValue}" vs NIN="${m.ninValue}"`)
          .join("; ")}`,
      );
    }
  });
  console.log("-------------------------------------------------");

  if (isDryRun) {
    console.log("\n[DRY RUN COMPLETE]");
    console.log(
      `To execute the reset for these ${rejectedSessions.length} session(s) and their associated users, run:`,
    );
    console.log(
      `  node --env-file=.env --experimental-strip-types scripts/reset_rejected_nin_sessions.ts --admin-id=${rawAdminId} --execute\n`,
    );
    return;
  }

  // EXECUTE MODE: Apply changes
  console.log("\nApplying database updates...");

  // 1. Reset Verification Sessions
  const sessionUpdateResult = await VerificationSessionModel.updateMany(
    { status: "rejected" },
    {
      $set: {
        status: "pending",
        status_reason: "Admin reset: Re-enabled for user retry without payment",
        mismatches: [],
      },
    },
  );

  // 2. Reset Users ninStatus to pending
  const userUpdateResult = await UserModel.updateMany(
    {
      $or: [
        { _id: { $in: userObjectIds } },
        { _id: { $in: userIds } },
        { ninStatus: "rejected" },
      ],
    },
    {
      $set: {
        ninStatus: "pending",
      },
    },
  );

  // 3. Log Audit Entry
  await AuditLogModel.create({
    adminId: adminUser._id,
    action: "BULK_RESET_VERIFICATION_SESSIONS",
    targetModel: "VerificationSession",
    details: `Admin ${adminUser.name} (${adminUser.email}) bulk-reset ${sessionUpdateResult.modifiedCount} rejected verification session(s) and ${userUpdateResult.modifiedCount} user(s) to pending for retry without payment.`,
    metadata: {
      sessionsResetCount: sessionUpdateResult.modifiedCount,
      usersResetCount: userUpdateResult.modifiedCount,
      affectedUserIds: userIds,
      affectedSessionIds: rejectedSessions.map((s) => s._id.toString()),
      adminEmail: adminUser.email,
    },
  });

  console.log("\n=================================================");
  console.log("✅ Reset Completed Successfully!");
  console.log(
    `Verification sessions reset: ${sessionUpdateResult.modifiedCount}`,
  );
  console.log(`Users reset to pending:     ${userUpdateResult.modifiedCount}`);
  console.log(
    `Audit log created under:    ${adminUser.name} (${adminUser.email})`,
  );
  console.log("=================================================\n");
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("reset_rejected_nin_sessions.ts")
) {
  resetRejectedSessions()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Fatal Error:", err);
      process.exit(1);
    });
}
