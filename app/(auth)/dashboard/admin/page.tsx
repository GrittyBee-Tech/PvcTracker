import { db } from "@/lib/sample-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
    const users = await db.getUsers();
    const volunteers = await db.getVolunteers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Overview</h1>
                <p className="text-muted-foreground">
                    Welcome to the admin dashboard. Here is a summary of the platform.
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{volunteers.length}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
