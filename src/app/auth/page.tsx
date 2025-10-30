"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isLogin
      ? "http://localhost:8080/api/auth/login"
      : "http://localhost:8080/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (isLogin) {
        // ✅ Backend returns { token, user: { id, name, email } }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);

        // ✅ Redirect after successful login
        router.push("/home");
      } else {
        // ✅ After signup, show message and switch to login
        alert("Signup successful! Please login to continue.");
        setIsLogin(true);
      }
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-40 to-orange-80 relative overflow-hidden">
      <Image
        src="/food-bg.jpg"
        alt="Food background"
        fill
        className="object-cover opacity-10"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-md z-10"
      >
        <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">
          {isLogin ? "Welcome Back 🍔" : "Join Foodify 🍕"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 border border-black/50 text-black rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-3 border border-black/50 text-black rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border border-black/50 text-black rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-md transition"
          >
            {isLogin ? "Login" : "Signup"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-orange-500 font-semibold hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
