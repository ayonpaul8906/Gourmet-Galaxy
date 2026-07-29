"use client";

import Link from "next/link";
import { Flame, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartItems, getLocalCart } from "@/lib/cartApi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/orders", label: "Orders" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const local = getLocalCart();
      const total = local.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );
      setCartCount(total);
    };

    updateCount();
    window.addEventListener("cart_updated", updateCount);
    window.addEventListener("focus", updateCount);

    // Also fetch remote as fallback
    getCartItems().then((data) => {
      if (data?.items && Array.isArray(data.items)) {
        const total = data.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );
        setCartCount(total);
      }
    });

    return () => {
      window.removeEventListener("cart_updated", updateCount);
      window.removeEventListener("focus", updateCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="rounded-xl transition-all">
              <img src="/logo.png" alt="Gourmet Galaxy" className="h-15 w-15 text-orange-500" />
            </div>
            <span className="font-bold text-2xl font-headline primary-gradient text-transparent bg-clip-text">
              Gourmet Galaxy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-all duration-200 py-1 border-b-2",
                    isActive
                      ? "text-orange-600 border-orange-500 font-semibold"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <Link href="/" className="flex items-center space-x-2 mb-8 mt-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-xl font-headline">Gourmet Galaxy</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-lg px-3 py-2 rounded-xl transition-all",
                        isActive
                          ? "bg-orange-500/10 text-orange-600 font-semibold"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:cursor-pointer hover:bg-orange-500/10 hover:text-orange-600 rounded-full"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:cursor-pointer hover:bg-orange-500/10 hover:text-orange-600 rounded-full",
                pathname === "/profile" && "bg-orange-500/10 text-orange-600"
              )}
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/landing");
            }}
            variant="outline"
            className="hover:cursor-pointer text-xs font-semibold rounded-xl border-orange-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
