"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, Lock, Settings } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant?: string;
  imageUrl?: string;
}

interface UserMeta {
  totalOrders: number;
  totalSpent: number;
  usedDiscounts: string[];
  isFirstOrder: boolean;
}

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [meta, setMeta] = useState<UserMeta>({
    totalOrders: 0,
    totalSpent: 0,
    usedDiscounts: [],
    isFirstOrder: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const deliveryFee = 15.0;
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || "demo-user"
      : "demo-user";

  // ✅ fetch cart items for this user
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/cart/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setItems(data.items || []); // ✅ fixed
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const newSubtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(newSubtotal);
  }, [items]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(id);
    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/${userId}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, quantity: newQuantity }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setItems(data.cartItems || []);
        toast.success("Quantity updated");
      } else {
        toast.error(data.message || "Failed to update quantity");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/${userId}/remove/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setItems(data.cartItems || []);
        toast.success("Item removed");
      } else {
        toast.error("Failed to remove item");
      }
    } catch {
      toast.error("Error removing item");
    }
  };

  const addToCartApi = async (item: CartItem) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/add/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setItems(data.cartItems || []);
        toast.success(`${item.name} added to cart`);
      } else {
        toast.error(data.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };

  const availableDiscounts = [
    {
      code: "FIRST_ORDER",
      label: "50% off — first order",
      unlocked:
        meta.isFirstOrder && !meta.usedDiscounts.includes("FIRST_ORDER"),
      calc: (subtotal: number) => subtotal * 0.5,
    },
    {
      code: "ABOVE_149",
      label: "15% off (max ₹40) on orders above ₹149",
      unlocked: subtotal > 149 && !meta.usedDiscounts.includes("ABOVE_149"),
      calc: (subtotal: number, highest: number) =>
        Math.min(highest * 0.15, 40),
    },
    {
      code: "ABOVE_299",
      label: "25% off (max ₹100) on orders above ₹299",
      unlocked: subtotal > 299 && !meta.usedDiscounts.includes("ABOVE_299"),
      calc: (subtotal: number, highest: number) =>
        Math.min(highest * 0.25, 100),
    },
    {
      code: "LOYAL_25",
      label: "25% loyalty discount (after 5 orders)",
      unlocked:
        meta.totalOrders >= 5 && !meta.usedDiscounts.includes("LOYAL_25"),
      calc: (subtotal: number) => subtotal * 0.25,
      lockedReason: "Complete 5 orders to unlock",
    },
    {
      code: "LOYAL_40",
      label: "40% mega loyalty (after 10 orders / ₹1000 spent)",
      unlocked:
        (meta.totalOrders >= 10 || meta.totalSpent >= 1000) &&
        !meta.usedDiscounts.includes("LOYAL_40"),
      calc: (subtotal: number) => subtotal * 0.4,
      lockedReason: "Complete 10 orders or spend ₹1000 to unlock",
    },
  ];

  const sortedDiscounts = [...availableDiscounts].sort((a, b) =>
    a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1
  );

  useEffect(() => {
    if (!selectedDiscount) {
      setDiscountAmount(0);
      return;
    }
    const choice = availableDiscounts.find((d) => d.code === selectedDiscount);
    if (!choice) return setDiscountAmount(0);
    const highest = items.length
      ? Math.max(...items.map((i) => i.price * i.quantity))
      : 0;
    const amt = choice.calc(subtotal, highest);
    setDiscountAmount(Math.max(0, Math.round(amt * 100) / 100));
  }, [selectedDiscount, subtotal, items, meta]);

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSelectDiscount = (code: string, unlocked: boolean) => {
    if (!unlocked) {
      toast("This discount is locked", {
        description: "Meet the unlock criteria to use it.",
      });
      return;
    }
    const next = selectedDiscount === code ? null : code;
    setSelectedDiscount(next);
    if (!next) setDiscountAmount(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        Loading your cart...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl primary-gradient gradient-text">Your Galaxy Cart</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 hover:cursor-pointer">
            <Settings className="w-4 h-4" /> Offers & Discounts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* items */}
        <div className="lg:col-span-2 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <Card key={item.id} className="glassmorphism flex items-center p-4">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="flex-grow ml-4">
                  <h3 className="font-special text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                  <p className="text-xs text-muted-foreground">{item.restaurant}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="hover:cursor-pointer" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    {item.quantity > 1 ? <Minus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <Button size="icon" variant="ghost" className="hover:cursor-pointer" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 glassmorphism rounded-xl">
              <p className="text-muted-foreground text-lg">Your cart is empty. Let's explore!</p>
              <Link href="/explore">
                <Button className="mt-4 primary-gradient text-primary-foreground font-bold">Find Food</Button>
              </Link>
            </div>
          )}
        </div>

        {/* order summary */}
        {items.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="glassmorphism sticky top-20">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Discount</span>
                    <span className="text-sm text-muted-foreground">{selectedDiscount || "None"}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount Applied</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium">{formatPrice(deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full primary-gradient text-primary-foreground font-bold">
                    Go to Checkout
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      {/* Drawer: discounts */}
<div
  className={`fixed inset-0 z-50 ${
    drawerOpen ? "" : "pointer-events-none"
  }`}
>
  {/* Overlay */}
  <div
    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
      drawerOpen ? "opacity-100" : "opacity-0"
    }`}
    onClick={() => setDrawerOpen(false)}
  />

  {/* Slide-out Drawer */}
  <aside
    className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#111] text-white shadow-2xl transform transition-transform duration-300 ${
      drawerOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    {/* Header */}
    <div className="p-6 flex items-center justify-between border-b border-gray-800 bg-[#161616]">
      <h3 className="text-lg font-semibold text-gray-100">Available Offers</h3>
      <Button
        variant="ghost"
        className="text-gray-400 hover:text-white"
        onClick={() => setDrawerOpen(false)}
      >
        ✕
      </Button>
    </div>

    {/* Offers List */}
    <div className="p-6 space-y-3 overflow-y-auto h-full">
      {sortedDiscounts.map((d) => {
        const isUsed = meta?.usedDiscounts?.includes(d.code);
        const locked = !d.unlocked;
        const selected = selectedDiscount === d.code;

        return (
          <div
            key={d.code}
            className={`group relative p-4 rounded-2xl border transition-all duration-300
              ${
                locked
                  ? "border-gray-800 bg-[#1a1a1a] opacity-60"
                  : selected
                  ? "border-green-500 bg-gradient-to-r from-green-700/30 to-emerald-500/20"
                  : "border-gray-800 bg-[#141414] hover:border-green-600 hover:bg-[#1a1a1a]"
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div
                  className={`font-semibold text-sm sm:text-base ${
                    locked ? "text-gray-400" : "text-gray-100"
                  }`}
                >
                  {d.label}
                </div>
                {d.lockedReason && locked && (
                  <p className="text-xs text-gray-500 mt-1">
                    {d.lockedReason}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                {locked ? (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </div>
                ) : selected ? (
                  <span className="text-xs text-green-400 font-medium">
                    Selected
                  </span>
                ) : isUsed ? (
                  <span className="text-xs text-gray-500">Used</span>
                ) : null}

                <Button
                  size="sm"
                  onClick={() => handleSelectDiscount(d.code, d.unlocked)}
                  disabled={locked || isUsed}
                  className={`text-xs rounded-full px-3 py-1 transition-colors
                    ${
                      selected
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : locked
                        ? "bg-gray-800 text-gray-500"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}
                >
                  {selected ? "Applied" : locked ? "Locked" : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info Footer */}
      <div className="pt-6 text-xs text-gray-500 border-t border-gray-800">
        First-order discount is available only until you complete your first
        paid order.
      </div>
    </div>
  </aside>
</div>

    </div>
  );
}
