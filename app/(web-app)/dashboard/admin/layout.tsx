import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DashboardLayout, {
  DashboardLink,
} from "@/components/dashboard/DashboardLayout";

const adminLinks: DashboardLink[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "Home" },
  { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout links={adminLinks} role="Admin" children={children} />
  );
}
