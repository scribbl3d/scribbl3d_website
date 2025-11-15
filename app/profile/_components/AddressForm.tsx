"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DbAddress } from "@/app/types";

interface AddressFormProps {
  onSubmit: (
    address: Omit<DbAddress, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel: () => void;
  initialData?: Omit<DbAddress, "id" | "userId" | "createdAt" | "updatedAt">;
}

export function AddressForm({
  onSubmit,
  onCancel,
  initialData,
}: AddressFormProps) {
  const [formData, setFormData] = useState<
    Omit<DbAddress, "id" | "userId" | "createdAt" | "updatedAt">
  >({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    landmark: initialData?.landmark || null,
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    pincode: initialData?.pincode || null,
    country: initialData?.country || "",
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          value={formData.landmark || ""}
          onChange={(e) =>
            setFormData({ ...formData, landmark: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code (Optional)</Label>
          <Input
            id="pincode"
            value={formData.pincode || ""}
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  );
}
