export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: "user" | "admin";
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: Date;
  items: any;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  transactionId: string | null;
  trackingInfo: any;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  zipCode: string;
  pincode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database types that match Prisma's output
export interface DbUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "user" | "admin";
  createdAt: Date;
}

export interface DbOrder {
  id: string;
  userId: string;
  createdAt: Date;
  items: any;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  transactionId: string | null;
  trackingInfo: any;
}

export interface DbAddress {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  zipCode: string;
  pincode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
