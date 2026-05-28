import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
  pollingInterval: 60,
});

export const { signUp, signIn, signOut, useSession } = authClient;
