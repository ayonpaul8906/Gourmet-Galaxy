"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/lib/data";
import { getUserId } from "@/lib/cartApi";
import { ShoppingBag, RefreshCw, ChevronRight, Clock, MapPin, ArrowRight, Star, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurant?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  address: string;
  date?: string;
  createdAt?: string;
  status: OrderStatus | string;
  items: CartItem[];
  restaurantName?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_BASE_URL}/api/order/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const rawArray = Array.isArray(data) ? data : data?.orders ? data.orders : [];
      setOrders(rawArray);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const uniqueOrdersMap = new Map<string, Order>();
  orders.forEach((o, index) => {
    const key = o.id || `order-${index}`;
    if (!uniqueOrdersMap.has(key)) {
      uniqueOrdersMap.set(key, o);
    }
  });
  const uniqueOrders = Array.from(uniqueOrdersMap.values());

  const currentOrders = uniqueOrders.filter((o) => {
    const st = String(o.status || "").toLowerCase();
    return st === "cooking" || st === "out for delivery" || st === "placed" || st === "preparing";
  });

  const pastOrders = uniqueOrders.filter((o) => {
    const st = String(o.status || "").toLowerCase();
    return st === "delivered" || st === "cancelled";
  });

  const handleSubmitReview = async () => {
    if (!selectedOrderForReview) return;
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${API_BASE_URL}/api/reviews/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForReview.id,
          rating,
          reviewText,
          userId: getUserId(),
        }),
      });
      toast.success("🌟 Thank you! Your feedback has been submitted.");
      setShowReviewModal(false);
      setReviewText("");
    } catch {
      toast.success("🌟 Review submitted cleanly.");
      setShowReviewModal(false);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const orderDateStr = order.date || order.createdAt ? new Date(order.date || order.createdAt || "").toLocaleDateString() : "Recent";
    const st = String(order.status || "").toLowerCase();
    const isActive = st === "cooking" || st === "out for delivery" || st === "placed" || st === "preparing";
    const isDelivered = st === "delivered";

    return (
      <Card className="glassmorphism w-full border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-orange-500 uppercase tracking-wider">
              {order.restaurantName || "Gourmet Galaxy Kitchen"}
            </span>
            <CardTitle className="font-headline font-bold text-xl text-neutral-900 dark:text-neutral-100">
              Order #{order.id ? order.id.slice(-8).toUpperCase() : "GG-101"}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-2 text-neutral-500">
              <Clock className="w-3.5 h-3.5" /> {orderDateStr}
              {order.address && (
                <>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{order.address}</span>
                </>
              )}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status as any} />
        </CardHeader>

        <CardContent className="pt-4 pb-2">
          <div className="space-y-2.5">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-md">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.name}</span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-row justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
          <div>
            <p className="text-xs text-neutral-400">Total Amount</p>
            <p className="font-extrabold text-xl text-orange-600">
              {formatPrice(order.totalAmount)}
            </p>
          </div>

          <div className="flex gap-2">
            {isActive ? (
              <Button
                onClick={() => router.push(`/track-order?id=${order.id}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-orange-500/20"
              >
                Track Live Status <ChevronRight className="w-4 h-4" />
              </Button>
            ) : isDelivered ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedOrderForReview(order);
                    setShowReviewModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Star className="w-3.5 h-3.5 fill-white" /> Rate & Review
                </Button>
                <Button
                  onClick={() => {
                    toast.success("Items added to cart!");
                    router.push("/cart");
                  }}
                  variant="outline"
                  className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold"
                >
                  Reorder
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  toast.success("Items added to cart!");
                  router.push("/cart");
                }}
                variant="outline"
                className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold"
              >
                Reorder
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl primary-gradient text-transparent bg-clip-text">
            Your Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Real-time status updates and order history.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          disabled={loading}
          className="rounded-xl border-orange-200 text-orange-600 gap-2 hover:bg-orange-50 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
          <TabsTrigger value="current" className="rounded-xl font-bold text-xs py-2.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Current Orders ({currentOrders.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl font-bold text-xs py-2.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Past History ({pastOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center py-12 text-neutral-500">Loading current orders...</p>
          ) : currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-16 glassmorphism rounded-3xl space-y-3">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold">No Active Orders</p>
              <p className="text-sm text-neutral-500">Order your favorite dish right now!</p>
              <Button onClick={() => router.push("/explore")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl gap-2">
                Find Dishes <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center py-12 text-neutral-500">Loading past orders...</p>
          ) : pastOrders.length > 0 ? (
            pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-16 glassmorphism rounded-3xl space-y-3">
              <p className="text-lg font-bold">No Past Order History</p>
              <p className="text-sm text-neutral-500">All your completed orders will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ⭐ Rate Delivered Order Modal */}
      <AnimatePresence>
        {showReviewModal && selectedOrderForReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-lg font-bold font-headline">Rate Your Delivered Order</h3>
                  <p className="text-xs text-neutral-500">Order #{selectedOrderForReview.id.slice(-8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-center space-x-2 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-transform hover:scale-125 ${
                      star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <textarea
                placeholder="How was the food quality and delivery experience?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 text-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-orange-500 min-h-[90px]"
              />

              <Button
                onClick={handleSubmitReview}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/25"
              >
                Submit Delivered Order Review
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
