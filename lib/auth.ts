import { betterAuth } from "better-auth";
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

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const client = new MongoClient(MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  //...
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, user.name, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendWelcomeEmail(user.email, user.name, url);
    },
    sendOnSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
      },
      firstName: {
        type: "string",
        input: true,
      },
      lastName: {
        type: "string",
        input: true,
      },
      dateOfBirth: {
        type: "date",
        input: true,
      },
      gender: {
        type: "string",
        input: true,
      },
      phoneNumber: {
        type: "string",
        input: true,
      },
      vin: {
        type: "string",
        input: true,
        required: false,
        unique: true,
      },
      nin: {
        type: "string",
        input: true,
      },
      ninStatus: {
        type: "string",
        defaultValue: "pending",
      },
      pvcStatus: {
        type: "string",
        defaultValue: "not_collected",
      },
      stateOfOrigin: {
        type: "string",
        input: true,
        required: false,
      },
      lgaOfOrigin: {
        type: "string",
        input: true,
        required: false,
      },
      homeAddress: {
        type: "string",
        input: true,
        required: false,
      },
      createdAt: {
        type: "date",
        required: false,
      },
      updatedAt: {
        type: "date",
        required: false,
      },
    },
    modelName: "users",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              createdAt: new Date(),
            },
          };
        },
      },
      update: {
        before: async (user) => {
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
      if (ctx.path === "/update-user") {
        const session = await getSessionFromCtx(ctx);
        if (!session?.user) return;

        const doesBodyHaveVIN = Object.keys(ctx?.body).includes("vin");
        if (doesBodyHaveVIN) {
          if (session?.user?.vin) {
            throw new APIError("NOT_ACCEPTABLE", {
              message: "Your VIN cannot be updated",
            });
          }
        } else {
          const lastUpdatedTime = new Date(
            session.user.updatedAt || session.user.createdAt,
          ).getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (Date.now() - lastUpdatedTime < twentyFourHours) {
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
