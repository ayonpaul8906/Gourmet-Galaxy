"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ScrollText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/orders', icon: ScrollText, label: 'Orders' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navItems.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group"
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-1 text-muted-foreground group-hover:text-foreground transition-all',
                  isActive && 'primary-gradient text-transparent bg-clip-text'
                )}
              />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
