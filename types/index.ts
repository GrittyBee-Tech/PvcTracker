export const PERMISSIONS = [
  "view:users",
  "manage:users",
  "view:volunteers",
  "manage:volunteers",
  "view:admins",
  "manage:admins",
  "manage:centres",
  "view:audit_logs",
  "view:analytics",
] as const;

export type Permission = typeof PERMISSIONS[number];

export interface UserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: string;
  phoneNumber: string;
  emailVerified: boolean;
  role: "user" | "admin" | "volunteer";
  nin: string;
  vin?: string;
  ninStatus: "pending" | "rejected" | "verified";
  pvcStatus: "collected" | "not_collected";
  stateOfOrigin?: string;
  lgaOfOrigin?: string;
  homeAddress?: string;
  status: "active" | "restricted" | "deleted";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
