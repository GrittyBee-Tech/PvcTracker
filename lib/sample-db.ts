export type User = {
    id: string;
    firstName: string;
    lastName: string;
    state: string;
    lga: string;
    ninStatus: "Confirmed" | "Pending" | "Rejected";
    pvcStatus: "Collected" | "Not Collected" | "Pending";
    registrationDate: string;
};

export type Volunteer = {
    id: string;
    firstName: string;
    lastName: string;
    state: string;
    lga: string;
    registeredUsers: number;
    status: "Active" | "Pending" | "Rejected";
};

export const db = {
    getUsers: async (): Promise<User[]> => {
        return [
            {
                id: "1",
                firstName: "John",
                lastName: "Doe",
                state: "Lagos",
                lga: "Ikeja",
                ninStatus: "Confirmed",
                pvcStatus: "Collected",
                registrationDate: "2024-05-17",
            },
            {
                id: "2",
                firstName: "Jane",
                lastName: "Doe",
                state: "Abuja",
                lga: "Garki",
                ninStatus: "Pending",
                pvcStatus: "Not Collected",
                registrationDate: "2024-05-16",
            },
        ];
    },
    getVolunteers: async (): Promise<Volunteer[]> => {
        return [
            {
                id: "1",
                firstName: "Peter",
                lastName: "Jones",
                state: "Lagos",
                lga: "Ikeja",
                registeredUsers: 10,
                status: "Active",
            },
            {
                id: "2",
                firstName: "Mary",
                lastName: "Jane",
                state: "Abuja",
                lga: "Garki",
                registeredUsers: 5,
                status: "Pending",
            },
        ];
    },
};
