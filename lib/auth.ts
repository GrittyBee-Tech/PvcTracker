// auth.ts
import { betterAuth, User } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MONGODB_URI } from "./db";
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
import UserModel from "@/models/users";
import {
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
      // 1. Intercept user signup to normalize, hash, and encrypt NIN
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as Record<string, any> | undefined;
        const nin = body?.nin;
        if (nin && typeof nin === "string" && nin.trim() !== "") {
          const normalizedNin = normalizeIdentifier(nin);
          const ninHash = generateBlindIndex(normalizedNin);

          // Enforce uniqueness via blind index or legacy field
          const existingUser = await UserModel.findByNIN(normalizedNin);
          if (existingUser) {
            throw new APIError("CONFLICT", {
              message: "A user with this NIN is already registered",
            });
          }

          body.ninEncrypted = encryptAES256GCM(normalizedNin);
          body.ninHash = ninHash;
          body.nin = normalizedNin;
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
          if (session?.user?.vin) {
            throw new APIError("NOT_ACCEPTABLE", {
              message: "Your VIN cannot be updated",
            });
          }

          const rawVin = body?.vin;
          if (rawVin && typeof rawVin === "string" && rawVin.trim() !== "") {
            const normalizedVin = normalizeIdentifier(rawVin);
            const vinHash = generateBlindIndex(normalizedVin);

            // Enforce uniqueness on VIN
            const existingUser = await UserModel.findByVIN(normalizedVin);
            const currentUserId = session.user.id || (session.user as any)._id?.toString();
            if (existingUser && existingUser._id?.toString() !== currentUserId) {
              throw new APIError("CONFLICT", {
                message: "A user with this VIN is already registered",
              });
            }

            body.vinEncrypted = encryptAES256GCM(normalizedVin);
            body.vinHash = vinHash;
            body.vin = normalizedVin;
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

          const existingUser = await UserModel.findByNIN(normalizedNin);
          const currentUserId =
            session.user.id || (session.user as any)._id?.toString();
          if (existingUser && existingUser._id?.toString() !== currentUserId) {
            throw new APIError("CONFLICT", {
              message: "A user with this NIN is already registered",
            });
          }

          body.ninEncrypted = encryptAES256GCM(normalizedNin);
          body.ninHash = ninHash;
          body.nin = normalizedNin;
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
  plugins: [nextCookies()],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
