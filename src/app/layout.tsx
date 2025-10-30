"use client";

import { Inter, Poppins, Pacifico } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/shared/Header";
import BottomNav from "@/components/shared/BottomNav";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-poppins",
});
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() ?? "";

  const hideLayout =
    pathname.startsWith("/landing") || pathname.startsWith("/auth");

  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable,
          poppins.variable,
          pacifico.variable
        )}
      >
        {!hideLayout && <Header />}
        <main className={cn(!hideLayout && "pb-20 md:pb-0")}>{children}</main>
        {!hideLayout && <BottomNav />}
        {/* <Toaster /> */}
          <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}