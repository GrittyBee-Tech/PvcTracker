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
  "view:verification_sessions",
  "manage:verification_sessions",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type VerificationResolutionAction = "sync" | "approve" | "reset";

export interface VerificationSessionUser {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nin?: string;
  ninStatus?: string;
  stateOfOrigin?: string;
  lgaOfOrigin?: string;
}

export interface VerificationSessionTransaction {
  _id?: string;
  reference?: string;
  provider?: string;
  amount?: number;
  status?: string;
  purpose?: string;
}

export interface VerificationMismatch {
  field: string;
  dbValue: string;
  ninValue: string;
}

export interface VerificationSessionRecord {
  _id: string;
  user_id: string;
  transaction_id: string;
  status: "pending" | "verified" | "rejected";
  status_reason?: string;
  mismatches?: VerificationMismatch[];
  provider_response?: Record<string, unknown>;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: VerificationSessionUser | null;
  transaction?: VerificationSessionTransaction | null;
}

export interface UserType {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  emailVerified: boolean;
  role: "user" | "admin" | "volunteer";
  nin: string;
  vin?: string;
  ninStatus: "pending" | "rejected" | "verified";
  pvcStatus: "collected" | "not_collected";
  datePvcCollected: Date;
  stateOfOrigin?: string;
  votingState?: string;
  votingLga?: string;
  lgaOfOrigin?: string;
  homeAddress?: string;
  isDisabled?: boolean;
  status: "active" | "restricted" | "deleted";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
