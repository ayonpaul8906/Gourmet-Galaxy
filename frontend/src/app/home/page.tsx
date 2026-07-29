"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { addToCart, clearCart } from "@/lib/cartApi";
import { toast } from "sonner";
import { Search, Flame, Star, Clock, MapPin, Sparkles, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Food {
  id: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroImage = PlaceHolderImages.find((p) => p.id === "hero-banner");

  const menuScrollRef = useRef<HTMLDivElement>(null);
  const restaurantScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`);
        if (!response.ok) throw new Error("Failed to fetch restaurants");
        const data = await response.json();

        const allFoods = data.flatMap((r: Restaurant) =>
          r.menu ? r.menu.map((f: Food) => ({ ...f, restaurant: r.name })) : []
        );

        const shuffledFoods = [...allFoods].sort(() => 0.5 - Math.random());

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

  // Filter foods by search query and category pill
  useEffect(() => {
    let result = [...foods];

    if (activeCategory !== "All") {
      result = result.filter((f) =>
        f.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        f.name?.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.restaurant?.toLowerCase().includes(q)
      );
    }

    setFilteredFoods(result);
  }, [searchQuery, activeCategory, foods]);

  const handleRestaurantSelect = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant);
    setShowMenuModal(true);
  };

  const categoryPills = ["All", "Biryani", "Pizza", "Burger", "Noodles", "Dessert", "Pure Veg"];

  return (
    <div className="flex flex-col items-center min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-20">
      {/* 🌟 Million-Dollar Hero Section */}
      <section className="w-full relative min-h-[55vh] md:min-h-[65vh] flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-25 scale-105"
            priority
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/60 pointer-events-none" />

        <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6 py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
            <span>Discover Top Chef Specials Near You</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight"
          >
            Taste the <span className="primary-gradient text-transparent bg-clip-text">Future of Food.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-xl text-neutral-300 max-w-2xl font-light"
          >
            Instant 15-min delivery from top Michelin & local favorite kitchens.
          </motion.p>

          {/* Search Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl relative mt-2"
          >
            <div className="relative flex items-center bg-white/10 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full p-2 shadow-2xl">
              <Search className="w-5 h-5 text-orange-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search dishes, biryani, pizza, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-2 text-sm md:text-base text-white placeholder-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🍕 Category Filter Pills */}
      <section className="w-full max-w-7xl px-4 md:px-8 -mt-6 z-20">
        <div className="flex overflow-x-auto gap-2.5 py-3 px-2 scrollbar-hide justify-start sm:justify-center">
          {categoryPills.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-md ${
                  isActive
                    ? "bg-orange-500 text-white shadow-orange-500/30 scale-105"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {cat === "Pure Veg" ? "🥦 Pure Veg" : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 🏆 Explore Trending Restaurants */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline font-bold text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500" />
              Explore Restaurants
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Top rated eateries serving cosmic culinary delights</p>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">No restaurants available yet.</p>
        ) : (
          <div
            ref={restaurantScrollRef}
            className="flex overflow-x-auto space-x-6 scrollbar-hide py-3 cursor-grab active:cursor-grabbing"
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

      {/* 🍲 Curated Menu Section */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline font-bold text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
              {selectedRestaurant ? `${selectedRestaurant.name} Menu` : "Curated Menu"}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Handcrafted dishes cooked fresh to order</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">No dishes match your query.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoods.map((item, idx) => (
              <FoodCard key={`food-${item.name}-${idx}`} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 🪄 Restaurant Popup Menu Modal */}
      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-5xl max-h-[88vh] overflow-y-auto shadow-2xl relative border border-neutral-200 dark:border-neutral-800"
            >
              {/* Header Image Banner */}
              <div className="relative h-64 w-full">
                <Image
                  src={selectedRestaurant.imageUrl || "/restaurant-placeholder.jpg"}
                  alt={selectedRestaurant.name || "Restaurant"}
                  fill
                  className="object-cover rounded-t-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <span className="bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Featured Restaurant
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white font-headline">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-neutral-300 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      {selectedRestaurant.location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2.5 backdrop-blur-md transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Dishes */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
                  Select Items from {selectedRestaurant.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedRestaurant.menu?.length ? (
                    selectedRestaurant.menu.map((food, idx) => (
                      <FoodCard
                        key={`menu-${food.id || idx}-${idx}`}
                        item={{
                          ...food,
                          id: food.id || `menu-${idx}`,
                          restaurant: food.restaurant || selectedRestaurant.name || "Restaurant",
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-center text-neutral-500 col-span-full py-8">
                      No menu available yet.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
