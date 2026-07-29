"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, ChevronRight, X, Clock, Flame, Minimize2 } from "lucide-react";
import { getUserId } from "@/lib/cartApi";

export default function FloatingOrderWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // Hide widget on tracking page itself
    if (pathname.startsWith("/track-order")) {
      setActiveOrder(null);
      return;
    }

    const checkActiveOrder = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_BASE_URL}/api/order/${userId}`);
        if (!res.ok) return;

        const data = await res.json();
        const rawOrders = Array.isArray(data) ? data : data?.orders ? data.orders : [];

        // Find active order (Placed, Cooking, Out for Delivery)
        const active = rawOrders.find((o: any) => {
          const st = String(o.status || "").toLowerCase();
          return st === "cooking" || st === "out for delivery" || st === "placed" || st === "preparing";
        });

        if (active) {
          const rawDate = active.orderDate ?? active.date ?? null;
          const orderTime = rawDate ? new Date(rawDate) : new Date();
          const eta = new Date(orderTime.getTime() + 20 * 60 * 1000);

          setActiveOrder({
            id: active.id || active.orderId || "GG-101",
            status: active.status || "Cooking",
            etaStr: eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            itemsCount: active.items?.length || 1,
          });
        } else {
          setActiveOrder(null);
        }
      } catch (err) {
        console.error("Floating widget error:", err);
      }
    };

    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (!activeOrder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 font-sans"
      >
        {minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2.5 bg-neutral-900/90 text-white border border-orange-500/40 p-3 rounded-full shadow-2xl backdrop-blur-xl hover:scale-110 transition group"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <Bike className="w-5 h-5 text-orange-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-extrabold pr-1">Live Order</span>
          </button>
        ) : (
          <div className="luxury-glass border border-orange-500/30 rounded-3xl p-4 shadow-2xl max-w-xs sm:w-80 bg-neutral-900/90 text-white backdrop-blur-2xl relative space-y-3">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400">
                  Active Order in Progress
                </span>
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="text-neutral-400 hover:text-white p-1"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-white">Order #{activeOrder.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-orange-400" /> ETA: <span className="font-semibold text-white">{activeOrder.etaStr}</span>
                </p>
              </div>
              <span className="bg-orange-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
                {activeOrder.status}
              </span>
            </div>

            {/* Action */}
            <button
              onClick={() => router.push(`/track-order?id=${activeOrder.id}`)}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              Track Live Order Status <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
