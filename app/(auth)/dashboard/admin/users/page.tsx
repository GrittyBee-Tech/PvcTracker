import { db } from "@/lib/sample-db";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function UsersPage() {
  const users = await db.getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <p>
        Here you can view, filter, and manage all the users on the platform.
      </p>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
