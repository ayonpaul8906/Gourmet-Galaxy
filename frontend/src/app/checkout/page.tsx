"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Locate, CheckCircle2, Rocket, CreditCard, Home, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getCartItems, clearCart } from "@/lib/cartApi";
import { processRazorpayPayment } from "@/lib/razorpay";

// ---- Types ----
interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
}

// ---- GPS Reverse Geocode via Nominatim (free, no key) ----
async function reverseGeocode(lat: number, lon: number): Promise<{ street: string; city: string; postalCode: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const street = [addr.house_number, addr.road || addr.neighbourhood || addr.suburb].filter(Boolean).join(", ");
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const postalCode = addr.postcode || "";
    return { street: street || "Detected Location", city, postalCode };
  } catch {
    return { street: "GPS Location Detected", city: "", postalCode: "" };
  }
}

export default function CheckoutPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartCleared, setCartCleared] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // User profile from localStorage (set at login)
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Address form
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const id = localStorage.getItem("userId") || "";
    const name = localStorage.getItem("userName") || "";
    const phone = localStorage.getItem("userPhone") || "";
    setUserId(id);
    setUserName(name);
    setUserPhone(phone);

    // Load saved addresses from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("savedAddresses") || "[]");
      setSavedAddresses(saved);
      if (saved.length === 0) setShowNewAddressForm(true);
    } catch {
      setShowNewAddressForm(true);
    }

    const loadCart = async () => {
      try {
        const cartData = await getCartItems();
        setCartItems(cartData.items || []);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };
    loadCart();
  }, []);

  // Get GPS location
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not supported", description: "Your browser doesn't support location services." });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await reverseGeocode(latitude, longitude);
        setStreet(geo.street);
        setCity(geo.city);
        setPostalCode(geo.postalCode);
        setIsLocating(false);
        toast({ title: "📍 Location Detected!", description: "Address filled from your GPS location." });
      },
      (err) => {
        setIsLocating(false);
        toast({ title: "Location Access Denied", description: "Please allow location permission or enter address manually." });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [toast]);

  const handleSaveNewAddress = () => {
    if (!street.trim() || !city.trim()) {
      toast({ title: "Incomplete Address", description: "Please enter at least street and city." });
      return;
    }
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: city,
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    setSelectedAddressId(newAddr.id);
    setShowNewAddressForm(false);
    toast({ title: "Address Saved!", description: "Proceeding to payment." });
    setStep("payment");
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setCity(addr.city);
    setPostalCode(addr.postalCode);
  };

  const handleProceedToPayment = () => {
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!addr && !showNewAddressForm) {
      toast({ title: "Select an address", description: "Please select or add a delivery address." });
      return;
    }
    if (showNewAddressForm) {
      handleSaveNewAddress();
      return;
    }
    setStep("payment");
  };

  if (!isClient) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const deliveryFee = 15;
  const totalAmount = subtotal + deliveryFee;

  const fullAddress = `${street}, ${city}${postalCode ? " - " + postalCode : ""}`;

  const executeOrderCreation = async (paymentId?: string) => {
    if (!userId) { toast({ title: "Error", description: "Session expired. Please login again." }); return; }
    if (cartItems.length === 0) { toast({ title: "Error", description: "Your cart is empty." }); return; }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${API_BASE_URL}/api/order/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, address: fullAddress, totalAmount, items: cartItems, paymentMethod, paymentId: paymentId || `PAY-${Date.now()}` }),
    });
    const data = await res.json();
    if (res.ok && data.status === "success") {
      const orderId = data.orderId || `GG-${Date.now().toString().slice(-6)}`;
      localStorage.setItem("latestOrderId", orderId);
      await clearCart();
      setCartCleared(true);
      toast({ title: "🎉 Order Placed!", description: `Order #${orderId} is confirmed! Tracking in real-time...` });
      setTimeout(() => router.push(`/track-order?id=${orderId}`), 1200);
    } else {
      throw new Error(data?.message || "Failed to place order");
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === "razorpay") {
        await processRazorpayPayment({
          amount: totalAmount,
          name: userName,
          userPhone,
          description: "Gourmet Galaxy Food Order",
          onSuccess: async (paymentId: string) => {
            await executeOrderCreation(paymentId);
            setIsProcessing(false);
          },
          onFailure: (err: any) => {
            setIsProcessing(false);
            toast({ title: "Payment Cancelled", description: err?.message || "Transaction not completed." });
          },
        });
      } else {
        await executeOrderCreation();
        setIsProcessing(false);
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast({ title: "Order Error", description: err?.message || "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline font-extrabold text-4xl primary-gradient text-transparent bg-clip-text">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Secure checkout — your details are pre-filled from your profile
          </p>
        </div>

        {/* Profile Bar — auto-filled */}
        <div className="glassmorphism rounded-2xl p-4 mb-4 flex items-center gap-4 border border-orange-500/20">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-extrabold text-white text-lg shrink-0">
            {(userName || "G").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">{userName || "Guest User"}</p>
            <p className="text-xs text-neutral-500 truncate">{userPhone || "No phone on record"}</p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full shrink-0">Verified</span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ADDRESS */}
          {step === "address" && !cartCleared && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="glassmorphism rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
                <h2 className="font-bold text-base flex items-center gap-2 mb-4">
                  <Home className="w-4 h-4 text-orange-500" /> Select Delivery Address
                </h2>

                {/* Saved address cards */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          selectedAddressId === addr.id
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                          <div>
                            <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">{addr.label}</p>
                            <p className="text-xs text-neutral-500 truncate max-w-[220px]">{addr.street}, {addr.city} {addr.postalCode}</p>
                          </div>
                        </div>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                        )}
                      </div>
                    ))}

                    {/* Add new */}
                    {!showNewAddressForm && (
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full py-2.5 border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-500 rounded-2xl hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>
                )}

                {/* New address form */}
                {showNewAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">New Address</p>
                      {savedAddresses.length > 0 && (
                        <button onClick={() => setShowNewAddressForm(false)} className="text-neutral-400 hover:text-neutral-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* GPS Button */}
                    <button
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-60"
                    >
                      {isLocating ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting location...</>
                      ) : (
                        <><Locate className="w-3.5 h-3.5" /> Use My GPS Location</>
                      )}
                    </button>

                    <div className="flex items-center gap-2 text-neutral-400">
                      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                      <span className="text-[10px] font-bold uppercase">or enter manually</span>
                      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                    </div>

                    <Input
                      placeholder="Street / Flat / Area"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-xl text-sm"
                      />
                      <Input
                        placeholder="PIN Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="rounded-xl text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Cart summary */}
              <div className="glassmorphism rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Order Summary</p>
                {cartItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">{item.quantity}x {item.name}</span>
                    <span className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                {cartItems.length > 3 && <p className="text-xs text-neutral-400">+{cartItems.length - 3} more items</p>}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex justify-between">
                  <span className="text-xs text-neutral-500">Delivery</span>
                  <span className="text-xs font-bold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-extrabold">Total</span>
                  <span className="text-sm font-extrabold text-orange-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 gap-2"
              >
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === "payment" && !cartCleared && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="glassmorphism rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500" /> Payment Method
                  </h2>
                  <button onClick={() => setStep("address")} className="text-xs text-orange-500 font-bold hover:underline">
                    Change Address
                  </button>
                </div>

                {/* Delivery address summary */}
                <div className="bg-neutral-100 dark:bg-neutral-900/60 rounded-xl p-3 mb-4 flex gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{fullAddress}</p>
                </div>

                <div className="space-y-3">
                  {/* Razorpay */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "razorpay" ? "border-orange-500 bg-orange-500/10" : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-bold text-sm flex items-center gap-1.5">
                          Razorpay — UPI, Cards, NetBanking
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded-full">Secure</span>
                        </p>
                        <p className="text-xs text-neutral-500">Google Pay • PhonePe • Paytm • Cards</p>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-orange-500 w-4 h-4" />
                  </div>

                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "cod" ? "border-orange-500 bg-orange-500/10" : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-neutral-500">Pay cash at your doorstep</p>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-orange-500 w-4 h-4" />
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-semibold text-neutral-500">Total Payable</span>
                  <span className="text-xl font-extrabold text-orange-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Rocket className="w-4 h-4" /> {paymentMethod === "razorpay" ? "Pay with Razorpay" : "Place Order"}</>
                )}
              </Button>
            </motion.div>
          )}

          {/* SUCCESS */}
          {cartCleared && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 glassmorphism rounded-3xl p-8 space-y-4 border border-emerald-500/30"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-600 font-headline">Order Confirmed!</h2>
              <p className="text-sm text-neutral-500">Redirecting to live tracking...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
