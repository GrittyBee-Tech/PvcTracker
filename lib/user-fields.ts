export const userAdditionalFields = {
  role: {
    type: "string",
    enum: ["user", "admin", "volunteer"] as const,
    required: false,
    defaultValue: "user",
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
  datePvcCollected: {
    type: "date",
    input: true,
    required: false,
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
    input: true,
    required: false,
  },
  nin: {
    type: "string",
    input: true,
    required: false,
  },
  ninEncrypted: {
    type: "string",
    required: false,
    // input must be true so the server-side before hook can set it; client-supplied
    // values are stripped in lib/auth.ts before the hook computes them.
    input: true,
  },
  ninHash: {
    type: "string",
    required: false,
    input: true,
  },
  vinEncrypted: {
    type: "string",
    required: false,
    input: true,
  },
  vinHash: {
    type: "string",
    required: false,
    input: true,
  },
  migrationStatus: {
    type: "string",
    required: false,
    input: true,
  },
  ninStatus: {
    type: "string",
    defaultValue: "pending",
  },
  pvcStatus: {
    type: "string",
    defaultValue: "not_collected",
  },
  stateOfOrigin: {
    type: "string",
    input: true,
    required: false,
  },
  lgaOfOrigin: {
    type: "string",
    input: true,
    required: false,
  },
  votingState: {
    type: "string",
    input: true,
    required: false,
  },
  votingLga: {
    type: "string",
    input: true,
    required: false,
  },
  homeAddress: {
    type: "string",
    input: true,
    required: false,
  },
  isDisabled: {
    type: "boolean",
    input: true,
    required: false,
    defaultValue: false,
  },
  status: {
    type: "string",
    defaultValue: "active",
    input: true,
  },
  createdAt: {
    type: "date",
    required: false,
  },
  updatedAt: {
    type: "date",
    required: false,
  },
} as const;
