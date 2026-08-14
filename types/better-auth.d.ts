// types/better-auth.d.ts
import type { UserType } from "@/models/users";

type CustomUserFields = Omit<
  UserType,
  "id" | "email" | "emailVerified" | "createdAt" | "updatedAt"
>;

declare module "better-auth" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface User extends CustomUserFields {}
  interface Session {
    user: User;
  }
}

declare module "better-auth/types" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface User extends CustomUserFields {}
  interface Session {
    user: User;
  }
}