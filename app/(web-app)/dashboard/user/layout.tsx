import DashboardLayout from "@/components/dashboard/DashboardLayout";

const links = [
  { href: "/dashboard/user", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/user/profile", label: "Profile", icon: "User" },
  { href: "/dashboard/user/find-centre", label: "Find Centre", icon: "MapPin" },

  {
    href: "/dashboard/user/report-issues",
    label: "Report Issue",
    icon: "AlertTriangle",
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout links={links} role="User" children={children} />;
}
