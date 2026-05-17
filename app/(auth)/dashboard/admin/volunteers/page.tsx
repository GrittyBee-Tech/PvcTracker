import { db } from "@/lib/sample-db";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function VolunteersPage() {
  const volunteers = await db.getVolunteers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Volunteers</h1>
      <p>
        Here you can view, filter, and manage all the volunteers on the
        platform.
      </p>
      <DataTable columns={columns} data={volunteers} />
    </div>
  );
}
