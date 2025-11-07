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
import { Package, ChefHat, Bike, Home, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

const stepsConfig = [
  { name: "Placed", description: "We have received your order.", icon: Package },
  { name: "Cooking", description: "Your food is being prepared.", icon: ChefHat },
  { name: "Out for Delivery", description: "Your rider is on the way.", icon: Bike },
  { name: "Delivered", description: "Enjoy your meal!", icon: Home },
];

export default function TrackingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const latestOrderId = localStorage.getItem("latestOrderId");

        if (!userId) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:8080/api/order/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        let allOrders = Array.isArray(data) ? data : [];

        // ✅ Filter only the latest placed order
        if (latestOrderId) {
          allOrders = allOrders.filter((o) => o.id === latestOrderId);
        }

        // ✅ Normalize date and add ETA
        const mappedOrders = allOrders.map((o) => {
          const rawDate = o.orderDate ?? o.date ?? null;
          const orderTime = rawDate ? new Date(rawDate) : new Date();
          const eta = new Date(orderTime.getTime() + 20 * 60 * 1000); // +20 min

          const statusIndex = stepsConfig.findIndex((s) => s.name === o.status);
          const currentStep = statusIndex >= 0 ? statusIndex + 1 : 1;

          return {
            ...o,
            id: o.id ?? o.orderId,
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
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/order/update-status/${userId}/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      if (res.ok) {
        // ✅ Update the order state instantly
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
    <div className="container mx-auto px-4 py-8 text-zinc-100 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
          Track Your Order
        </h1>
        <p className="mt-4 text-lg text-zinc-400">Live tracking of your latest order.</p>
      </div>

      {loading && <p className="text-center text-lg text-zinc-300">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-center text-zinc-400">No recent orders found.</p>
      )}

      <div className="space-y-8 max-w-4xl mx-auto">
        {orders.map((order) => {
          const isDelivered = order.status === "Delivered";
          const isCancelled = order.status === "Cancelled";

          return (
            <Card
              key={order.id}
              className="overflow-hidden bg-zinc-900/60 backdrop-blur-lg border border-zinc-700/50 shadow-2xl"
            >
              <CardHeader className="border-b border-zinc-700/50 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <CardDescription className="font-medium text-base text-orange-400">
                      Your Order
                    </CardDescription>
                    <CardTitle className="font-headline text-2xl text-zinc-100">
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 pt-1">
                      {order.date?.toLocaleDateString()} — {order.address}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-sm px-4 py-1.5 rounded-full font-semibold mt-3 sm:mt-0 shrink-0 ${
                      isDelivered
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : isCancelled
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-x-12 gap-y-8 p-6">
                {/* Show tracking steps only if NOT cancelled */}
                {!isCancelled && (
                  <div className="md:col-span-2">
                    <ul className="relative space-y-8">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-zinc-700" />
                      {order.steps.map((step: any, i: number) => {
                        const stepIndex = i + 1;
                        const isCompleted = stepIndex < order.currentStep;
                        const isCurrent = stepIndex === order.currentStep;
                        const isPending = stepIndex > order.currentStep;

                        return (
                          <li key={i} className="relative z-10 flex items-start gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="h-8 w-8 text-orange-500" />
                              ) : isCurrent ? (
                                <span className="relative flex h-8 w-8">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-8 w-8 bg-orange-500 border-2 border-zinc-900"></span>
                                </span>
                              ) : (
                                <Circle className="h-8 w-8 text-zinc-600" />
                              )}
                            </div>
                            <div className="pt-1">
                              <p className={`font-medium ${isPending ? "text-zinc-500" : "text-zinc-100"}`}>
                                {step.name}
                              </p>
                              <p className="text-sm text-zinc-400">{step.description}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Right section (always visible) */}
                <div className={`${isCancelled ? "md:col-span-5" : "md:col-span-3"} space-y-6`}>
                  <div
                    className={`rounded-lg p-6 text-center ${
                      isDelivered
                        ? "bg-green-500/10 border border-green-500/20"
                        : isCancelled
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-orange-500/10 border border-orange-500/20"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        isDelivered
                          ? "text-green-300"
                          : isCancelled
                          ? "text-red-300"
                          : "text-orange-300"
                      }`}
                    >
                      {isDelivered
                        ? "Delivered"
                        : isCancelled
                        ? "Order Cancelled"
                        : "Estimated Delivery"}
                    </p>
                    <p
                      className={`text-4xl font-bold ${
                        isDelivered
                          ? "text-green-300"
                          : isCancelled
                          ? "text-red-300"
                          : "text-orange-300"
                      }`}
                    >
                      {!isDelivered && !isCancelled
                        ? order.eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : order.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="pt-2">
                      <p className="font-semibold mb-3 text-lg text-zinc-100">Your Items</p>
                      <ul className="space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="flex justify-between text-zinc-300">
                            <span>
                              <span className="font-medium text-zinc-100">{item.quantity} ×</span>{" "}
                              {item.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator className="bg-zinc-700/50" />

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xl font-bold text-zinc-100">Total:</p>
                    <p className="text-xl font-bold text-orange-400">₹{order.totalAmount ?? 0}</p>
                  </div>

                  {!isDelivered && !isCancelled && (
                    <Button
                      onClick={() => handleCancelOrder(order.id)}
                      variant="destructive"
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold hover:cursor-pointer"
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
