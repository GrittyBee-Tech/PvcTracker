"use client";

import { db } from "@/lib/sample-db";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { UserType } from "@/models/users";

const DUMMY_DATA = [
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a5c" },
    name: "Chioma Blessing Adebayo",
    email: "chioma.adebayo@gmail.com",
    emailVerified: true,
    createdAt: { $date: "2026-05-28T09:15:22.000Z" },
    updatedAt: { $date: "2026-06-20T14:22:10.000Z" },
    role: "user",
    firstName: "Chioma",
    lastName: "Adebayo",
    dateOfBirth: { $date: "1995-11-12T00:00:00.000Z" },
    gender: "female",
    phoneNumber: "2348034567890",
    nin: "48291039481",
    ninStatus: "verified",
    pvcStatus: "collected",
    vin: "90F1A2B3C4D5E6F7G8H",
    lgaOfOrigin: "Anaocha",
    stateOfOrigin: "Anambra",
    homeAddress: "14 Adeniran Ogunsanya Street, Surulere, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a5d" },
    name: "Tunde Bakare Musa",
    email: "tundemusa99@yahoo.com",
    emailVerified: false,
    createdAt: { $date: "2026-05-30T16:45:11.000Z" },
    updatedAt: { $date: "2026-05-30T16:45:11.000Z" },
    role: "user",
    firstName: "Tunde",
    lastName: "Musa",
    dateOfBirth: { $date: "1999-07-24T00:00:00.000Z" },
    gender: "male",
    phoneNumber: "2348123456789",
    nin: "10293847561",
    ninStatus: "pending",
    pvcStatus: "not_collected",
    vin: "",
    lgaOfOrigin: "Ilorin West",
    stateOfOrigin: "Kwara",
    homeAddress: "42 Ikeja Way, Alausa, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a5e" },
    name: "Funmi Deborah Olaniyan",
    email: "funmi.olaniyan@outlook.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-01T10:00:00.000Z" },
    updatedAt: { $date: "2026-06-24T11:12:33.000Z" },
    role: "user",
    firstName: "Funmi",
    lastName: "Olaniyan",
    dateOfBirth: { $date: "1988-03-15T00:00:00.000Z" },
    gender: "female",
    phoneNumber: "2349051234567",
    nin: "57382910492",
    ninStatus: "verified",
    pvcStatus: "collected",
    vin: "12A34B56C78D90E1F2G",
    lgaOfOrigin: "Ife Central",
    stateOfOrigin: "Osun",
    homeAddress: "Block C, Room 4, LUTH Quarters, Idi-Araba, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a5f" },
    name: "Emeka Stanley Okafor",
    email: "emeka.okafor@gmail.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-02T08:30:15.000Z" },
    updatedAt: { $date: "2026-06-02T08:45:22.000Z" },
    role: "user",
    firstName: "Emeka",
    lastName: "Okafor",
    dateOfBirth: { $date: "2002-09-09T00:00:00.000Z" },
    gender: "male",
    phoneNumber: "2347039876543",
    nin: "91827364501",
    ninStatus: "verified",
    pvcStatus: "not_collected",
    vin: "7834BC92D1182736452",
    lgaOfOrigin: "Nnewi North",
    stateOfOrigin: "Anambra",
    homeAddress: "8 Akilo Road, Ogba, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a60" },
    name: "Amina Yusuf Ibrahim",
    email: "amina.yusuf@yahoo.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-05T12:11:00.000Z" },
    updatedAt: { $date: "2026-06-18T09:20:14.000Z" },
    role: "user",
    firstName: "Amina",
    lastName: "Yusuf",
    dateOfBirth: { $date: "1993-01-30T00:00:00.000Z" },
    gender: "female",
    phoneNumber: "2348098765432",
    nin: "30491827364",
    ninStatus: "verified",
    pvcStatus: "not_collected",
    vin: "",
    lgaOfOrigin: "Chanchaga",
    stateOfOrigin: "Niger",
    homeAddress: "115 Herbert Macaulay Way, Yaba, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a61" },
    name: "Abiodun Samuel Jegede",
    email: "abiodunjegede@gmail.com",
    emailVerified: false,
    createdAt: { $date: "2026-06-10T15:22:41.000Z" },
    updatedAt: { $date: "2026-06-10T15:22:41.000Z" },
    role: "user",
    firstName: "Abiodun",
    lastName: "Jegede",
    dateOfBirth: { $date: "2001-06-18T00:00:00.000Z" },
    gender: "male",
    phoneNumber: "2348145566778",
    nin: "",
    ninStatus: "unverified",
    pvcStatus: "not_collected",
    vin: "",
    lgaOfOrigin: "Ekiti Southwest",
    stateOfOrigin: "Ekiti",
    homeAddress: "5 Olorunlogbon Street, Anthony Village, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a62" },
    name: "Nkechi Rita Asuquo",
    email: "nkechi.asuquo@hotmail.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-12T07:14:03.000Z" },
    updatedAt: { $date: "2026-06-25T14:00:00.000Z" },
    role: "user",
    firstName: "Nkechi",
    lastName: "Asuquo",
    dateOfBirth: { $date: "1997-05-05T00:00:00.000Z" },
    gender: "female",
    phoneNumber: "2349022334455",
    nin: "11223344556",
    ninStatus: "verified",
    pvcStatus: "collected",
    vin: "4567AB89C0123456789",
    lgaOfOrigin: "Calabar Municipal",
    stateOfOrigin: "Cross River",
    homeAddress: "72 Joel Ogunnaike Street, GRA Ikeja, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a63" },
    name: "Tariq Mohammed Aliyu",
    email: "tariq.aliyu@gmail.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-15T11:45:19.000Z" },
    updatedAt: { $date: "2026-06-16T10:30:22.000Z" },
    role: "user",
    firstName: "Tariq",
    lastName: "Aliyu",
    dateOfBirth: { $date: "1991-12-25T00:00:00.000Z" },
    gender: "male",
    phoneNumber: "2348055667788",
    nin: "88776655443",
    ninStatus: "verified",
    pvcStatus: "not_collected",
    vin: "2389DF45A1273849102",
    lgaOfOrigin: "Wamako",
    stateOfOrigin: "Sokoto",
    homeAddress: "Alagbado Close, off Command Road, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a64" },
    name: "Yetunde Grace Balogun",
    email: "yettygrace@gmail.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-18T14:02:11.000Z" },
    updatedAt: { $date: "2026-06-18T14:05:00.000Z" },
    role: "user",
    firstName: "Yetunde",
    lastName: "Balogun",
    dateOfBirth: { $date: "1994-08-08T00:00:00.000Z" },
    gender: "female",
    phoneNumber: "2347061122334",
    nin: "99887766554",
    ninStatus: "failed",
    pvcStatus: "not_collected",
    vin: "",
    lgaOfOrigin: "Egba Alake",
    stateOfOrigin: "Ogun",
    homeAddress: "19 Rowland Street, Ojodu Berger, Lagos",
  },
  {
    _id: { $oid: "6a16d5eb9469e0f5f8590a65" },
    name: "Chinedu Christopher Nwosu",
    email: "chinedunwosu@yahoo.com",
    emailVerified: true,
    createdAt: { $date: "2026-06-20T17:50:00.000Z" },
    updatedAt: { $date: "2026-06-22T12:15:45.000Z" },
    role: "user",
    firstName: "Chinedu",
    lastName: "Nwosu",
    dateOfBirth: { $date: "1986-10-20T00:00:00.000Z" },
    gender: "male",
    phoneNumber: "2348189900112",
    nin: "55443322110",
    ninStatus: "verified",
    pvcStatus: "collected",
    vin: "8912CD34E5678901234",
    lgaOfOrigin: "Owerri Municipal",
    stateOfOrigin: "Imo",
    homeAddress: "34 Ikorodu Road, Ketu, Lagos",
  },
];

export default function UsersPage() {
  // const users = async () => await db.getUsers();

  const [users, setUsers] = useState<UserType[]>([]);
  // const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await db.getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);


  async function uploadDummyUserData() {
    DUMMY_DATA.map(
      async ({ name, dateOfBirth, email, phoneNumber, nin, gender }) => {
        const [firstName, middleName, lastName] = name.split(" ");
        await authClient.signUp.email({
          name,
          role: "user",
          dateOfBirth: new Date(dateOfBirth.$date),
          firstName,
          lastName,
          email,
          phoneNumber,
          password: `${firstName}-${nin.slice(0, 4)}`,
          gender,
          nin,
        });
      },
    );
  }

  useEffect(() => {}, []);

  return (
    <div className="text-black space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-gray-600">
          Here you can view, filter, and manage all the users on the platform.
        </p>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
