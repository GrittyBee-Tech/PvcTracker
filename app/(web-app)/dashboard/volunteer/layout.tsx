import DashboardLayout from "@/components/dashboard/DashboardLayout";

const links = [
  { href: "/dashboard/volunteer", label: "Dashboard", icon: "LayoutDashboard" },
];

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout links={links} role="Volunteer" children={children} />;
}
