// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [], // Keep this empty here; we will inject providers in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
     pages: {
     signIn: "/auth/login", // Redirects to your custom login page if unauthenticated
   },
} satisfies NextAuthConfig;
