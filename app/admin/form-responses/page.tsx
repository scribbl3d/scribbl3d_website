"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormResponse {
  id: string;
  service: string;
  requirement: string;
  createdAt: string;
  // Add other fields as needed
}

export default function FormResponsesPage() {
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    fetchFormResponses();
  }, []);

  const fetchFormResponses = async () => {
    const response = await fetch("/api/form-responses");
    if (response.ok) {
      const data = await response.json();
      setFormResponses(data);
    } else {
      console.error("Failed to fetch form responses");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form Responses</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Requirement</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formResponses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>{response.service}</TableCell>
              <TableCell>{response.requirement}</TableCell>
              <TableCell>
                {new Date(response.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
