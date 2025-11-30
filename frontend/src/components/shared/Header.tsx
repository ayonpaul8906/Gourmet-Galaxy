import Link from "next/link";
import { Flame, ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/orders", label: "Orders" },
];

const NavLink = ({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) => (
  <Link
    href={href}
    className={cn(
      "text-muted-foreground hover:text-foreground transition-colors",
      className
    )}
  >
    {label}
  </Link>
);

export default function Header() {
   const router = useRouter();
   
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Flame className="h-6 w-6 primary-gradient text-transparent bg-clip-text" />
            <span className="hidden font-bold text-2xl sm:inline-block font-headline primary-gradient text-transparent bg-clip-text">
              Gourmet Galaxy
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                <Flame className="h-6 w-6 primary-gradient text-transparent bg-clip-text" />
                <span className="font-bold font-headline">Gourmet Galaxy</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} className="text-lg" />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <Button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/landing");
          }}
          variant="outline"
          className="hover:cursor-pointer"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
