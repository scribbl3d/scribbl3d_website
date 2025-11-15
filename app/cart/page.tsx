import ShoppingCart from "./shopping-cart";

export default function CartPage() {
  return (
    // Remove fixed padding-top to be more flexible for mobile headers
    <div className="container mx-auto px-4 py-4 pt-[100px]">
      <ShoppingCart />
    </div>
  );
}
