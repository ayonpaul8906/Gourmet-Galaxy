"use client";

import Image from "next/image";
import { Heart, Plus, Minus } from "lucide-react";
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

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // ✅ Fetch existing cart item if already added
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      try {
        const data = await getCartItems();
        const existingItem = data?.items?.find(
          (i: any) => i.name === item.name && i.restaurant === item.restaurant
        );
        if (existingItem) {
          setQuantity(existingItem.quantity || 1);
          setCartDocId(existingItem.id); // store Firestore document id
        }
      } catch (err) {
        console.error("Failed to load cart items", err);
      }
    };
    fetchCart();
  }, [item.name, item.restaurant, userId]);

  // ✅ Add to cart
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
            "Your cart has items from another restaurant. Remove them and add this one?",
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
        toast.error(res.message || "Failed to add item");
      }
    } catch {
      toast.error("❌ Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Increase quantity
  const handleIncrease = async () => {
    if (!cartDocId) return handleAddToCart(); // if no doc id, add first
    const newQty = quantity + 1;
    setQuantity(newQty);
    try {
      await updateQuantity(cartDocId, newQty);
      toast.success("Quantity increased");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  // ✅ Decrease quantity or remove
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
    e.currentTarget.classList.add("animate-heart-bounce");
    setTimeout(() => {
      e.currentTarget?.classList.remove("animate-heart-bounce");
    }, 500);
  };

  return (
    <div
      className={cn(
        "glassmorphism rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
        className
      )}
    >
      <div className="relative h-48">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
            No Image
          </div>
        )}

        <Button
          size="icon"
          className="absolute top-3 right-3 rounded-full bg-black/30 hover:bg-black/50"
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "w-5 h-5 text-white",
              isLiked && "fill-red-500 text-red-500"
            )}
          />
        </Button>

        {item.category && (
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <span>{item.category}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-special text-xl font-medium truncate">
          {item.name}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-lg">{formatPrice(item.price)}</span>

          {/* ✅ Zomato-style quantity buttons */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-orange-100 rounded-full px-2 py-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDecrease}
                className="text-orange-600 hover:bg-orange-200 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold text-orange-700 min-w-[20px] text-center">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleIncrease}
                className="text-orange-600 hover:bg-orange-200 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={isLoading}
              className="primary-gradient text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/50 hover:scale-105 hover:cursor-pointer transition-all"
              onClick={handleAddToCart}
            >
              {isLoading ? "Adding..." : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
