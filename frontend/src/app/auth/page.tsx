"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Flame, Phone, KeyRound, User, ArrowLeft, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Step = "phone" | "otp" | "name";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // ---- Step 1: Send OTP ----
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setIsNewUser(data.isNewUser ?? false);
      setStep("otp");
      setResendTimer(60);
    } catch (e: any) {
      setError(e.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 2: Verify OTP ----
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      if (data.isNewUser) {
        // New user — need name
        setIsNewUser(true);
        setStep("name");
      } else {
        // Existing user — store session & redirect
        saveSession(data);
        router.push("/home");
      }
    } catch (e: any) {
      setError(e.message || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 3: Complete Signup (name) ----
  const handleCompleteSignup = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (min. 2 characters).");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/complete-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      saveSession(data);
      router.push("/home");
    } catch (e: any) {
      setError(e.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = (data: any) => {
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("userId", data.user?.id || "");
    localStorage.setItem("userName", data.user?.name || "");
    localStorage.setItem("userPhone", data.user?.phone || phone.replace(/\D/g, ""));
    localStorage.setItem("userEmail", data.user?.email || "");
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await handleSendOtp();
  };

  const stepLabels: Record<Step, string> = {
    phone: "Enter Mobile Number",
    otp: "Verify OTP",
    name: "Complete Profile",
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-2xl font-extrabold font-headline bg-gradient-to-r from-orange-500 to-amber-400 text-transparent bg-clip-text">
              Gourmet Galaxy
            </span>
          </Link>
          <p className="text-neutral-500 text-sm">
            {step === "phone" && "Sign in or create your account"}
            {step === "otp" && `OTP sent to +91 ${phone}`}
            {step === "name" && "One last step to get started!"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 justify-center">
            {(["phone", "otp", "name"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                  s === step ? "bg-orange-500 text-white" :
                  (["phone", "otp", "name"].indexOf(step) > i ? "bg-emerald-500 text-white" : "bg-neutral-800 text-neutral-600")
                }`}>
                  {["phone", "otp", "name"].indexOf(step) > i ? "✓" : i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-px ${["phone", "otp", "name"].indexOf(step) > i ? "bg-emerald-500" : "bg-neutral-800"}`} />}
              </div>
            ))}
          </div>

          <h2 className="text-center font-bold text-white">{stepLabels[step]}</h2>

          <AnimatePresence mode="wait">
            {/* STEP 1: Phone */}
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 bg-neutral-800/70 border border-neutral-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 transition-all">
                  <span className="text-xs font-extrabold text-neutral-500 shrink-0">🇮🇳 +91</span>
                  <div className="w-px h-5 bg-neutral-700" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    className="flex-1 bg-transparent text-white placeholder-neutral-600 text-sm font-medium outline-none"
                    autoFocus
                  />
                  <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : "Send OTP →"}
                </button>

                <p className="text-center text-xs text-neutral-600">
                  By continuing, you agree to our Terms & Privacy Policy
                </p>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-13 text-center text-xl font-extrabold bg-neutral-800 border-2 rounded-xl text-white outline-none transition-all focus:border-orange-500 ${
                        digit ? "border-orange-500 bg-orange-500/10" : "border-neutral-700"
                      }`}
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><KeyRound className="w-4 h-4" /> Verify OTP</>}
                </button>

                <div className="flex items-center justify-between">
                  <button onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }} className="text-xs text-neutral-500 hover:text-white flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Change Number
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-xs text-orange-500 disabled:text-neutral-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" /> {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Name (new users only) */}
            {step === "name" && (
              <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-400 font-medium">Mobile number verified! Set up your profile.</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-800/70 border border-neutral-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 transition-all">
                  <User className="w-4 h-4 text-neutral-500 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCompleteSignup()}
                    placeholder="Your full name"
                    className="flex-1 bg-transparent text-white placeholder-neutral-600 text-sm font-medium outline-none"
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button
                  onClick={handleCompleteSignup}
                  disabled={isLoading || name.trim().length < 2}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Complete & Start Ordering →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
