import { LucideIcon } from "lucide-react";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  isPrebuilt: boolean;
  color?: string;
  size?: string;
  sizeType?: string;
  productSizeId?: string;
  productColorId?: string;
  customization?: string;
};

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: LucideIcon;
}

export interface Cart {
  items: CartItem[];
}
