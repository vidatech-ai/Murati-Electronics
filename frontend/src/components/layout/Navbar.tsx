"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Phones", href: "/products?category=smartphones" },
  { label: "Tablets", href: "/products?category=tablets" },
  { label: "Refurbished", href: "/products?condition=refurbished" },
  { label: "Deals", href: "/products?featured=true" },
];

export function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email! });
    });
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/products?q=${encodeURIComponent(search.trim())}`;
  };

  return (
    <header
      className="sticky top-0 z-50 transition-shadow duration-200"
      style={{
        background: "#081A2B",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.3)" : "none",
        height: "80px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0" style={{ minWidth: 110 }}>
          <Image
            src="/logo.png"
            alt="Muratis Electronics"
            width={140}
            height={50}
            priority
            style={{ objectFit: "contain", height: 50, width: "auto" }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150"
              style={{ color: "#CBD5E1", fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#006BFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#CBD5E1")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-2">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search laptops, phones, electronics..."
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                borderRadius: "8px",
                width: "100%",
                padding: "10px 40px 10px 16px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#006BFF")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#64748B" }}
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto lg:ml-0">
          <Link href="/wishlist" className="hidden sm:flex text-gray-400 hover:text-white transition-colors" title="Wishlist">
            <Heart size={20} />
          </Link>

          {user ? (
            <Link href="/orders" className="text-gray-400 hover:text-white transition-colors" title="My Orders">
              <User size={20} />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <User size={18} /> Sign In
            </Link>
          )}

          <Link href="/cart" className="relative flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#006BFF", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {count}
              </span>
            )}
          </Link>

          <button
            className="lg:hidden text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3" style={{ background: "#081A2B" }}>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search electronics..."
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                borderRadius: "8px",
                width: "100%",
                padding: "9px 36px 9px 14px",
                outline: "none",
              }}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }}>
              <Search size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#0A2540", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2.5 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 btn-primary text-center py-2.5 text-sm"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}