"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Utensils,
  Bell,
  ChevronRight,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getUserOrders } from "@/lib/orderApi";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  street: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt?: string;
  orderDate?: string;
  restaurantName?: string;
  totalAmount: number;
  status: string;
  address?: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders" | "wallet" | "settings">("profile");

  // Profile info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryPref, setDietaryPref] = useState<"all" | "veg" | "non-veg">("all");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrType, setNewAddrType] = useState<"Home" | "Work" | "Other">("Home");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrPincode, setNewAddrPincode] = useState("");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [addAmount, setAddAmount] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);

  // Notifications toggles
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);

  // Load saved profile data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("userName") || "";
      const savedEmail = localStorage.getItem("userEmail") || "";
      const savedPhone = localStorage.getItem("userPhone") || "";
      const savedPref = localStorage.getItem("dietaryPref");
      // Load addresses from the same key used by the checkout GPS page
      const savedAddresses = localStorage.getItem("savedAddresses") || localStorage.getItem("userAddresses");

      setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
      if (savedPref) setDietaryPref(savedPref as any);
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("dietaryPref", dietaryPref);
    toast.success("✅ Profile updated successfully!");
  };

  // Address handlers
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity || !newAddrPincode) {
      toast.error("Please fill all required address fields");
      return;
    }
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      type: newAddrType,
      name,
      street: newAddrStreet,
      city: newAddrCity,
      pincode: newAddrPincode,
      phone,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, newAddress];
    setAddresses(updated);
    localStorage.setItem("userAddresses", JSON.stringify(updated));
    setShowAddAddressModal(false);
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrPincode("");
    toast.success("✅ New address added!");
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("userAddresses", JSON.stringify(updated));
    toast.info("Address deleted");
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("userAddresses", JSON.stringify(updated));
    toast.success("Default address updated!");
  };

  // Fetch past orders
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await getUserOrders();
      let rawArray: any[] = [];
      if (Array.isArray(data)) {
        rawArray = data;
      } else if (data?.orders && Array.isArray(data.orders)) {
        rawArray = data.orders;
      }
      const uniqueMap = new Map<string, Order>();
      rawArray.forEach((o: any, idx: number) => {
        const key = o.id || `ord-${idx}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, o);
        }
      });
      setOrders(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Add money to wallet
  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setWalletBalance((prev) => prev + amt);
    setAddAmount("");
    setShowAddMoney(false);
    toast.success(`🎉 Added ₹${amt} to Galaxy Pay Wallet!`);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/landing");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 pb-24">
      {/* 🌟 Swiggy VIP Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-orange-950 to-neutral-900 text-white p-6 md:p-8 shadow-2xl border border-orange-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white font-extrabold text-4xl flex items-center justify-center border-4 border-white/20 shadow-xl shadow-orange-500/30 flex-shrink-0">
              {name ? name.charAt(0).toUpperCase() : "G"}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400" /> Galaxy One VIP
                </span>
              </div>
              <p className="text-neutral-400 text-sm flex items-center justify-center sm:justify-start gap-4">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-auto">
            <div className="text-center">
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Orders</p>
              <p className="text-xl font-extrabold text-orange-400">{orders.length > 0 ? orders.length : 12}</p>
            </div>
            <div className="text-center border-x border-white/10 px-2">
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Addresses</p>
              <p className="text-xl font-extrabold text-white">{addresses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Wallet</p>
              <p className="text-xl font-extrabold text-emerald-400">₹{walletBalance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Main Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <Card className="glassmorphism border-neutral-200 dark:border-neutral-800 p-2 shadow-md">
            <nav className="flex flex-row lg:flex-col overflow-x-auto gap-1">
              {[
                { id: "profile", label: "Profile Info", icon: User },
                { id: "addresses", label: "Saved Addresses", icon: MapPin },
                { id: "orders", label: "Orders History", icon: ShoppingBag },
                { id: "wallet", label: "Galaxy Pay Wallet", icon: Wallet },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap text-left w-full",
                      isActive
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full text-left"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </Card>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-3">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <Card className="glassmorphism border-neutral-200 dark:border-neutral-800 shadow-lg">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your contact details and dietary preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-neutral-300 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border-neutral-300 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl border-neutral-300 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Food Preference</Label>
                      <div className="flex gap-2">
                        {[
                          { id: "all", label: "All Foods", icon: Utensils },
                          { id: "veg", label: "Pure Veg 🥦", icon: Utensils },
                          { id: "non-veg", label: "Non-Veg 🍗", icon: Utensils },
                        ].map((pref) => (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => setDietaryPref(pref.id as any)}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
                              dietaryPref === pref.id
                                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                : "border-neutral-200 hover:border-orange-300 text-neutral-600 dark:text-neutral-300"
                            )}
                          >
                            {pref.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-sm text-neutral-500">Manage your home, work, and other delivery locations.</p>
                </div>
                <Button
                  onClick={() => setShowAddAddressModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <Card
                    key={addr.id}
                    className="glassmorphism relative border border-neutral-200 dark:border-neutral-800 transition-all hover:shadow-lg"
                  >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <span className="bg-orange-500/10 text-orange-600 font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wide">
                        {addr.type}
                      </span>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-bold text-base">{addr.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {addr.street}, {addr.city} - <span className="font-semibold text-neutral-800 dark:text-neutral-200">{addr.pincode}</span>
                      </p>
                      <p className="text-xs text-neutral-500">Phone: {addr.phone}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Address Modal */}
              {showAddAddressModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => setShowAddAddressModal(false)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-black text-xl"
                    >
                      ✕
                    </button>
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-xl font-bold">Add New Delivery Address</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Address Tag</Label>
                        <div className="flex gap-2">
                          {(["Home", "Work", "Other"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setNewAddrType(t)}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg border text-xs font-semibold transition",
                                newAddrType === t
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "border-neutral-300 text-neutral-600"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Street / Flat / Building</Label>
                        <Input
                          placeholder="e.g. 102 Sector 5, Salt Lake"
                          value={newAddrStreet}
                          onChange={(e) => setNewAddrStreet(e.target.value)}
                          required
                          className="rounded-xl mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold">City</Label>
                          <Input
                            placeholder="e.g. Kolkata"
                            value={newAddrCity}
                            onChange={(e) => setNewAddrCity(e.target.value)}
                            required
                            className="rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Pincode</Label>
                          <Input
                            placeholder="e.g. 700091"
                            value={newAddrPincode}
                            onChange={(e) => setNewAddrPincode(e.target.value)}
                            required
                            className="rounded-xl mt-1"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAddAddressModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS HISTORY */}
          {activeTab === "orders" && (
            <Card className="glassmorphism border-neutral-200 dark:border-neutral-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-orange-500" />
                    Past Orders
                  </CardTitle>
                  <CardDescription>Track active orders and reorder your favorite meals.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOrders}
                  className="gap-2 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", loadingOrders && "animate-spin")} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {loadingOrders ? (
                  <p className="text-center py-8 text-neutral-500">Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold">No orders found yet</p>
                    <p className="text-sm text-neutral-500">Explore our delicious menu and place your first order!</p>
                    <Button onClick={() => router.push("/explore")} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                      Explore Food
                    </Button>
                  </div>
                ) : (
                  orders.map((order, idx) => (
                    <div
                      key={order.id || idx}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-md transition space-y-4 bg-white/50 dark:bg-neutral-900/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                        <div>
                          <p className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                            {order.restaurantName || "Gourmet Galaxy Special"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Order ID: #{order.id?.slice(-8) || `GG-${idx + 101}`} • {order.orderDate || "Recently"}
                          </p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {order.status || "DELIVERED"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {order.items?.map((it, i) => (
                          <div key={i} className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-semibold">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <p className="font-bold text-lg text-orange-600">Total: ₹{order.totalAmount}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/track-order?id=${order.id}`)}
                            className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs"
                          >
                            Track Status
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast.success("Items added back to cart!");
                              router.push("/cart");
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                          >
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: GALAXY PAY WALLET */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <Card className="glassmorphism bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <Wallet className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold tracking-wider uppercase text-orange-100">Galaxy Pay Wallet</span>
                    <Sparkles className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-100">Available Balance</p>
                    <p className="text-4xl font-extrabold tracking-tight">₹{walletBalance}.00</p>
                  </div>
                  <Button
                    onClick={() => setShowAddMoney(true)}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl shadow-md gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Money
                  </Button>
                </div>
              </Card>

              {/* Add Money Modal */}
              {showAddMoney && (
                <Card className="glassmorphism p-6 border-orange-200">
                  <form onSubmit={handleAddMoney} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-semibold">Enter Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="rounded-xl border-orange-300"
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                      Add to Wallet
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAddMoney(false)}>
                      Cancel
                    </Button>
                  </form>
                </Card>
              )}

              <Card className="glassmorphism border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    Saved Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl font-bold text-xs">UPI</div>
                      <div>
                        <p className="font-semibold text-sm">Google Pay / PhonePe UPI</p>
                        <p className="text-xs text-neutral-500">ayonpaul@okaxis</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Linked</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl font-bold text-xs">CARD</div>
                      <div>
                        <p className="font-semibold text-sm">HDFC Bank Debit Card</p>
                        <p className="text-xs text-neutral-500">•••• •••• •••• 4821</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-500">Saved</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <Card className="glassmorphism border-neutral-200 dark:border-neutral-800 shadow-lg">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                  <Settings className="w-6 h-6 text-orange-500" />
                  Account & Notification Settings
                </CardTitle>
                <CardDescription>Manage your communication preferences and app security.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" /> Notification Toggles
                  </h3>

                  {[
                    { title: "Order Status Updates", desc: "Receive live SMS & Push updates for your active orders", state: orderAlerts, setState: setOrderAlerts },
                    { title: "Exclusive Offers & Discounts", desc: "Get notified about weekend discounts and deals", state: promoAlerts, setState: setPromoAlerts },
                    { title: "WhatsApp Notifications", desc: "Receive order receipts directly on WhatsApp", state: whatsappAlerts, setState: setWhatsappAlerts },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                      <div>
                        <p className="font-semibold text-sm">{setting.title}</p>
                        <p className="text-xs text-neutral-500">{setting.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setting.setState(!setting.state);
                          toast.success(`${setting.title} preference saved`);
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative p-0.5",
                          setting.state ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 bg-white rounded-full transition-transform shadow-md",
                            setting.state ? "translate-x-6" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-500" /> Security
                  </h3>
                  <div className="flex justify-between items-center p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <div>
                      <p className="font-semibold text-sm">Account Password</p>
                      <p className="text-xs text-neutral-500">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Password reset link sent to your email")} className="rounded-xl border-orange-200 text-orange-600">
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
