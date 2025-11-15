"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DbAddress } from "@/app/types";
import { AddressForm } from "./AddressForm";

interface AddressManagerProps {
  initialAddresses: DbAddress[];
  hideAddButton?: boolean;
}

export function AddressManager({
  initialAddresses,
  hideAddButton,
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<DbAddress[]>(initialAddresses);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleAddAddress = async (
    newAddress: Omit<DbAddress, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const addedAddress = await response.json();
        setAddresses([...addresses, addedAddress]);
        setIsAddingAddress(false);
      } else {
        throw new Error("Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAddresses(addresses.filter((addr) => addr.id !== addressId));
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Saved Addresses
          </h2>
          <p className="text-gray-500 mt-1">Manage your delivery addresses</p>
        </div>
        {!hideAddButton && (
          <Button onClick={() => setIsAddingAddress(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {!hideAddButton && isAddingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setIsAddingAddress(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{address.fullName}</CardTitle>
                {address.isDefault && (
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    Default
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{address.street}</p>
                <p className="text-sm">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-sm">{address.country}</p>
                <p className="text-sm">Phone: {address.phone}</p>
                {address.landmark && (
                  <p className="text-sm">Landmark: {address.landmark}</p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
