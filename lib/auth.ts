import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MONGODB_URI } from "./db";
import { sendWelcomeEmail } from "@/services/emailService";

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
      nin: {
        type: "string",
        input: true,
      },
    },
    modelName: "users",
  },
});
