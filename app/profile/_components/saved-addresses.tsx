import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export function SavedAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA",
      isDefault: true,
    },
  ]);

  const [newAddress, setNewAddress] = useState<
    Omit<Address, "id" | "isDefault">
  >({ street: "", city: "", state: "", zipCode: "", country: "" });

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      { ...newAddress, id: addresses.length + 1, isDefault: false },
    ]);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Saved Addresses</h3>
      {addresses.map((address) => (
        <div key={address.id} className="border p-4 rounded">
          <p>{address.street}</p>
          <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
          <p>{address.country}</p>
          {address.isDefault && (
            <span className="text-sm text-green-600">Default</span>
          )}
        </div>
      ))}
      <h4 className="text-md font-semibold mt-6">Add New Address</h4>
      <div className="space-y-2">
        <Label htmlFor="street">Street</Label>
        <Input
          id="street"
          value={newAddress.street}
          onChange={(e) =>
            setNewAddress({ ...newAddress, street: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress({ ...newAddress, city: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={newAddress.state}
            onChange={(e) =>
              setNewAddress({ ...newAddress, state: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            value={newAddress.zipCode}
            onChange={(e) =>
              setNewAddress({ ...newAddress, zipCode: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={newAddress.country}
            onChange={(e) =>
              setNewAddress({ ...newAddress, country: e.target.value })
            }
          />
        </div>
      </div>
      <Button onClick={handleAddAddress}>Add Address</Button>
    </div>
  );
}
