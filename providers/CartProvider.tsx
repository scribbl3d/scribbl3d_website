"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  isPrebuilt: boolean;
  color?: string;
  size?: string;
  productSizeId?: string;
  productColorId?: string;
  customization?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (
    item: Omit<CartItem, "id"> & {
      productSizeId?: string;
      productColorId?: string;
    }
  ) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateCustomization: (id: string, customization: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<number>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { data: session } = useSession();

  const fetchCart = useCallback(async () => {
    if (session) {
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          setCart(
            data.cart.map((item: any) => ({
              ...item,
              size: item.size || null,
              color: item.color || null,
              customization: item.customization || null,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    }
  }, [session]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    item: Omit<CartItem, "id"> & {
      productSizeId?: string;
      productColorId?: string;
    }
  ) => {
    try {
      console.log("Adding item to cart:", item);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        console.log("Item added to cart successfully");
        await fetchCart();
      } else {
        const errorData = await response.json();
        console.error("Failed to add item to cart:", errorData);
        throw new Error(errorData.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const response = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (response.ok) {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      console.log(
        `Sending API request to update quantity for item ${id} to ${quantity}`
      );
      const response = await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        console.log(`Successfully updated quantity for item ${id}`);
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      } else {
        console.error(
          `Failed to update quantity for item ${id}. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Failed to update item quantity:", error);
    }
  };

  const updateCustomization = async (id: string, customization: string) => {
    try {
      console.log(`Sending API request to update customization for item ${id}`);
      const response = await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customization }),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        console.log(`Successfully updated customization for item ${id}`);
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === id
              ? { ...item, customization: updatedItem.item.customization }
              : item
          )
        );
      } else {
        console.error(
          `Failed to update customization for item ${id}. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Failed to update item customization:", error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart", { method: "DELETE" });
      if (response.ok) {
        setCart([]);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const applyDiscount = async (code: string): Promise<number> => {
    try {
      const response = await fetch("/api/apply-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.discount;
      } else {
        throw new Error("Invalid discount code");
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCustomization,
        clearCart,
        fetchCart,
        applyDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
