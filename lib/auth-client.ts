import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || window.location.origin,
  plugins: [inferAdditionalFields<typeof auth>()],

});

export const { signUp, signIn, signOut, useSession } = authClient;
