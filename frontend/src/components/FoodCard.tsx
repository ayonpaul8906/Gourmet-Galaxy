"use client";

import Image from "next/image";
import { Heart, Plus, Minus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import {
  addToCart,
  clearCart,
  updateQuantity,
  removeItem,
  getCartItems,
} from "@/lib/cartApi";
import { toast } from "sonner";

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    category?: string;
    imageUrl?: string;
    restaurant?: string;
  };
  className?: string;
}

export default function FoodCard({ item, className }: FoodCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [cartDocId, setCartDocId] = useState<string | null>(null);

  // Determine if Veg or Non-Veg based on category/name
  const isVeg =
    item.category?.toLowerCase().includes("veg") ||
    item.name?.toLowerCase().includes("veg") ||
    item.category?.toLowerCase().includes("salad") ||
    item.category?.toLowerCase().includes("paneer");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCartItems();
        const existingItem = data?.items?.find(
          (i: any) => i.name === item.name && (i.restaurant === item.restaurant || !item.restaurant)
        );
        if (existingItem) {
          setQuantity(existingItem.quantity || 1);
          setCartDocId(existingItem.id);
        }
      } catch (err) {
        console.error("Failed to load cart items", err);
      }
    };
    fetchCart();
  }, [item.name, item.restaurant]);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const res = await addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        restaurant: item.restaurant,
      });

      if (res.differentRestaurant) {
        toast("⚠️ Different Restaurant Detected", {
          description:
            "Your cart has items from another restaurant. Replace cart with this item?",
          action: {
            label: "Replace",
            onClick: async () => {
              await clearCart();
              const newRes = await addToCart(item);
              setQuantity(1);
              if (newRes.cartItems?.length) {
                const newItem = newRes.cartItems.find(
                  (i: any) => i.name === item.name
                );
                setCartDocId(newItem?.id || null);
              }
              toast.success(`${item.name} added to cart`);
            },
          },
        });
      } else if (res.status === "success") {
        setQuantity(1);
        if (res.cartItems?.length) {
          const newItem = res.cartItems.find(
            (i: any) => i.name === item.name
          );
          setCartDocId(newItem?.id || null);
        }
        toast.success(`✅ ${item.name} added to cart`);
      } else {
        toast.error((res as any)?.message || "Failed to add item");
      }
    } catch {
      toast.error("❌ Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrease = async () => {
    if (!cartDocId) return handleAddToCart();
    const newQty = quantity + 1;
    setQuantity(newQty);
    try {
      await updateQuantity(cartDocId, newQty);
      toast.success("Quantity increased");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async () => {
    if (!cartDocId) return;
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      try {
        await updateQuantity(cartDocId, newQty);
        toast.success("Quantity decreased");
      } catch {
        toast.error("Failed to update quantity");
      }
    } else {
      setQuantity(0);
      try {
        await removeItem(cartDocId);
        setCartDocId(null);
        toast(`${item.name} removed from cart`);
      } catch {
        toast.error("Failed to remove item");
      }
    }
  };

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  return (
    <div
      className={cn(
        "glassmorphism rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 flex flex-col justify-between",
        className
      )}
    >
      <div className="relative h-44 w-full overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs">
            Delicious Food
          </div>
        )}

        {/* Gradient Overlay for Image readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Veg / Non-Veg Indicator Tag */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-white/20">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full border flex-shrink-0",
              isVeg
                ? "bg-emerald-500 border-emerald-600"
                : "bg-red-500 border-red-600"
            )}
          />
          <span className="text-[10px] font-bold tracking-wide uppercase text-neutral-800 dark:text-neutral-200">
            {item.category || (isVeg ? "Veg" : "Special")}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>4.8</span>
        </div>

        {/* Like Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 rounded-full bg-black/40 hover:bg-black/60 text-white w-8 h-8 backdrop-blur-md transition-transform active:scale-125"
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
        </Button>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-orange-500 transition-colors">
            {item.name}
          </h3>
          {item.restaurant && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
              By {item.restaurant}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
          <span className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100">
            {formatPrice(item.price)}
          </span>

          {/* Swiggy Style Quantity / Add Button */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-xl px-2 py-1 shadow-md shadow-orange-500/20">
              <button
                type="button"
                onClick={handleDecrease}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-600 rounded-lg text-white font-bold transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-600 rounded-lg text-white font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              onClick={handleAddToCart}
            >
              {isLoading ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  ADD
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
