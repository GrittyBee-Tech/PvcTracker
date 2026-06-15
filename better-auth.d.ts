// better-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { auth } from "@/lib/auth";
import { IUser } from "./models/users";

declare module "better-auth" {
  interface User {
    // ✅ This makes your code editor recognize custom properties on the user object
    role: IUser["role"];
    firstName: IUser["firstName"];
    lastName: IUser["lastName"];
    phoneNumber: IUser["phoneNumber"];
    dateOfBirth: IUser["dateOfBirth"];
    gender: IUser["gender"];
    emailVerified: boolean;
    nin: string;
    vin: string;
    ninStatus: IUser["ninStatus"];
    pvcStatus: IUser["pvcStatus"];
    stateOfOrigin: IUser["stateOfOrigin"];
    lgaOfOrigin: IUser["lgaOfOrigin"];
    homeAddress: IUser["homeAddress"];
    // pvcStatusUpdatedAt: IUser["pvcStatusUpdatedAt"];
  }
}
