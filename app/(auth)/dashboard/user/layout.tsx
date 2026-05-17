import UserDashboard from "@/components/dashboard/UserDashboard";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserDashboard>
            {children}
        </UserDashboard>
    );
}
