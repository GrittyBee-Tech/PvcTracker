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

    const COLORS = ["#1A5C38", "#EAB308", "#EF4444", "#3B82F6"]; // Green, Yellow, Red, Blue

    return (
        <div className="space-y-6 text-black pb-10">
            <div>
                <h1 className="text-2xl font-bold">Platform Overview</h1>
                <p className="text-gray-600">
                    Key performance indicators and platform statistics.
                </p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-gray-100 transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-1">Registered voters</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100 transition-all duration-200 hover:shadow-md hover:border-green-500/30 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Volunteers</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.totalVolunteers.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-1">Approved & working</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100 transition-all duration-200 hover:shadow-md hover:border-yellow-500/30 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Volunteers</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.pendingVolunteers.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100 transition-all duration-200 hover:shadow-md hover:border-blue-500/30 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Platform Admins</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.totalAdmins.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-1">System administrators</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm border-gray-100 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">PVC Collection Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <StatusPieChart data={data.charts.pvcStatus} colors={COLORS} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">NIN Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <StatusPieChart data={data.charts.ninStatus} colors={COLORS} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 md:col-span-2 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 States by Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full pt-4">
                        <StateDistributionChart data={data.charts.stateDistribution} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
