import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";

interface FormResponseViewerProps<T> {
  title: string;
  responses: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any) => React.ReactNode;
  }[];
  detailsColumns: {
    key: keyof T;
    label: string;
    render?: (value: any) => React.ReactNode;
  }[];
  isLoading?: boolean;
  error?: string;
  onExport?: () => void;
}

export function FormResponseViewer<
  T extends { id: string; createdAt: string },
>({
  title,
  responses,
  columns,
  detailsColumns,
  isLoading,
  error,
  onExport,
}: FormResponseViewerProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<T | null>(null);
  const [sortField, setSortField] = useState<keyof T>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredResponses = responses.filter((response) => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(response).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * direction;
    }
    return 0;
  });

  const handleSort = (field: keyof T) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const exportToCSV = () => {
    if (onExport) {
      onExport();
      return;
    }

    const headers = detailsColumns.map((col) => col.label);
    const csvContent = [
      headers.join(","),
      ...responses.map((response) =>
        detailsColumns
          .map((col) => {
            const value = response[col.key];
            return typeof value === "string" ? `"${value}"` : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${title.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={String(sortField)}
            onValueChange={(value) => handleSort(value as keyof T)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={String(column.key)} value={String(column.key)}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className="cursor-pointer"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortField === column.key && (
                        <Filter
                          className={`h-4 w-4 ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResponses.map((response) => (
                <TableRow key={response.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(response[column.key])
                        : String(response[column.key])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedResponse(response)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <Dialog
          open={!!selectedResponse}
          onOpenChange={() => setSelectedResponse(null)}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {selectedResponse &&
                detailsColumns.map((column) => (
                  <div key={String(column.key)} className="grid gap-2">
                    <h4 className="font-medium">{column.label}</h4>
                    <div className="text-muted-foreground">
                      {column.render
                        ? column.render(selectedResponse[column.key])
                        : String(selectedResponse[column.key])}
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
