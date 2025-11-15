"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormResponseViewer } from "../_components/FormResponseViewer";
import { format } from "date-fns";

interface Form3DResponse {
  id: string;
  service: string;
  requirement: string;
  fileReference: string;
  fileExtension: string;
  prototype: string;
  prototypeOption: string;
  printingTechnology: string;
  material: string;
  materialType: string;
  materialDescription: string;
  quantity: string;
  productColor: string;
  filamentColor: string;
  resinColor: string;
  additionalFile: string;
  createdAt: string;
}

type Column = {
  key: keyof Form3DResponse;
  label: string;
  render?: (value: any) => React.ReactNode;
};

export default function Form3DResponsesPage() {
  const [responses, setResponses] = useState<Form3DResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/admin/form3d-responses");
      if (res.ok) {
        const data = await res.json();
        setResponses(data);
      } else {
        setError("Failed to fetch Form3D responses");
      }
    } catch {
      setError("Error fetching Form3D responses");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { key: "service", label: "Service" },
    { key: "prototype", label: "Prototype" },
    { key: "printingTechnology", label: "Technology" },
    { key: "material", label: "Material" },
    {
      key: "createdAt",
      label: "Submitted",
      render: (value: string) => format(new Date(value), "PPp"),
    },
  ];

  const detailsColumns: Column[] = [
    { key: "service", label: "Service" },
    { key: "requirement", label: "Requirements" },
    { key: "fileReference", label: "Reference File" },
    { key: "fileExtension", label: "File Extension" },
    { key: "prototype", label: "Prototype" },
    { key: "prototypeOption", label: "Prototype Option" },
    { key: "printingTechnology", label: "Printing Technology" },
    { key: "material", label: "Material" },
    { key: "materialType", label: "Material Type" },
    { key: "materialDescription", label: "Material Description" },
    { key: "quantity", label: "Quantity" },
    { key: "productColor", label: "Product Color" },
    { key: "filamentColor", label: "Filament Color" },
    { key: "resinColor", label: "Resin Color" },
    { key: "additionalFile", label: "Additional File" },
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
          <h1 className="text-2xl font-bold">3D Printing Service Requests</h1>
        </div>
      </div>

      <FormResponseViewer
        title="3D Printing Service Requests"
        responses={responses}
        columns={columns}
        detailsColumns={detailsColumns}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
}
