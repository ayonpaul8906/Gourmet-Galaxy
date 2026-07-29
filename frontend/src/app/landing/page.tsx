"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  CheckCircle2,
  Zap,
  Headphones,
  UtensilsCrossed,
  Instagram,
  Twitter,
  Play,
  TrendingUp,
  ShoppingBag,
  Navigation,
} from "lucide-react";
import { useRef } from "react";

/* ─────────────────────────── helpers ─────────────────────────── */

function SectionWrapper({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─────────────────────────── NAVBAR ─────────────────────────── */

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Gourmet Galaxy
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
          <Link href="#categories" className="hover:text-white transition-colors">Menu</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#testimonials" className="hover:text-white transition-colors">Reviews</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white/80 border border-white/10 hover:border-white/30 hover:text-white transition-all">
            Sign In
          </Link>
          <Link href="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors shadow-lg shadow-orange-500/25">
            Order Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

const foodCards = [
  { emoji: "🍕", label: "Pizza", delay: 0.1, x: -60, y: -20 },
  { emoji: "🍔", label: "Burger", delay: 0.2, x: 60, y: -40 },
  { emoji: "🍜", label: "Noodles", delay: 0.3, x: -80, y: 20 },
  { emoji: "🌮", label: "Tacos", delay: 0.4, x: 80, y: 30 },
  { emoji: "🍣", label: "Sushi", delay: 0.5, x: 0, y: 50 },
];

const stats = [
  { value: "50K+", label: "Happy Users" },
  { value: "150+", label: "Restaurants" },
  { value: "18 min", label: "Avg Delivery" },
  { value: "4.9★", label: "App Rating" },
];

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-neutral-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(194,65,12,0.22),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_70%,rgba(234,88,12,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_20%_80%,rgba(154,52,18,0.15),transparent)]" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6"
        >
          2 Billion+{" "}
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Meals Delivered
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Your favourite restaurants, your cravings, delivered to your door in under 20 minutes. No fuss, no wait - just great food.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/auth" className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-400/40 hover:scale-105">
            Start Ordering
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="relative flex items-center justify-center gap-4 mb-16 h-24">
          {foodCards.map((card, i) => (
            <motion.div
              key={card.emoji}
              initial={{ opacity: 0, x: card.x, y: card.y }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + card.delay, type: "spring", stiffness: 100 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 + i * 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-orange-500/30 transition-colors cursor-pointer"
              >
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-xs text-neutral-400 font-medium">{card.label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
    </section>
  );
}

/* ─────────────────────────── CATEGORIES ─────────────────────────── */

const categories = [
  { emoji: "🍕", name: "Pizza", count: "32 places" },
  { emoji: "🍔", name: "Burgers", count: "28 places" },
  { emoji: "🍛", name: "Biryani", count: "45 places" },
  { emoji: "🍣", name: "Sushi", count: "18 places" },
  { emoji: "🍝", name: "Pasta", count: "22 places" },
  { emoji: "🍰", name: "Desserts", count: "36 places" },
  { emoji: "🥗", name: "Healthy", count: "24 places" },
  { emoji: "🥡", name: "Chinese", count: "30 places" },
];

function CategoriesSection() {
  return (
    <SectionWrapper id="categories" className="py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Explore Cuisines</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Cravings?{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">We Got You.</span>
          </h2>
          <p className="text-neutral-400 mt-4 text-lg max-w-xl mx-auto">
            From spicy street food to fine dining — explore hundreds of cuisines at your fingertips.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-500 rounded-2xl" />
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
              <div className="text-center relative z-10">
                <p className="text-white font-semibold text-base">{cat.name}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{cat.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */

const steps = [
  {
    num: "01",
    icon: UtensilsCrossed,
    title: "Choose Restaurant",
    desc: "Browse 150+ curated menus from top-rated local and national restaurants. Filter by cuisine, rating, or delivery time.",
    color: "from-orange-500/20 to-red-500/10",
    border: "border-orange-500/20",
  },
  {
    num: "02",
    icon: ShoppingBag,
    title: "Customize & Order",
    desc: "Pick your dishes, customize them exactly how you like, add to cart, and checkout securely in under 60 seconds.",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
  },
  {
    num: "03",
    icon: Navigation,
    title: "Track Live",
    desc: "Watch your order travel to you on real-time GPS. Average delivery in just 18 minutes — hot, fresh, guaranteed.",
    color: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20",
  },
];

function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="py-24 bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            3 Simple{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Steps</span>
          </h2>
          <p className="text-neutral-400 mt-4 text-lg">Getting great food has never been easier.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.color} border ${step.border} backdrop-blur-sm overflow-hidden`}
              >
                <div className="absolute top-4 right-6 text-7xl font-black text-white/5 leading-none select-none">{step.num}</div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-900 border border-white/10 items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ─────────────────────────── FEATURE HIGHLIGHTS ─────────────────────────── */

const features = [
  { icon: MapPin, text: "Real-time GPS tracking from kitchen to door" },
  { icon: Zap, text: "Lightning fast 18-min average delivery" },
  { icon: UtensilsCrossed, text: "150+ top-rated partner restaurants" },
  { icon: Headphones, text: "24/7 live customer support, always available" },
];

function OrderStatusWidget() {
  return (
    <div className="relative p-6 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Order #GG-20419</p>
          <p className="text-white font-bold text-lg mt-0.5">Pepperoni Pizza + Coke</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
          On the Way
        </div>
      </div>

      {[
        { icon: "✅", label: "Order Confirmed", done: true, time: "7:45 PM" },
        { icon: "👨‍🍳", label: "Being Prepared", done: true, time: "7:52 PM" },
        { icon: "🛵", label: "Out for Delivery", done: true, time: "8:03 PM" },
        { icon: "🏠", label: "Arriving Soon", done: false, time: "~8:15 PM" },
      ].map((s, i, arr) => (
        <div key={s.label} className="flex items-start gap-4 relative">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base z-10 ${s.done ? "bg-orange-500/20 border border-orange-500/50" : "bg-white/5 border border-white/10"}`}>
              {s.icon}
            </div>
            {i < arr.length - 1 && <div className={`w-0.5 h-8 ${s.done ? "bg-orange-500/40" : "bg-white/10"}`} />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${s.done ? "text-white" : "text-neutral-500"}`}>{s.label}</p>
              <p className={`text-xs ${s.done ? "text-orange-400" : "text-neutral-600"}`}>{s.time}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-2 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
        <Clock className="w-5 h-5 text-orange-400 shrink-0" />
        <div>
          <p className="text-white text-sm font-semibold">Estimated arrival in 12 min</p>
          <p className="text-neutral-500 text-xs mt-0.5">Your rider is 1.2 km away</p>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <SectionWrapper className="py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Why Choose Us</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Why{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">50,000+ people</span>{" "}
              choose Gourmet Galaxy every day
            </h2>
            <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
              We have obsessed over every detail so you can focus on what matters — enjoying incredible food.
            </p>
            <div className="space-y-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <p className="text-neutral-200 font-medium">{f.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <Link href="/auth" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all shadow-lg shadow-orange-500/25 hover:scale-105">
                Try It Free <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <OrderStatusWidget />
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ─────────────────────────── TESTIMONIALS ─────────────────────────── */

const testimonials = [
  {
    name: "Arjun M",
    role: "Software Engineer, Bengaluru",
    initial: "A",
    color: "from-orange-500 to-red-500",
    stars: 5,
    quote: "I order from Gourmet Galaxy almost every other day. The delivery is insanely fast — my biryani arrived piping hot in 16 minutes flat. The tracking feature is a game changer. I always know exactly where my food is. Honestly unmatched.",
  },
  {
    name: "Priya S",
    role: "Marketing Lead, Mumbai",
    initial: "P",
    color: "from-pink-500 to-rose-500",
    stars: 5,
    quote: "Finally a food app that actually cares about quality! The restaurant selection is incredible — I discovered my new favourite sushi spot through Gourmet Galaxy. The UI is so clean and checkout takes literally 30 seconds. 10/10 would recommend.",
  },
  {
    name: "Rohit K",
    role: "Entrepreneur, Hyderabad",
    initial: "R",
    color: "from-amber-500 to-orange-500",
    stars: 5,
    quote: "Been using food apps for years and nothing comes close. My order was slightly delayed once and their support team reached out to me before I could even complain, and gave me a full refund. That kind of proactive service is rare.",
  },
];

function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" className="py-24 bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Customer Love</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            What Our{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Foodies Say</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="flex flex-col gap-5 p-7 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/15 transition-all"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-neutral-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-neutral-500 text-sm"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>50,000+ active users</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span>4.9 / 5 average rating</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>2B+ orders fulfilled</span>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

/* ─────────────────────────── CTA BANNER ─────────────────────────── */

function CTABanner() {
  return (
    <SectionWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 p-12 md:p-16 text-center shadow-2xl shadow-orange-500/20">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">
                🔥 Limited Time — Free Delivery on First Order
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">Ready to Order?</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
                Join 50,000+ food lovers. Sign up free, no credit card required. Get your first delivery fee waived instantly.
              </p>
              <Link href="/auth" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-orange-600 font-black text-lg hover:bg-orange-50 transition-all shadow-xl hover:scale-105 hover:shadow-2xl">
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */

function Footer() {
  return (
    <footer className="bg-neutral-900/50 border-t border-white/10 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Gourmet Galaxy
              </span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Bringing the galaxy&apos;s finest cuisines to your doorstep. Fast, fresh, and always delicious.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-center">
            <p className="text-white text-sm font-semibold mb-4">Quick Links</p>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "#categories", label: "Menu" },
                { href: "/orders", label: "Orders" },
                { href: "/profile", label: "Profile" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-neutral-500 text-sm hover:text-orange-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <p className="text-white text-sm font-semibold mb-4">Follow Us</p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/10 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <p className="text-neutral-600 text-xs mt-4 md:text-right">support@gourmetgalaxy.in</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <p>© 2024 Gourmet Galaxy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── PAGE ROOT ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-neutral-950 min-h-screen text-white antialiased">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
