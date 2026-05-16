import UserModel from "@/models/user";

type CreateUserRequestData = {
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
};

export async function createUser(userData: CreateUserRequestData) {
  console.log("Creating user...", userData);
  const user = await UserModel.create(userData);
  return user;
}
