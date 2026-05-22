# Zustand + NextAuth Session Sync

This file explains the changes made to the app to unify client-side state with NextAuth authentication and provide persisted user storage.

## What was added

### 1. `store.ts`

- Replaced the old Zustand store with a persisted store using `zustand/middleware`.
- Added `user` state as `User | null`.
- Added `setUser()` and `clearUser()` actions.
- Added `isHydrated` flag to track whether persisted state has rehydrated.
- Persisted the store under the key `pv-waka-user` using `createJSONStorage(() => localStorage)`.
- Added `useSyncSession()` hook to synchronize NextAuth session data into the Zustand store.
- Added `useAuthContext()` helper for consuming auth state from either Zustand or NextAuth.

### 2. `components/SessionProvider.tsx`

- Added `AppSessionProvider` as a wrapper around `SessionProvider` from `next-auth/react`.
- Added `SessionSyncProvider` that calls `useSyncSession()` to keep the store in sync with the current session.

### 3. `app/layout.tsx`

- Wrapped the app with `AppSessionProvider` so NextAuth session context and sync are available app-wide.

### 4. `components/dashboard/DashboardLayout.tsx`

- Updated dashboard layout to use `useStore()` and `useSession()` instead of a direct `auth()` call.
- Display now prefers persisted Zustand user data and falls back to the NextAuth session.

## How it works

### Login flow

1. User logs in using NextAuth credentials.
2. NextAuth validates credentials, creates a JWT session, and stores session data in an HTTP-only cookie.
3. `useSyncSession()` reads the NextAuth session and writes the user data into Zustand.
4. Zustand persists the user object to `localStorage`.

### Page refresh flow

1. App rehydrates Zustand from `localStorage`.
2. NextAuth session remains valid from the HTTP-only cookie.
3. `useSyncSession()` keeps the two sources consistent.

### Logout flow

1. User clicks `LogoutButton`, which runs `signOut()`.
2. NextAuth clears the session cookie.
3. `useSyncSession()` sees no session and clears Zustand state.

## How to use it

### Accessing auth data

Use the Zustand store directly in client components:

```tsx
"use client";
import { useStore } from "@/store";

export default function Profile() {
  const { user } = useStore();

  return <div>{user ? `Hello, ${user.firstName}` : "Not logged in"}</div>;
}
```

### Accessing auth session

Use NextAuth directly when you need session metadata:

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div>{session?.user ? `Hello, ${session.user.name}` : "Not logged in"}</div>
  );
}
```

### Using the combined auth helper

The store exports `useAuthContext()` for a unified auth state source. It prefers persisted Zustand data and falls back to NextAuth session data.

```tsx
"use client";
import { useAuthContext } from "@/store";

export default function Profile() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;

  return <div>{user ? `Hello, ${user.firstName}` : "Not logged in"}</div>;
}
```

## Notes

- The user object stored in Zustand should be kept in sync with the data provided by NextAuth.
- Sensitive token/session state remains secure in NextAuth HTTP-only cookies.
- Client-side state is used for faster UI access and persistence across browser refresh.

## File references

- `store.ts`
- `components/SessionProvider.tsx`
- `app/layout.tsx`
- `components/dashboard/DashboardLayout.tsx`
