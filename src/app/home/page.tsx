// ...existing code...
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { addToCart, clearCart } from "@/lib/cartApi";
import { toast } from "sonner";

interface Food {
  id?: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  restaurant?: string;
}

interface Restaurant {
  id: string;
  name?: string;
  location?: string;
  imageUrl?: string;
  menu: Food[];
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroImage = PlaceHolderImages.find((p) => p.id === "hero-banner");

  // ✅ Smooth drag scroll refs
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const restaurantScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/restaurants");
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      const data = await response.json();

      // Build restaurants & foods in one go
      const allFoods = data.flatMap((r: Restaurant) =>
        r.menu ? r.menu.map((f: Food) => ({ ...f, restaurant: r.name })) : []
      );

      // Shuffle only once
      const shuffledFoods = [...allFoods].sort(() => 0.5 - Math.random()).slice(0, 9);

      // Update all at once to prevent double rendering
      setRestaurants(data);
      setFoods(shuffledFoods);
      setFilteredFoods(shuffledFoods);
    } catch (err) {
      setError("Failed to load restaurants or menu");
    } finally {
      setLoading(false);
    }
  };

  fetchRestaurants();
}, []);


  const handleRestaurantSelect = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant);
    setShowMenuModal(true);
  };

  // Changed: accept the actual food item to add
  const handleAddToCart = async (food: Food) => {
    setIsLoading(true);
    try {
      const res = await addToCart({
        id: food.id,
        name: food.name,
        price: food.price,
        imageUrl: food.imageUrl,
        restaurant: food.restaurant,
      });

      if (res.differentRestaurant) {
        toast("⚠️ Different Restaurant Detected", {
          description:
            "Your cart has items from another restaurant. Remove them and add this one?",
          action: {
            label: "Replace",
            onClick: async () => {
              await clearCart();
              await addToCart({
                id: food.id,
                name: food.name,
                price: food.price,
                imageUrl: food.imageUrl,
                restaurant: food.restaurant,
              });
              toast.success(`${food.name} added to cart`);
            },
          },
          style: {
            background: "#fff5f5",
            borderLeft: "4px solid #f87171",
          },
        });
      } else if (res.status === "success") {
        toast.success(`✅ ${food.name} added to cart`, {
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

  // ✅ Drag scroll handler
  const enableDragScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const start = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - ref.current!.offsetLeft;
      scrollLeft = ref.current!.scrollLeft;
    };

    const end = () => (isDown = false);
    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - ref.current!.offsetLeft;
      const walk = (x - startX) * 2;
      ref.current!.scrollLeft = scrollLeft - walk;
    };

    ref.current.addEventListener("mousedown", start);
    ref.current.addEventListener("mouseleave", end);
    ref.current.addEventListener("mouseup", end);
    ref.current.addEventListener("mousemove", move);

    return () => {
      ref.current?.removeEventListener("mousedown", start);
      ref.current?.removeEventListener("mouseleave", end);
      ref.current?.removeEventListener("mouseup", end);
      ref.current?.removeEventListener("mousemove", move);
    };
  };

  useEffect(() => {
    const cleanupMenu = enableDragScroll(menuScrollRef);
    const cleanupRestaurant = enableDragScroll(restaurantScrollRef);
    return () => {
      cleanupMenu?.();
      cleanupRestaurant?.();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* ✅ Hero Section */}
      <section className="w-full h-[60vh] md:h-[70vh] relative flex items-center justify-center text-center px-4 overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover brightness-50"
            priority
          />
        )}
        <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
          <h1 className="font-headline font-bold text-6xl md:text-7xl primary-gradient gradient-text">
            Taste the Future.
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 max-w-2xl">
            Explore a universe of flavors with Gourmet Galaxy, where every dish
            is a discovery.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ✅ Menu Section (drag scroll) */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-16">
        <h2 className="font-headline font-bold text-4xl mb-8 text-center">
          {selectedRestaurant ? `${selectedRestaurant.name} Menu` : "Our Menu"}
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading food items...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredFoods.length === 0 ? (
          <p className="text-center text-gray-500">
            No food items available yet.
          </p>
        ) : (
          <div
            ref={menuScrollRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide cursor-grab active:cursor-grabbing"
          >
            {filteredFoods.map((item, idx) => (
              <div
                key={`food-${item.name}-${idx}`}
                className="flex-shrink-0 w-72"
              >
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Explore Restaurants (drag scroll) */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-16">
        <h2 className="font-headline font-bold text-4xl mb-8 text-center">
          Explore Restaurants
        </h2>

        {restaurants.length === 0 ? (
          <p className="text-center text-gray-500">
            No restaurants available yet.
          </p>
        ) : (
          <div
            ref={restaurantScrollRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide cursor-grab active:cursor-grabbing"
          >
            {restaurants.map((restaurant, index) => (
              <div
                key={`restaurant-${restaurant.id}-${index}`}
                className="flex-shrink-0 w-80"
              >
                <RestaurantCard
                  name={restaurant.name || "Restaurant"}
                  location={restaurant.location}
                  imageUrl={restaurant.imageUrl}
                  onClick={() => handleRestaurantSelect(restaurant)}
                  isSelected={selectedRestaurant?.id === restaurant.id}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Floating Menu Modal */}
      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Header */}
              <div className="relative">
                <Image
                  src={
                    selectedRestaurant.imageUrl || "/restaurant-placeholder.jpg"
                  }
                  alt={selectedRestaurant.name || "Restaurant"}
                  width={1000}
                  height={400}
                  className="w-full h-60 object-cover rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-t-3xl flex items-end p-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-neutral-200">
                      {selectedRestaurant.location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md"
                >
                  ✕
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedRestaurant.menu?.length ? (
                  selectedRestaurant.menu.map((food, idx) => (
                    <div
                      key={`menu-${food.id || idx}-${idx}`}
                      className="bg-neutral-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <Image
                        src={food.imageUrl || "/food-placeholder.jpg"}
                        alt={food.name}
                        width={300}
                        height={200}
                        className="rounded-xl object-cover w-full h-40 mb-3"
                      />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {food.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {food.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-orange-600">
                          ₹{food.price}
                        </p>
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm"
                          onClick={() => handleAddToCart(food)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Adding..." : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">
                    No menu available yet.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
