"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email! });
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/products?q=${encodeURIComponent(search.trim())}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-brand shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {/* LOGO PLACEMENT: Replace the div below with your logo image */}
            {/* <Image src="/logo.png" alt="Muratis Electronics" width={140} height={40} priority /> */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-sm">ME</div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                Muratis<span className="text-accent">.</span>
              </span>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search laptops, phones, TVs..."
                className="w-full pl-4 pr-10 py-2 rounded-lg text-sm text-brand bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-brand">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-white hover:text-accent transition-colors">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/orders" className="text-white hover:text-accent transition-colors">
                <User size={22} />
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden sm:block btn-primary py-1.5 px-4 text-sm">
                Sign In
              </Link>
            )}

            <button
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search electronics..."
              className="w-full pl-4 pr-10 py-2 rounded-lg text-sm text-brand bg-white focus:outline-none"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile nav menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-light border-t border-brand-dark">
          <nav className="flex flex-col px-4 py-3 gap-3 text-white text-sm font-medium">
            <Link href="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
            <Link href="/products?category=laptops" onClick={() => setMenuOpen(false)}>Laptops</Link>
            <Link href="/products?category=smartphones" onClick={() => setMenuOpen(false)}>Smartphones</Link>
            <Link href="/products?condition=second-hand" onClick={() => setMenuOpen(false)}>Second Hand</Link>
            <Link href="/products?condition=refurbished" onClick={() => setMenuOpen(false)}>Refurbished</Link>
            {!user && <Link href="/auth/login" className="btn-primary text-center py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>}
            {user && <Link href="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
