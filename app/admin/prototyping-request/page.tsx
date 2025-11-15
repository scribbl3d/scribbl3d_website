"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormResponseViewer } from "../_components/FormResponseViewer";
import { format } from "date-fns";

interface PrototypingRequest {
  id: string;
  projectType: string;
  technology: string;
  material: string;
  materialSubtype: string;
  color: string;
  filamentColor: string;
  resinColor: string;
  customMaterial: string;
  designFile: string;
  specialRequirements: string;
  bulkQuantity: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  createdAt: string;
}

type Column = {
  key: keyof PrototypingRequest;
  label: string;
  render?: (value: any, item?: PrototypingRequest) => React.ReactNode;
};

export default function PrototypingRequestsPage() {
  const [requests, setRequests] = useState<PrototypingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/prototyping-request");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError("Failed to fetch prototyping requests");
      }
    } catch {
      setError("Error fetching prototyping requests");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { key: "projectType", label: "Project Type" },
    { key: "technology", label: "Technology" },
    { key: "material", label: "Material" },
    {
      key: "firstName",
      label: "Name",
      render: (value: string, item?: PrototypingRequest) =>
        item ? `${value} ${item.lastName}` : value,
    },
    { key: "email", label: "Email" },
    {
      key: "createdAt",
      label: "Submitted",
      render: (value: string) => format(new Date(value), "PPp"),
    },
  ];

  const detailsColumns: Column[] = [
    { key: "projectType", label: "Project Type" },
    { key: "technology", label: "Technology" },
    { key: "material", label: "Material" },
    { key: "materialSubtype", label: "Material Subtype" },
    { key: "color", label: "Color" },
    { key: "filamentColor", label: "Filament Color" },
    { key: "resinColor", label: "Resin Color" },
    { key: "customMaterial", label: "Custom Material" },
    { key: "designFile", label: "Design File" },
    { key: "specialRequirements", label: "Special Requirements" },
    { key: "bulkQuantity", label: "Bulk Quantity" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    {
      key: "createdAt",
      label: "Submitted At",
      render: (value: string) => format(new Date(value), "PPpp"),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" className="p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Prototyping Requests</h1>
        </div>
      </div>

      <FormResponseViewer
        title="Prototyping Requests"
        responses={requests}
        columns={columns}
        detailsColumns={detailsColumns}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
}
