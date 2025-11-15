"use client";

import { useCart } from "@/providers/CartProvider";
import { Minus, Plus, Pencil, X, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import type { CartItem } from "@/types/cart";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export default function ShoppingCart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    applyDiscount,
    updateCustomization,
  } = useCart();
  const [localCart, setLocalCart] = useState<CartItem[]>(cart);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [shippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [customizationItem, setCustomizationItem] = useState<CartItem | null>(
    null
  );
  const [customizationText, setCustomizationText] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  const subtotal = localCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedShipping = shippingOptions.find(
    (option) => option.id === selectedShippingId
  );
  const total =
    subtotal - subtotal * appliedDiscount + (selectedShipping?.price || 0);

  const handleUpdateQuantity = useCallback(
    async (id: string, newQuantity: number) => {
      if (newQuantity > 0) {
        setLocalCart((prevCart) =>
          prevCart.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
        await updateQuantity(id, newQuantity);
      }
    },
    [updateQuantity]
  );

  const handleRemoveFromCart = useCallback(
    async (id: string) => {
      setLocalCart((prevCart) => prevCart.filter((item) => item.id !== id));
      await removeFromCart(id);
    },
    [removeFromCart]
  );

  const handleApplyDiscount = async () => {
    try {
      const discount = await applyDiscount(discountCode);
      setAppliedDiscount(discount);
      toast({
        title: "Discount Applied",
        description: `${
          discount * 100
        }% discount has been applied to your order.`,
      });
    } catch {
      toast({
        title: "Invalid Discount Code",
        description: "The discount code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const handleCustomize = (item: CartItem) => {
    setCustomizationItem(item);
    setCustomizationText(item.customization || "");
  };

  const handleSaveCustomization = async () => {
    if (customizationItem) {
      try {
        await updateCustomization(customizationItem.id, customizationText);
        setLocalCart((prevCart) =>
          prevCart.map((item) =>
            item.id === customizationItem.id
              ? { ...item, customization: customizationText }
              : item
          )
        );
        setCustomizationItem(null);
        toast({
          title: "Customization Saved",
          description: "Your customization request has been saved.",
        });
      } catch (error) {
        console.error("Failed to save customization:", error);
        toast({
          title: "Error",
          description: "Failed to save customization. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveCustomization = async (itemId: string) => {
    try {
      await updateCustomization(itemId, "");
      setLocalCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, customization: "" } : item
        )
      );
      toast({
        title: "Customization Removed",
        description: "The customization has been removed from your item.",
      });
    } catch (error) {
      console.error("Failed to remove customization:", error);
      toast({
        title: "Error",
        description: "Failed to remove customization. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (localCart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md text-center p-8">
          <CardContent>
            <p className="text-gray-500 mb-6">Your cart is empty</p>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Shopping Cart</h1>
        <span className="text-sm text-muted-foreground">
          {localCart.length} {localCart.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="divide-y p-0">
              {localCart.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-3 md:gap-4">
                    <div className="relative w-24 h-24 md:w-20 md:h-20 flex-shrink-0">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                        unoptimized={true} // Key prop
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium leading-tight">
                          {item.name}
                        </h3>
                        <p className="font-medium whitespace-nowrap">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        {item.size && `Size: ${item.size}`}
                        {item.color && `, Color: ${item.color}`}
                      </div>

                      {item.customization && (
                        <div className="flex items-center text-sm text-blue-600">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="truncate max-w-[200px]">
                                {item.customization}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.customization}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-red-500 hover:text-red-600 p-0 h-auto"
                            onClick={() => handleRemoveCustomization(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 md:w-10 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 md:h-10"
                                onClick={() => handleCustomize(item)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                {item.customization ? "Customize" : "Customize"}
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              side="bottom"
                              className="h-[90vh] sm:h-auto"
                            >
                              <SheetHeader>
                                <SheetTitle>Customize Your Item</SheetTitle>
                                <SheetDescription>
                                  Please note that customized items may have
                                  delayed shipping and are non-returnable.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-6">
                                <Label htmlFor="customization">
                                  Customization Details
                                </Label>
                                <Textarea
                                  id="customization"
                                  value={customizationText}
                                  onChange={(e) =>
                                    setCustomizationText(e.target.value)
                                  }
                                  className="mt-2"
                                  placeholder="Enter your customization details here..."
                                />
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => setCustomizationItem(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="w-full sm:w-auto"
                                  onClick={handleSaveCustomization}
                                >
                                  Save changes
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 h-8 md:h-10"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Subtotal</span>
                  <span className="text-right">₹{subtotal.toFixed(2)}</span>
                  {appliedDiscount > 0 && (
                    <>
                      <span className="text-green-600">Discount</span>
                      <span className="text-right text-green-600">
                        -₹{(subtotal * appliedDiscount).toFixed(2)}
                      </span>
                    </>
                  )}
                  {selectedShipping && (
                    <>
                      <span>Shipping</span>
                      <span className="text-right">
                        ₹{selectedShipping.price.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 text-base font-medium">
                  <span>Total</span>
                  <span className="text-right">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Discount Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      className="flex-shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {shippingOptions.length > 0 && (
                  <RadioGroup
                    value={selectedShippingId}
                    onValueChange={setSelectedShippingId}
                    className="space-y-3"
                  >
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-muted"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label
                          htmlFor={option.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center gap-4">
                            <div>
                              <div className="font-medium">{option.name}</div>
                              <div className="text-sm text-gray-500">
                                {option.description}
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              {option.price === 0 ? (
                                <span className="text-green-600 font-medium">
                                  Free
                                </span>
                              ) : (
                                <span>₹{option.price}</span>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              <Button className="w-full h-12 text-lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
