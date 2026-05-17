"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, HeartHandshake } from "lucide-react";

export default function SideNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/volunteers", label: "Volunteers", icon: HeartHandshake },
    ];

    return (
        <nav className="flex flex-col gap-2 mt-4">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                                ? "bg-green-600/20 text-green-400 font-medium border border-green-500/20 shadow-sm"
                                : "text-green-100/70 hover:bg-green-900/40 hover:text-green-100"
                        }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? "text-green-400" : "text-green-100/50"}`} />
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
