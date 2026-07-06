"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddAdminModal from "./AddAdminModal";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/admins");
      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="text-black space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Admins</h1>
          <p className="text-gray-600">
            View and manage platform administrators.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      <DataTable columns={columns} data={admins} loading={loading} />

      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAdmins}
      />
    </div>
  );
}
