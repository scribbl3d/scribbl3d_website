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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PersonaliseFormResponse {
  id: string;
  isAware: string;
  categories: string[];
  statueDetails: string;
  wantMore: string;
  createdAt: string;
}

export default function PersonaliseResponsesPage() {
  const [responses, setResponses] = useState<PersonaliseFormResponse[]>([]);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch("/api/personalise-form");
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      } else {
        console.error("Failed to fetch personalise form responses");
      }
    } catch (error) {
      console.error("Error fetching personalise form responses:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" className="p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personalise Form Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aware of Personalized Products</TableHead>
                <TableHead>Interested Categories</TableHead>
                <TableHead>Statue Details</TableHead>
                <TableHead>Want More Products</TableHead>
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{response.isAware}</TableCell>
                  <TableCell>{response.categories.join(", ")}</TableCell>
                  <TableCell>{response.statueDetails}</TableCell>
                  <TableCell>{response.wantMore}</TableCell>
                  <TableCell>
                    {new Date(response.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
