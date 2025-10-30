"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Home, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const addressSchema = z.object({
  name: z.string().min(3, "Please enter full name."),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number."),
  street: z.string().min(5, "Please enter a valid street address."),
  city: z.string().min(2, "Please enter a valid city."),
  postalCode: z.string().min(5, "Please enter a valid postal code."),
});

export default function CheckoutPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState("address");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [cartCleared, setCartCleared] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    setIsClient(true);
    const id = localStorage.getItem("userId");
    if (id) setUserId(id);
  }, []);

  if (!isClient) return <div className="text-center mt-10">Loading Checkout...</div>;

  const onAddressSubmit = (values: any) => {
    console.log("Saved Address:", values);
    toast({ title: "Address Saved!", description: "Proceed to payment." });
    setStep("payment");
  };

  const onPlaceOrder = async () => {
    try {
      if (!userId) {
        toast({ title: "Error", description: "User not found." });
        return;
      }

      const res = await fetch(`http://localhost:8080/api/order/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        await fetch(`http://localhost:8080/api/cart/${userId}/clear`, {
          method: "DELETE",
        });
        setCartCleared(true);
        setShowReview(true);
        toast({ title: "Order Placed!", description: "Your order will arrive soon." });
      } else {
        toast({ title: "Error", description: "Failed to place order." });
      }
    } catch (err) {
      console.error("Order error:", err);
      toast({ title: "Error", description: "Something went wrong." });
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await fetch("http://localhost:8080/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, reviewText }),
      });
      toast({ title: "Thank you!", description: "Your review has been submitted." });
      setShowReview(false);
    } catch (err) {
      console.error("Review error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="text-center mb-10">
        <h1 className="font-headline text-5xl primary-gradient gradient-text">
          Checkout
        </h1>
        <p className="mt-2 text-gray-500">
          Final step before your delicious meal arrives 🍽️
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "address" && (
          <motion.div
            key="address"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onAddressSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Galaxy Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Kolkata" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="700001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full primary-gradient font-semibold text-white hover:scale-105 transition"
                >
                  Save & Continue
                </Button>
              </form>
            </Form>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Select Payment Method</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 border p-4 rounded-md cursor-pointer bg-gray-50 dark:bg-gray-800">
                <input type="radio" checked readOnly />
                <span className="font-medium">Cash on Delivery</span>
              </div>
            </div>

            <Button
              onClick={onPlaceOrder}
              className="w-full mt-6 primary-gradient font-semibold text-white hover:scale-105 transition"
            >
              <Rocket className="mr-2 h-5 w-5" /> Place Order
            </Button>
          </motion.div>
        )}

        {cartCleared && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center mt-10"
          >
            <p className="text-green-600 text-lg mb-4">
              ✅ Order placed successfully!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="primary-gradient text-white font-semibold"
            >
              <Home className="mr-2 h-5 w-5" /> Back to Home
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⭐ Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Rate Your Experience</h3>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-center mb-4 space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 cursor-pointer ${
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <textarea
                placeholder="Write your review (optional)"
                className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-800 mb-4"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>

              <Button
                onClick={handleReviewSubmit}
                className="w-full primary-gradient text-white font-semibold"
              >
                Submit Review
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
