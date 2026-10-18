"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Users, UserCheck, ShieldCheck, Clock } from "lucide-react";
import StatusPieChart from "@/components/dashboard/analytics/StatusPieChart";
import StateDistributionChart from "@/components/dashboard/analytics/StateDistributionChart";

export default function AdminPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch("/api/admin/analytics");
                const result = await response.json();

                if (response.ok) {
                    setData(result);
                } else {
                    throw new Error(result.message || "Failed to load analytics");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
                <h2 className="font-bold text-lg mb-2">Access Denied</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!data) return null;

    const COLORS = ["#1A5C38", "#EAB308", "#EF4444", "#3B82F6"];

    return (
        <div className="space-y-6 pb-8 text-gray-900">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Platform overview</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Key performance indicators and platform statistics.
                    </p>
                </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-4">
                        <CardTitle className="text-sm font-medium text-gray-500">Total users</CardTitle>
                        <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="text-2xl font-bold">{data.kpis.totalUsers.toLocaleString()}</div>
                        <p className="mt-1 text-xs text-gray-500">Registered voters</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-4">
                        <CardTitle className="text-sm font-medium text-gray-500">Active volunteers</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="text-2xl font-bold">{data.kpis.totalVolunteers.toLocaleString()}</div>
                        <p className="mt-1 text-xs text-gray-500">Approved and working</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-4">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending volunteers</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="text-2xl font-bold">{data.kpis.pendingVolunteers.toLocaleString()}</div>
                        <p className="mt-1 text-xs text-gray-500">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-4">
                        <CardTitle className="text-sm font-medium text-gray-500">Platform admins</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-blue-500" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="text-2xl font-bold">{data.kpis.totalAdmins.toLocaleString()}</div>
                        <p className="mt-1 text-xs text-gray-500">System administrators</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="px-5 pb-2 pt-4">
                        <CardTitle className="text-base">PVC collection status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[205px] px-3 pb-3 pt-0">
                        <StatusPieChart data={data.charts.pvcStatus} colors={COLORS} />
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="px-5 pb-2 pt-4">
                        <CardTitle className="text-base">NIN verification status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[205px] px-3 pb-3 pt-0">
                        <StatusPieChart data={data.charts.ninStatus} colors={COLORS} />
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm lg:col-span-2">
                    <CardHeader className="px-5 pb-2 pt-4">
                        <CardTitle className="text-base">Top 10 states by registration</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full px-3 pb-4 pt-1 sm:px-5">
                        <StateDistributionChart data={data.charts.stateDistribution} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
