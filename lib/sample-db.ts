import { UserType } from "@/models/users";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date;
  gender?: string;
  phoneNumber?: string;
  nin?: string;
  ninStatus: "verified" | "Confirmed" | "Pending" | "Rejected";
  pvcStatus: "collected" | "Not Collected" | "Pending";
  vin?: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  homeAddress?: string;
};

export type Volunteer = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender?: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  registeredUsers: number;
  nin?: string;
  ninStatus: "verified" | "pending" | "rejected";
  pvcStatus: "collected" | "not_ollected";
  applicationDate: string;
  status: "active" | "pending" | "rejected";
};

export const db = {
  getUsers: async (): Promise<UserType[]> => {
    return [
      {
        firstName: "John",
        lastName: "Doe",
        stateOfOrigin: "Lagos",
        lgaOfOrigin: "Ikeja",
        ninStatus: "verified",
        pvcStatus: "collected",
        phoneNumber: "2348012345678",
        gender: "male",
        email: "john.doe@gmail.com",
        role: "user",
        dateOfBirth: new Date("2024-05-17"),
        emailVerified: true,
        nin: "20187347977",
        homeAddress: "12 omofaye street, melinda estate, Lagos",
      },
      {
        firstName: "Jane",
        lastName: "Doe",
        stateOfOrigin: "Abuja",
        lgaOfOrigin: "Garki",
        ninStatus: "pending",
        pvcStatus: "not_collected",
        phoneNumber: "2348087654321",
        gender: "female",
        dateOfBirth: new Date("2024-05-16"),
        email: "jane.doe@gmail.com",
        role: "user",
        emailVerified: true,
        nin: "20187347977",
        homeAddress: "12 omofaye street, melinda estate, Lagos",
      },
      {
        firstName: "Chioma",
        lastName: "Adebayo",
        stateOfOrigin: "Anambra",
        lgaOfOrigin: "Anaocha",
        ninStatus: "verified",
        pvcStatus: "collected",
        phoneNumber: "2348034567890",
        gender: "female",
        vin: "90F1A2B3C4D5E6F7G8H",
        homeAddress: "14 Adeniran Ogunsanya Street, Surulere, Lagos",
        dateOfBirth: new Date("2024-05-18"),
        emailVerified: true,
        nin: "20183327977",
        email: "Chioma.Adebayo@gmail.com",
        role: "user",
      },
    ];
  },
  getVolunteers: async (): Promise<Volunteer[]> => {
    return [
      {
        id: "1",
        firstName: "Peter",
        lastName: "Jones",
        phoneNumber: "2348011112222",
        gender: "male",
        stateOfOrigin: "Lagos",
        lgaOfOrigin: "Ikeja",
        ninStatus: "verified",
        pvcStatus: "collected",
        registeredUsers: 10,
        status: "active",
        applicationDate: "2024-05-15",
      },
      {
        id: "2",
        firstName: "Mary",
        lastName: "Jane",
        phoneNumber: "2348033334444",
        gender: "female",
        stateOfOrigin: "Abuja",
        lgaOfOrigin: "Garki",
        ninStatus: "verified",
        pvcStatus: "collected",
        registeredUsers: 5,
        status: "pending",
        applicationDate: "2024-05-16",
      },
      {
        id: "3",
        firstName: "Ahmed",
        lastName: "Musa",
        phoneNumber: "2348055556666",
        gender: "male",
        stateOfOrigin: "Kano",
        lgaOfOrigin: "Kano Municipal",
        ninStatus: "verified",
        pvcStatus: "collected",
        registeredUsers: 0,
        status: "rejected",
        applicationDate: "2024-05-18",
      },
    ];
  },
};
