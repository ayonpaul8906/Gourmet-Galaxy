"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* 🍔 Background image */}
      <div className="absolute inset-0">
        <Image
          src="/landing-food-bg.jpg"
          alt="Food background"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* 🍟 Navbar */}
      <nav className="z-10 flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          Gourmet Galaxy<span className="text-orange-400">.</span>
        </h1>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button variant="outline" className="bg-white/20 text-white hover:bg-orange-500 hover:cursor-pointer">
              Login
            </Button> 
          </Link>
          <Link href="/auth">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:cursor-pointer">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* 🍕 Hero Section */}
      <main className="z-10 flex flex-col items-center justify-center flex-1 text-center text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
        >
          Savor the Taste of <br />
          <span className="text-orange-400">Happiness 🍔</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl text-lg md:text-xl mb-8 text-gray-200"
        >
          Order delicious meals from your favorite restaurants with a single tap.
          Fresh. Fast. Flavorful.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Link href="/auth">
            <Button className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg">
              Explore Menu 🍕
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
