"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormResponseViewer } from "../_components/FormResponseViewer";
import { format } from "date-fns";

interface SmallBatchRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  productName: string;
  quantity: string;
  technology: string;
  material: string;
  materialSubtype: string;
  color: string;
  filamentColor: string;
  resinColor: string;
  customMaterial: string;
  designFile: string;
  specialRequirements: string;
  createdAt: string;
}

type Column = {
  key: keyof SmallBatchRequest;
  label: string;
  render?: (value: any, item?: SmallBatchRequest) => React.ReactNode;
};

export default function SmallBatchManufacturingPage() {
  const [requests, setRequests] = useState<SmallBatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/small-batch-manufacturing");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError("Failed to fetch small batch manufacturing requests");
      }
    } catch {
      setError("Error fetching small batch manufacturing requests");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { key: "productName", label: "Product Name" },
    { key: "quantity", label: "Quantity" },
    { key: "technology", label: "Technology" },
    { key: "material", label: "Material" },
    {
      key: "firstName",
      label: "Name",
      render: (value: string, item?: SmallBatchRequest) =>
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
    { key: "productName", label: "Product Name" },
    { key: "quantity", label: "Quantity" },
    { key: "technology", label: "Technology" },
    { key: "material", label: "Material" },
    { key: "materialSubtype", label: "Material Subtype" },
    { key: "color", label: "Color" },
    { key: "filamentColor", label: "Filament Color" },
    { key: "resinColor", label: "Resin Color" },
    { key: "customMaterial", label: "Custom Material" },
    { key: "designFile", label: "Design File" },
    { key: "specialRequirements", label: "Special Requirements" },
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
          <h1 className="text-2xl font-bold">
            Small Batch Manufacturing Requests
          </h1>
        </div>
      </div>

      <FormResponseViewer
        title="Small Batch Manufacturing Requests"
        responses={requests}
        columns={columns}
        detailsColumns={detailsColumns}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
}
