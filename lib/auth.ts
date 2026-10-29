// auth.ts
import { betterAuth, User } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectDB, { MONGODB_URI } from "./db";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/services/emailService";
import { nextCookies } from "better-auth/next-js";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { userAdditionalFields } from "./user-fields";
import { findUserByNIN, findUserByVIN } from "@/models/users";
import { customSession } from "better-auth/plugins";
import {
  decryptAES256GCM,
  encryptAES256GCM,
  generateBlindIndex,
  normalizeIdentifier,
} from "./crypto";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const client = new MongoClient(MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }: { user: User; url: string }) => {
      const name = `${user?.firstName} ${user?.lastName}` || "User";

      void sendPasswordResetEmail(user?.email, name, url);
    },
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
  },
  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: User;
      url: string;
    }) => {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set("callbackURL", "/dashboard/user");

      const name = `${user.firstName} ${user.lastName}`;
      void sendWelcomeEmail(user.email, name, parsedUrl.toString());
    },
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: userAdditionalFields,
    modelName: "users",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: User) => {
          return {
            data: {
              ...user,
              createdAt: new Date(),
            },
          };
        },
      },
      update: {
        before: async (user: User) => {
          return {
            data: {
              ...user,
              updatedAt: new Date(),
            },
          };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email" || ctx.path === "/update-user") {
        // The Better Auth route is not wrapped in withDb, so Mongoose must be
        // connected explicitly before findUserByNIN / findUserByVIN run.
        await connectDB();

        // Derived fields are server-controlled: never trust client-supplied values.
        const rawBody = ctx.body as Record<string, any> | undefined;
        if (rawBody) {
          for (const key of [
            "ninEncrypted",
            "ninHash",
            "vinEncrypted",
            "vinHash",
            "migrationStatus",
          ]) {
            delete rawBody[key];
          }
        }
      }

      // 1. Intercept user signup to normalize, hash, and encrypt NIN
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as Record<string, any> | undefined;
        const nin = body?.nin;
        if (nin && typeof nin === "string" && nin.trim() !== "") {
          const normalizedNin = normalizeIdentifier(nin);
          const ninHash = generateBlindIndex(normalizedNin);

          // Enforce uniqueness via blind index or legacy field
          const existingUser = await findUserByNIN(normalizedNin);
          if (existingUser) {
            throw new APIError("CONFLICT", {
              message: "A user with this NIN is already registered",
            });
          }

          body.ninEncrypted = encryptAES256GCM(normalizedNin);
          body.ninHash = ninHash;
          delete body.nin;
          body.migrationStatus = "completed";
        }
      }

      // 2. Intercept user profile updates
      if (ctx.path === "/update-user") {
        const session = await getSessionFromCtx(ctx);
        if (!session?.user) return;

        const body = ctx.body as Record<string, any> | undefined;
        const doesBodyHaveVIN = Object.keys(body || {}).includes("vin");
        if (doesBodyHaveVIN) {
          if (session?.user?.vin || session?.user?.vinEncrypted) {
            throw new APIError("NOT_ACCEPTABLE", {
              message: "Your VIN cannot be updated",
            });
          }

          const rawVin = body?.vin;
          if (rawVin && typeof rawVin === "string" && rawVin.trim() !== "") {
            const normalizedVin = normalizeIdentifier(rawVin);
            const vinHash = generateBlindIndex(normalizedVin);

            // Enforce uniqueness on VIN
            const existingUser = await findUserByVIN(normalizedVin);
            const currentUserId =
              session.user.id || (session.user as any)._id?.toString();
            if (
              existingUser &&
              existingUser._id?.toString() !== currentUserId
            ) {
              throw new APIError("CONFLICT", {
                message: "A user with this VIN is already registered",
              });
            }

            body.vinEncrypted = encryptAES256GCM(normalizedVin);
            body.vinHash = vinHash;
            // Never persist plaintext: Better Auth writes whatever is left in the body.
            delete body.vin;
          }
        }

        const doesBodyHaveNIN = Object.keys(body || {}).includes("nin");
        if (
          doesBodyHaveNIN &&
          body?.nin &&
          typeof body.nin === "string" &&
          body.nin.trim() !== ""
        ) {
          const normalizedNin = normalizeIdentifier(body.nin);
          const ninHash = generateBlindIndex(normalizedNin);

          const existingUser = await findUserByNIN(normalizedNin);
          const currentUserId =
            session.user.id || (session.user as any)._id?.toString();
          if (existingUser && existingUser._id?.toString() !== currentUserId) {
            throw new APIError("CONFLICT", {
              message: "A user with this NIN is already registered",
            });
          }

          body.ninEncrypted = encryptAES256GCM(normalizedNin);
          body.ninHash = ninHash;
          delete body.nin;
          body.migrationStatus = "completed";
        }

        if (!doesBodyHaveVIN) {
          // Allow update profile from verify-nin page if 24 hours have not passed since last update
          const isFromVerifyNinPage = ctx
            .getHeader("referer")
            ?.includes("/dashboard/user/verify-nin");
          const lastUpdatedTime = new Date(
            session.user.updatedAt || session.user.createdAt,
          ).getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (
            Date.now() - lastUpdatedTime < twentyFourHours &&
            !isFromVerifyNinPage
          ) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message: "Profile can only be updated once every 24 hours.",
            });
          }
        }
      }
    }),
  },
  plugins: [
    nextCookies(),
    // Runs on every get-session: decrypt the signed-in user's own NIN/VIN so the
    // existing UI keeps reading user.nin / user.vin without plaintext in the DB.
    customSession(async ({ user, session }) => {
      const u = user as Record<string, any>;
      let nin: string | undefined = u.nin;
      let vin: string | undefined = u.vin;
      try {
        if (u.ninEncrypted) nin = decryptAES256GCM(u.ninEncrypted);
        if (u.vinEncrypted) vin = decryptAES256GCM(u.vinEncrypted);
      } catch (error) {
        console.error("Failed to decrypt session identifiers", error);
      }
      // Keep ciphertext/hash fields out of the response; expose a boolean instead.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ninEncrypted, ninHash, vinEncrypted, vinHash, ...rest } = u;
      return {
        user: {
          ...(rest as typeof user),
          nin,
          vin,
          hasVin: Boolean(vin),
        },
        session,
      };
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
