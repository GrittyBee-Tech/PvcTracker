"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Upload, FileText, X,  } from "lucide-react";
import Swal from "sweetalert2";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BatchUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please upload a CSV or Excel file.",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/volunteers/batch-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: `${data.count} volunteers have been added successfully.`,
        });
        onSuccess();
        onClose();
        setFile(null);
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Upload Volunteers"
      size="md"
    >
      <div className="space-y-6 text-black">
        <div className="text-sm text-gray-600">
          <p>
            Upload a CSV or Excel file containing volunteer details. The file
            must have the following columns: <strong>Name, Email, VIN</strong>.
          </p>
          <a
            href="/samples/volunteers_sample.csv"
            download
            className="text-primary hover:underline flex items-center gap-1 mt-2"
          >
            <FileText className="w-4 h-4" />
            Download Sample CSV
          </a>
        </div>

        {!file ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">CSV, XLSX up to 5MB</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {uploading ? "Uploading..." : "Upload Volunteers"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
