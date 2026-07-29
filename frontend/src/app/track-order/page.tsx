"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChefHat,
  Bike,
  Home,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/cartApi";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface MappedOrder {
  id: string;
  status: string;
  date: Date;
  eta: Date;
  address?: string;
  totalAmount?: number;
  items?: OrderItem[];
  currentStep: number;
  steps: typeof stepsConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps Configuration
// ─────────────────────────────────────────────────────────────────────────────
const stepsConfig = [
  { name: "Placed",           description: "Order received & confirmed.",       icon: Package  },
  { name: "Cooking",          description: "Chef is preparing your meal.",       icon: ChefHat  },
  { name: "Out for Delivery", description: "Rider is on the way to you.",        icon: Bike     },
  { name: "Delivered",        description: "Food delivered. Bon appetit!",       icon: Home     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { m: 0, s: 0 };
    return { m: Math.floor(diff / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Horizontal 4-step progress stepper */
function HorizontalStepper({ order }: { order: MappedOrder }) {
  const totalSteps = stepsConfig.length;
  const fillPct = ((order.currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full px-2 py-4">
      <div className="relative flex items-center justify-between">
        {/* Background bar */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-800 rounded-full z-0" />
        {/* Fill bar */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0"
          style={{ background: "linear-gradient(90deg,#FF5200,#FF9E00)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Step Nodes */}
        {stepsConfig.map((step, i) => {
          const stepIndex  = i + 1;
          const isCompleted = stepIndex < order.currentStep;
          const isCurrent   = stepIndex === order.currentStep;
          const isPending   = stepIndex > order.currentStep;
          const Icon        = step.icon;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative
                  border-2 transition-all duration-500
                  ${isCompleted ? "bg-[#FF5200] border-[#FF5200]"
                    : isCurrent ? "bg-[#FF5200] border-[#FF5200]"
                    : "bg-neutral-900 border-neutral-700"}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <>
                    <span className="absolute w-10 h-10 rounded-full animate-ping bg-orange-500/30" />
                    <Icon className="w-5 h-5 text-white relative z-10" />
                  </>
                ) : (
                  <Icon className={`w-5 h-5 ${isPending ? "text-neutral-600" : "text-white"}`} />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold text-center max-w-[64px] leading-tight
                  ${isCurrent   ? "text-[#FF5200]"
                  : isCompleted ? "text-orange-400"
                  : "text-neutral-600"}`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ETA Countdown display */
function EtaCountdown({ eta, isDelivered, isCancelled, orderDate }: {
  eta: Date;
  isDelivered: boolean;
  isCancelled: boolean;
  orderDate: Date;
}) {
  const { m, s } = useCountdown(eta);
  const past = Date.now() > eta.getTime();

  if (isCancelled) {
    return (
      <div className="rounded-2xl p-5 text-center bg-red-500/10 border border-red-500/20 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">Order Cancelled</p>
        <p className="text-3xl font-extrabold text-red-400">—</p>
        <p className="text-xs text-neutral-500">This order has been cancelled.</p>
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="rounded-2xl p-5 text-center bg-emerald-500/10 border border-emerald-500/20 space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Delivered At</p>
        <p className="text-3xl font-extrabold text-emerald-400">{fmtTime(orderDate)}</p>
        <p className="text-xs text-neutral-500">Your food has been delivered!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/20 space-y-1">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
          {past ? "Arriving any moment" : "Estimated Arrival"}
        </p>
      </div>
      <p className="text-4xl font-extrabold text-center text-white tracking-tight">
        {fmtTime(eta)}
      </p>
      {!past && (
        <p className="text-center text-sm font-semibold text-orange-300">
          <span className="tabular-nums">{String(m).padStart(2, "0")}</span>m{" "}
          <span className="tabular-nums">{String(s).padStart(2, "0")}</span>s remaining
        </p>
      )}
    </div>
  );
}

/** Rider info card */
function RiderCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Bike className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white">Rahul Sharma</p>
          <p className="text-xs text-neutral-400">Galactic Delivery Partner</p>
          <p className="text-xs text-yellow-400 font-semibold mt-0.5">&#9733; 4.9 Rating</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl border-orange-500/40 text-orange-400 hover:bg-orange-500/10 text-xs font-semibold gap-1.5"
      >
        <Phone className="w-3.5 h-3.5" />
        Call Rider
      </Button>
    </motion.div>
  );
}

/** Map placeholder */
function MapPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-36 rounded-2xl overflow-hidden border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center gap-2"
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#FF5200 1px, transparent 1px), linear-gradient(90deg, #FF5200 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span className="text-4xl select-none">&#128506;</span>
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-semibold text-neutral-300">Live tracking enabled</span>
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </span>
      </div>
    </motion.div>
  );
}

/** Status banner */
function StatusBanner({ status, isDelivered, isCancelled }: {
  status: string;
  isDelivered: boolean;
  isCancelled: boolean;
}) {
  const cfg = isCancelled
    ? { bg: "from-red-600/80 to-rose-700/80",     textCls: "text-red-100",     label: "Order Cancelled" }
    : isDelivered
    ? { bg: "from-emerald-600/80 to-teal-700/80", textCls: "text-emerald-100", label: "Order Delivered" }
    : { bg: "from-[#FF5200]/80 to-[#FF9E00]/80",  textCls: "text-white",       label: status };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-xl px-4 py-2.5 bg-gradient-to-r ${cfg.bg} flex items-center justify-between`}
    >
      <span className={`text-sm font-extrabold tracking-wide ${cfg.textCls}`}>{cfg.label}</span>
      {!isCancelled && !isDelivered && (
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className={`text-xs font-semibold ${cfg.textCls} opacity-80`}>LIVE</span>
        </span>
      )}
    </motion.div>
  );
}

/** Single order card */
function OrderCard({
  order,
  onCancel,
  cancellingId,
}: {
  order: MappedOrder;
  onCancel: (id: string) => void;
  cancellingId: string | null;
}) {
  const st          = String(order.status || "").toLowerCase();
  const isDelivered = st === "delivered";
  const isCancelled = st === "cancelled";
  const isActive    = !isDelivered && !isCancelled;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glassmorphism rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden"
    >
      {/* Card header */}
      <div className="p-6 border-b border-neutral-800/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-0.5">
            <span className="inline-block bg-orange-500/10 text-orange-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20">
              Live Delivery Tracker
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2">
              Order <span className="text-[#FF5200]">#{order.id}</span>
            </h2>
            <p className="text-xs text-neutral-500">
              {order.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {order.address && (
                <>
                  {" — "}
                  <span className="text-neutral-400">{order.address}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <StatusBanner status={order.status} isDelivered={isDelivered} isCancelled={isCancelled} />

        {/* Horizontal Stepper */}
        {!isCancelled && <HorizontalStepper order={order} />}
      </div>

      {/* Card body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* ETA */}
          <EtaCountdown
            eta={order.eta}
            isDelivered={isDelivered}
            isCancelled={isCancelled}
            orderDate={order.date}
          />

          {/* Rider card - active only */}
          {isActive && <RiderCard />}

          {/* Map placeholder - active only */}
          {isActive && <MapPlaceholder />}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Items list */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                Items Ordered
              </p>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="text-neutral-300">{item.name}</span>
                    </span>
                    <span className="font-bold text-white">
                      &#8377;{(item.price || 0) * (item.quantity || 1)}
                    </span>
                  </motion.li>
                ))}
              </ul>
              <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-neutral-400">Total Paid</span>
                <span className="text-2xl font-extrabold text-[#FF5200]">
                  &#8377;{order.totalAmount ?? 0}
                </span>
              </div>
            </div>
          )}

          {/* If no items, still show total */}
          {(!order.items || order.items.length === 0) && (
            <div className="flex justify-between items-center border-t border-neutral-800 pt-4">
              <span className="text-sm font-bold text-neutral-400">Total Paid</span>
              <span className="text-2xl font-extrabold text-[#FF5200]">
                &#8377;{order.totalAmount ?? 0}
              </span>
            </div>
          )}

          {/* Cancel button */}
          {isActive && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => onCancel(order.id)}
                disabled={cancellingId === order.id}
                variant="destructive"
                className="w-full rounded-xl font-bold text-sm h-11 tracking-wide"
              >
                {cancellingId === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
              </Button>
            </motion.div>
          )}

          {/* Go back link */}
          <Link href="/orders" className="block">
            <Button
              variant="ghost"
              className="w-full rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 gap-2 h-10"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const router = useRouter();
  const [orders, setOrders]               = useState<MappedOrder[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [cancellingId, setCancellingId]   = useState<string | null>(null);
  const [lastRefresh, setLastRefresh]     = useState<Date>(new Date());
  const [manualRefresh, setManualRefresh] = useState(false);

  // Fetch orders
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const userId        = getUserId();
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
      let allOrders: any[] = Array.isArray(data) ? data : data?.orders ?? [];

      // Deduplicate
      const uniqueMap = new Map<string, any>();
      allOrders.forEach((o: any, idx: number) => {
        const key = o.id || o.orderId || `ord-${idx}`;
        if (!uniqueMap.has(key)) uniqueMap.set(key, o);
      });
      let uniqueOrders = Array.from(uniqueMap.values());

      // Filter by latest order if available
      if (latestOrderId) {
        const filtered = uniqueOrders.filter(
          (o: any) => o.id === latestOrderId || o.orderId === latestOrderId
        );
        if (filtered.length > 0) uniqueOrders = filtered;
      }

      // Map and normalise
      const mappedOrders: MappedOrder[] = uniqueOrders.map((o: any) => {
        const rawDate   = o.orderDate ?? o.date ?? null;
        const orderTime = rawDate ? new Date(rawDate) : new Date();
        const eta       = new Date(orderTime.getTime() + 20 * 60 * 1000);

        const statusIndex = stepsConfig.findIndex(
          (s) => s.name.toLowerCase() === String(o.status || "").toLowerCase()
        );
        const currentStep = statusIndex >= 0 ? statusIndex + 1 : 1;

        return {
          ...o,
          id:          o.id ?? o.orderId ?? "GG-101",
          date:        orderTime,
          eta,
          steps:       stepsConfig,
          currentStep,
        };
      });

      setOrders(mappedOrders);
      setLastRefresh(new Date());
      setError("");
    } catch (err: any) {
      console.error("Track fetch error:", err);
      if (!silent) setError(err?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-poll every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    const userId = getUserId();
    if (!userId) return;
    setCancellingId(orderId);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(
        `${API_BASE_URL}/api/order/update-status/${userId}/${orderId}`,
        {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status: "Cancelled" }),
        }
      );
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "Cancelled", currentStep: 1 } : o
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setManualRefresh(true);
    await fetchOrders();
    setManualRefresh(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 pb-24">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="font-extrabold text-4xl md:text-5xl primary-gradient text-transparent bg-clip-text">
            Live Order Tracking
          </h1>
          <p className="text-neutral-500 text-sm">
            Real-time status updates — from our kitchen to your doorstep.
          </p>

          {/* Last refreshed + manual refresh */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-600">
              Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              onClick={handleManualRefresh}
              className="text-orange-400 hover:text-orange-300 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${manualRefresh ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="glassmorphism rounded-3xl border border-neutral-800 p-6 space-y-4 animate-pulse"
                >
                  <div className="h-5 w-40 rounded-full bg-neutral-800" />
                  <div className="h-4 w-64 rounded-full bg-neutral-800" />
                  <div className="flex gap-6 pt-4 justify-between">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-neutral-800" />
                        <div className="w-14 h-2.5 rounded-full bg-neutral-800" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="h-24 rounded-2xl bg-neutral-800" />
                    <div className="h-24 rounded-2xl bg-neutral-800" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glassmorphism rounded-3xl border border-red-500/20 p-10 text-center space-y-3"
            >
              <p className="text-2xl">&#9888;&#65039;</p>
              <p className="font-bold text-red-400">{error}</p>
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {!loading && orders.length === 0 && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glassmorphism rounded-3xl border border-neutral-800 py-20 px-8 text-center space-y-4"
            >
              <div className="text-6xl">&#128230;</div>
              <p className="text-xl font-extrabold text-white">No active orders to track</p>
              <p className="text-sm text-neutral-500">
                Place an order and come back here for live updates!
              </p>
              <Link href="/menu">
                <Button className="rounded-xl bg-[#FF5200] hover:bg-orange-600 text-white font-bold px-8 mt-2 gap-2">
                  Browse Menu
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order cards */}
        <AnimatePresence mode="popLayout">
          {!loading &&
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancelOrder}
                cancellingId={cancellingId}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
