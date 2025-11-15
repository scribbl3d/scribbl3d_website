export interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  landmark: string | null;
  userId: string;
  pincode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AddressInput = Omit<
  Address,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
