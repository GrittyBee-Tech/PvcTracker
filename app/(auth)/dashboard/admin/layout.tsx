import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminDashboard>
            {children}
        </AdminDashboard>
    );
}
