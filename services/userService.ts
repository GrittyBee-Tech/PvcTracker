import UserModel from "@/models/user";

type CreateUserRequestData = {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
};

export async function createUser(userData: CreateUserRequestData) {
  console.log("Creating user...", userData);
  const user = await UserModel.create(userData);
  return user;
}
