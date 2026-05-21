// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Simple validation schema for the login endpoint
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt", // Mandatory for credentials provider
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          throw new Error("Invalid input formats.");
        }
        const { email, password } = parsedCredentials.data;

        await connectDB();

        // Find user by email and explicitly select password if omitted by default in schema
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user?.emailVerified) {
          throw new Error("Invalid email or password");
        }
        if (!user.password) {
          throw new Error("User has not finished setup");
        }

        // Validate password (assuming password hashing during user registration)
        const isPasswordMatch = await bcrypt.compare(password, user?.password);

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password");
        }

        // Return a clean object that fits NextAuth's User type
        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.lastName} ${user.firstName}`,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Inject custom database values (like Role or Mongoose ID) into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // Make those custom database values accessible on the frontend via useSession() or auth()
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirects to your custom login page if unauthenticated
  },
});
