"use client";

import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import React from "react";
import { addToCart, clearCart } from "@/lib/cartApi";
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
  const [isLiked, setIsLiked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
              await addToCart(item);
              toast.success(`${item.name} added to cart`);
            },
          },
          style: {
            background: "#fff5f5",
            borderLeft: "4px solid #f87171",
          },
        });
      } else if (res.status === "success") {
        toast.success(`✅ ${item.name} added to cart`, {
          style: {
            background: "#ecfdf5",
            borderLeft: "4px solid #34d399",
          },
        });
      } else {
        toast.error(res.message || "Failed to add item", {
          style: {
            background: "#fff5f5",
            borderLeft: "4px solid #f87171",
          },
        });
      }
    } catch (err) {
      toast.error("❌ Something went wrong", {
        style: {
          background: "#fff5f5",
          borderLeft: "4px solid #f87171",
        },
      });
    } finally {
      setIsLoading(false);
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
        </div>
      </div>
    </div>
  );
}
