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
    unique: true,
  },
  nin: {
    type: "string",
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
