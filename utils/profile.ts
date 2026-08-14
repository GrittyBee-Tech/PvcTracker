import { User } from "better-auth";

export interface CompletenessResult {
  percentage: number;
  filled: number;
  total: number;
  missingFields: (keyof User)[];
}

export const profileWhitelistMapping: Partial<Record<keyof User, string>> = {
  firstName: "First Name",
  lastName: "Last Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phoneNumber: "Phone Number",
  vin: "VIN",
  nin: "NIN",
  pvcStatus: "PVC Status",
  stateOfOrigin: "State of Origin",
  lgaOfOrigin: "LGA of Origin",
  votingState: "Voting State",
  votingLga: "Voting LGA",
  homeAddress: "Home Address",
} as const;

export function getMissingFieldNames(
  missingFields: Array<keyof User> | undefined,
): string[] {
  if (!missingFields) return [];
  const names = missingFields
    .map((field) => profileWhitelistMapping[field])
    .filter((name): name is string => typeof name === "string");

  return names;
}

export function calculateProfileCompleteness(
  userObj: User | null,
): CompletenessResult {
  if (userObj === null) {
    return {
      percentage: 0,
      filled: 0,
      total: 0,
      missingFields: Object.keys(userObj || {}) as Array<keyof User>,
    };
  }
  // 2. Strongly type the whitelist using keyof User.
  // This guarantees that if you rename or remove a field in the interface,
  // TypeScript will throw a compilation error right here.
  const profileWhitelist: Array<keyof User> = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "phoneNumber",
    "vin",
    "nin",
    "pvcStatus",
    "stateOfOrigin",
    "lgaOfOrigin",
    "votingState",
    "votingLga",
    "homeAddress",
  ];

  const totalRequiredFields = profileWhitelist.length;
  const filledFields: Array<keyof User> = [];

  // 3. Evaluate the whitelisted keys
  profileWhitelist.forEach((field) => {
    const value = userObj[field];

    // Check against undefined, null, and empty/whitespace-only strings
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      filledFields.push(field);
    }
  });

  const percentage = (filledFields?.length / totalRequiredFields) * 100;
  const missingFields = profileWhitelist.filter(
    (field) => !filledFields.includes(field),
  );

  return {
    percentage: Math.round(percentage),
    filled: filledFields.length,
    total: totalRequiredFields,
    missingFields:
      missingFields.length > 0 ? getMissingFieldNames(missingFields) : [],
  };
}
