// schemas/userSchema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format (ISO string expected)",
  }),
  gender: z.enum(["male", "female"], {
    message: "Gender must be male or female",
  }),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  nin: z.string({error: "You must provide your NIN"}),
});

export type CreateUserRequestData = z.infer<typeof createUserSchema>;
