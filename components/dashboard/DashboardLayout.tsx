"use client";

import { usePathname } from "next/navigation";
import Logo from "../ui/Logo";
import { UserCircle, Bell, Search, Navigation } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import LogoutButton from "../ui/LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import { TbNavigationDown } from "react-icons/tb";

export type DashboardLink = {
  href: string;
  label: string;
  icon: string;
};

export default function DashboardLayout({
  children,
  role,
  links,
}: {
  children: React.ReactNode;
  role: "User" | "Volunteer" | "Admin";
  links: DashboardLink[];
}) {
  const { user } = useAuth();
  const displayName = user?.firstName || "User";

  return (
    <div className="flex h-screen bg-white text-white font-sans">
      <DashboardSideBar links={links} role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-green-900/30 bg-primary/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center text-primary">
            {/* Future Breadcrumbs or Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white border border-green-900/50 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary text-primary placeholder:text-primary w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-green-100/70 hover:text-white transition-colors rounded-full hover:bg-green-900/20">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-green-900/50 mx-2"></div>
            <button className="flex items-center gap-2 p-1.5 pr-3 text-white hover:text-white transition-colors rounded-full hover:bg-green-900/20 border border-transparent hover:border-green-900/30">
              <UserCircle className="w-7 h-7 text-white" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm  text-white font-dm-sans font-medium leading-none">
                  {displayName}
                </span>
                <span className="text-[10px] text-white font-bold mt-1">
                  {role}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-linear-to-b from-accent/40 to-background">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

const DashboardSideBar = ({
  links,
  role,
}: {
  role: "User" | "Volunteer" | "Admin";
  links: DashboardLink[];
}) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#F9FDFA] border-r border-green-900/30 hidden md:flex flex-col">
      <div className="h-16 flex items-center">
        <div className="sm:mx-auto w-fit pr-6" style={{ color: "white" }}>
          <Logo />
        </div>
      </div>
      <div className="flex-1 p-4 mt-4 pb-0 h-full flex flex-col">
        <div className="flex items-center gap-2 text-lg border-b border-primary font-bold text-primary uppercase tracking-wider mb-4 px-4">
          <TbNavigationDown className="w-4 h-4 text-primary" />
          Menu
        </div>
        <nav className="flex flex-col gap-2 mt-4 h-full">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = Icons[
              link.icon as keyof typeof Icons
            ] as Icons.LucideIcon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-primary hover:bg-primary/90 hover:text-white ${
                  isActive
                    ? "font-medium border border-green-500/20 shadow-sm bg-primary text-white"
                    : "text-green-100/70 hover:text-green-100"
                }`}
              >
                {IconComponent && (
                  <IconComponent
                    className={`w-5 h-5 group-hover:text-white ${isActive ? "text-white" : "text-primary"}`}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
          <div className="mt-auto w-full">
            <LogoutButton />
            <div className="mt-4 p-4 border-t border-primary text-xs text-primary flex items-center justify-between">
              <span>{role} Portal</span>
              <span>v1.0</span>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};
