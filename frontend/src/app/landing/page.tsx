"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Flame, Star, Zap, ShieldCheck, ArrowRight, Heart, UtensilsCrossed, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-neutral-950 text-white overflow-hidden font-sans">
      {/* 🍔 Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* 🍟 Navbar */}
      <nav className="z-20 flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <span className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight primary-gradient text-transparent bg-clip-text">
            Gourmet Galaxy
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/auth">
            <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold">
              Log In
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:scale-105 transition-all text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* 🍕 Hero Section */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto space-y-12">
        {/* Floating Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-xs md:text-sm font-semibold backdrop-blur-md shadow-lg"
        >
          <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
          <span>⚡ 15-Minute Express Galactic Delivery</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-headline tracking-tight leading-none"
        >
          Taste the Future of <br />
          <span className="primary-gradient text-transparent bg-clip-text">
            Gourmet Dining 🍔
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl text-lg md:text-2xl text-neutral-300 leading-relaxed font-light"
        >
          Order handcrafted meals from top Michelin-starred kitchens and favorite local hot spots with instant live tracking.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/home" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg px-9 py-6 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-105 transition-all gap-3">
              Explore Restaurants <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/explore" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/10 text-white font-bold text-lg px-8 py-6 rounded-2xl backdrop-blur-md">
              View Special Offers
            </Button>
          </Link>
        </motion.div>

        {/* 🌟 Live Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full pt-12"
        >
          {[
            { label: "Happy Foodies", value: "50,000+", icon: Heart, color: "text-red-400" },
            { label: "Partner Restaurants", value: "150+", icon: UtensilsCrossed, color: "text-amber-400" },
            { label: "Average Delivery", value: "18 Mins", icon: Clock, color: "text-orange-400" },
            { label: "User Rating", value: "4.9 ★", icon: Star, color: "text-yellow-400" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-orange-500/40 transition-all text-center space-y-1.5 group"
              >
                <Icon className={`w-6 h-6 mx-auto ${stat.color} group-hover:scale-110 transition-transform`} />
                <p className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
