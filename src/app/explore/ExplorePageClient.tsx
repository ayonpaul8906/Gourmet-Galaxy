"use client";

import React, { useRef, useState } from "react";
import FoodCard from "@/components/FoodCard";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Food {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  restaurant: string;
}

interface ExplorePageClientProps {
  allFoods: Food[];
}

export default function ExplorePageClient({ allFoods }: ExplorePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ✅ Filters
  const under60 = allFoods.filter((f) => f.price <= 60);
  const under200 = allFoods.filter((f) => f.price > 60 && f.price <= 200);
  const premium = allFoods.filter((f) => f.price > 200);

  const categories = [
    { name: "Biryani", image: "/biryani.png" },
    { name: "Rice", image: "/rice.png" },
    { name: "Paratha", image: "/paratha.png" },
    { name: "Burger", image: "/burger.png" },
    { name: "Pizza", image: "/pizza.png" },
    { name: "Noodles", image: "/noodles.png" },
  ];

  const topSearches = ["Biryani", "Burger", "Pizza", "Fried Rice"];
  const topSearchFoods = allFoods.filter((f) =>
    topSearches.some((search) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  const filteredCategoryFoods =
    selectedCategory &&
    allFoods.filter(
      (f) =>
        f.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        f.name.toLowerCase().includes(selectedCategory.toLowerCase())
    );

  // ✅ Smooth mouse drag scroll
  const ScrollContainer = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: React.MouseEvent) => {
      if (!ref.current) return;
      isDown = true;
      ref.current.classList.add("cursor-grabbing");
      startX = e.pageX - ref.current.offsetLeft;
      scrollLeft = ref.current.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      ref.current?.classList.remove("cursor-grabbing");
    };

    const onMouseUp = () => {
      isDown = false;
      ref.current?.classList.remove("cursor-grabbing");
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!isDown || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed
      ref.current.scrollLeft = scrollLeft - walk;
    };

    return (
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab select-none py-2 px-1"
      >
        {children}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* 🌟 Budget Bites Section */}
      <section>
        <h2 className="font-headline font-bold text-4xl mb-8 text-center">
          Budget Bites
        </h2>

        <div className="space-y-12">
          {[
            { title: "Under ₹60", items: under60 },
            { title: "Under ₹200", items: under200 },
            { title: "Premium Dishes (₹200+)", items: premium },
          ].map((group, idx) => (
            <div key={idx}>
              <h3 className="text-2xl font-semibold mb-4">{group.title}</h3>
              <ScrollContainer>
                {group.items.map((item) => (
                  <div key={item.id} className="min-w-[250px]">
                    <FoodCard item={item} />
                  </div>
                ))}
              </ScrollContainer>
            </div>
          ))}
        </div>
      </section>

      {/* 🍴 What's Your Preference */}
      <section>
        <h2 className="font-headline font-bold text-4xl mb-8 text-center">
          What’s Your Preference?
        </h2>
        <ScrollContainer>
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="relative h-48 w-60 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition cursor-pointer"
              onClick={() => setSelectedCategory(cat.name)}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover brightness-75"
              />
              <div className="absolute bottom-0 w-full bg-black/50 py-2 text-center text-white font-semibold text-lg">
                {cat.name}
              </div>
            </div>
          ))}
        </ScrollContainer>
      </section>

      {/* 🔎 Top Searches */}
      <section>
        <h2 className="font-headline font-bold text-4xl mb-8 text-center">
          Top Searches
        </h2>
        <ScrollContainer>
          {topSearchFoods.map((food) => (
            <div key={food.id} className="min-w-[250px]">
              <FoodCard item={food} />
            </div>
          ))}
        </ScrollContainer>
      </section>

      {/* 🪄 Modal for Category */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-lg bg-white/90 rounded-3xl p-6 w-full max-w-5xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl"
              >
                ✕
              </button>

              <h3 className="text-3xl font-bold mb-6 text-center text-orange-600 ">
                {selectedCategory} Specials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategoryFoods?.map((food) => (
                  <div
                    key={food.id}
                    className="bg-white/70 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={food.imageUrl || "/food-placeholder.jpg"}
                        alt={food.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-lg text-black">{food.name}</h4>
                      <p className="text-sm text-gray-500">
                        From {food.restaurant}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-orange-600">
                          ₹{food.price}
                        </span>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1.5 rounded-lg">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
