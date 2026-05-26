import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MONGODB_URI } from "./db";
import { sendWelcomeEmail } from "@/services/emailService";
import { nextCookies } from "better-auth/next-js";

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
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendWelcomeEmail(user.email, user.name, url);
    },
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
        input: false,
      },
      nin: {
        type: "string",
        input: true,
      },
      ninVerified: {
        type: "boolean",
        input: false,
      },
      pvcStatus: {
        type: "string",
        input: false,
      },
    },
    modelName: "users",
  },
  plugins: [nextCookies()],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});
