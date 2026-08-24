"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import LogoutButton from "../ui/LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TbNavigationDown } from "react-icons/tb";
import { IoFootstepsSharp } from "react-icons/io5";

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
  const [navOpen, setNavOpen] = useState(false);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && navOpen) {
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navOpen]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[15rem_1fr] h-screen text-white font-sans bg-background overflow-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Off-Canvas Drawer) */}
      <DashboardSideBar
        links={links}
        role={role}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-green-900/30 bg-primary/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          {/* Left: Mobile Menu Toggle & Mobile Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer md:hidden p-2 rounded-lg text-white hover:bg-green-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => setNavOpen((prev) => !prev)}
              aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {navOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-bold text-lg text-white tracking-wide">PVC WAKA</span>
              <IoFootstepsSharp className="text-emerald-300 text-xl" />
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <button
              className="relative p-2 text-green-100 hover:text-white transition-colors rounded-full hover:bg-green-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            </button>
            <div className="h-8 w-px bg-green-900/50" />
            <div className="flex items-center gap-2.5 p-1 text-white rounded-full">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 text-emerald-900 border-2 border-emerald-300 flex items-center justify-center text-sm font-bold tracking-wider select-none shadow-xs">
                {user?.firstName?.[0]?.toUpperCase() || "U"}
                {user?.lastName?.[0]?.toUpperCase() || "N"}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm text-white font-dm-sans font-medium leading-none">
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-200 font-bold mt-0.5 uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-linear-to-b from-accent/40 to-background relative">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

const DashboardSideBar = ({
  links,
  role,
  navOpen,
  setNavOpen,
}: {
  role: "User" | "Volunteer" | "Admin";
  links: DashboardLink[];
  navOpen: boolean;
  setNavOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-slate-50 border-r border-green-900/30 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        md:static md:z-auto md:translate-x-0 md:shadow-none
        ${navOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 bg-slate-100/50">
        <div className="flex items-center gap-2 text-primary font-bold">
          <h1 className="text-xl font-bold tracking-tight">PVC WAKA</h1>
          <IoFootstepsSharp className="text-2xl text-primary" />
        </div>
        <button
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          </div>
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const IconComponent = Icons[
                link.icon as keyof typeof Icons
              ] as Icons.LucideIcon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-primary"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent
                      className={`size-5 transition-colors ${
                        isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
                      }`}
                    />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="pt-4 mt-auto border-t border-slate-200">
          <div onClick={() => setNavOpen(false)}>
            <LogoutButton navOpen={true} />
          </div>
          <div className="mt-4 px-2 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>{role} Portal</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
