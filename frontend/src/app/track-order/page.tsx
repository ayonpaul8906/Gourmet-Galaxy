"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, ChefHat, Bike, Home, CheckCircle2, Circle, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/cartApi";

const stepsConfig = [
  { name: "Placed", description: "Order received & confirmed by restaurant.", icon: Package },
  { name: "Cooking", description: "Master Chef is preparing your dish.", icon: ChefHat },
  { name: "Out for Delivery", description: "Rider is heading to your address.", icon: Bike },
  { name: "Delivered", description: "Food delivered. Bon appétit!", icon: Home },
];

export default function TrackingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = getUserId();
        const latestOrderId = localStorage.getItem("latestOrderId");

        if (!userId) {
          setError("User session not found.");
          setLoading(false);
          return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_BASE_URL}/api/order/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        let allOrders = Array.isArray(data) ? data : data?.orders ? data.orders : [];

        // Deduplicate orders
        const uniqueMap = new Map<string, any>();
        allOrders.forEach((o, idx) => {
          const key = o.id || o.orderId || `ord-${idx}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, o);
          }
        });
        let uniqueOrders = Array.from(uniqueMap.values());

        // Filter latest placed order if specified
        if (latestOrderId) {
          const filtered = uniqueOrders.filter((o) => o.id === latestOrderId || o.orderId === latestOrderId);
          if (filtered.length > 0) uniqueOrders = filtered;
        }

        // Map and normalize orders
        const mappedOrders = uniqueOrders.map((o) => {
          const rawDate = o.orderDate ?? o.date ?? null;
          const orderTime = rawDate ? new Date(rawDate) : new Date();
          const eta = new Date(orderTime.getTime() + 20 * 60 * 1000);

          const statusIndex = stepsConfig.findIndex(
            (s) => s.name.toLowerCase() === String(o.status || "").toLowerCase()
          );
          const currentStep = statusIndex >= 0 ? statusIndex + 1 : 1;

          return {
            ...o,
            id: o.id ?? o.orderId ?? "GG-101",
            date: orderTime,
            eta,
            steps: stepsConfig,
            currentStep,
          };
        });

        setOrders(mappedOrders);
      } catch (err: any) {
        console.error("Track fetch error:", err);
        setError(err?.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_BASE_URL}/api/order/update-status/${userId}/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "Cancelled" } : o
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 pb-24 text-neutral-900 dark:text-neutral-100 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl primary-gradient text-transparent bg-clip-text">
          Live Order Tracking
        </h1>
        <p className="text-neutral-500 text-sm">Real-time status updates from our kitchen to your doorstep.</p>
      </div>

      {loading && <p className="text-center text-neutral-500 py-12">Loading tracking details...</p>}
      {error && <p className="text-center text-red-500 py-8">{error}</p>}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16 glassmorphism rounded-3xl space-y-3">
          <p className="text-lg font-bold">No active orders to track</p>
          <p className="text-sm text-neutral-500">Place an order to see live tracking updates!</p>
        </div>
      )}

      <div className="space-y-8">
        {orders.map((order) => {
          const st = String(order.status || "").toLowerCase();
          const isDelivered = st === "delivered";
          const isCancelled = st === "cancelled";

          return (
            <Card
              key={order.id}
              className="glassmorphism overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl"
            >
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/80 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <span className="bg-orange-500/10 text-orange-600 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      Live Delivery Tracker
                    </span>
                    <CardTitle className="font-headline text-2xl font-bold mt-2">
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription className="text-xs text-neutral-500 pt-0.5">
                      {order.date?.toLocaleDateString()} — Delivery Address: <span className="font-medium text-neutral-700 dark:text-neutral-300">{order.address}</span>
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      isDelivered
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : isCancelled
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-8 p-6">
                {/* Steps Timeline */}
                {!isCancelled && (
                  <div className="md:col-span-2">
                    <ul className="relative space-y-6">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-800" />
                      {order.steps.map((step: any, i: number) => {
                        const stepIndex = i + 1;
                        const isCompleted = stepIndex < order.currentStep;
                        const isCurrent = stepIndex === order.currentStep;
                        const isPending = stepIndex > order.currentStep;

                        return (
                          <li key={i} className="relative z-10 flex items-start gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                              ) : isCurrent ? (
                                <span className="relative flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                                </span>
                              ) : (
                                <Circle className="h-5 w-5 text-neutral-300 dark:text-neutral-700" />
                              )}
                            </div>
                            <div className="pt-0.5">
                              <p className={`font-bold text-sm ${isPending ? "text-neutral-400" : "text-neutral-900 dark:text-neutral-100"}`}>
                                {step.name}
                              </p>
                              <p className="text-xs text-neutral-500">{step.description}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Right Details Panel */}
                <div className={`${isCancelled ? "md:col-span-5" : "md:col-span-3"} space-y-6`}>
                  <div
                    className={`rounded-2xl p-6 text-center space-y-1 ${
                      isDelivered
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : isCancelled
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-orange-500/10 border border-orange-500/20"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {isDelivered ? "Delivered" : isCancelled ? "Order Cancelled" : "Estimated Arrival"}
                    </p>
                    <p className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                      {!isDelivered && !isCancelled
                        ? order.eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : order.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Rider Card Simulation */}
                  {!isDelivered && !isCancelled && (
                    <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between bg-white/50 dark:bg-neutral-900/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/10 text-orange-600 rounded-full flex items-center justify-center font-bold">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Rahul Sharma</p>
                          <p className="text-xs text-neutral-500">Galactic Delivery Partner • 4.9★</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl border-orange-200 text-orange-600 text-xs font-semibold gap-1">
                        <Phone className="w-3.5 h-3.5" /> Call Rider
                      </Button>
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Items Ordered</p>
                      <ul className="space-y-2">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">{item.quantity}x</span> {item.name}
                            </span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">₹{(item.price || 0) * (item.quantity || 1)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center pt-1">
                    <p className="text-base font-bold">Total Paid:</p>
                    <p className="text-xl font-extrabold text-orange-600">₹{order.totalAmount ?? 0}</p>
                  </div>

                  {!isDelivered && !isCancelled && (
                    <Button
                      onClick={() => handleCancelOrder(order.id)}
                      variant="destructive"
                      className="w-full rounded-xl font-bold text-xs"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
