"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

export function CategoryRow({ categories }: { categories: Category[] }) {
  const items = categories.length > 0
    ? categories.map((c) => ({ icon: c.icon, name: c.name, href: `/products?category=${c.slug}` }))
    : [
        { icon: "💻", name: "Laptops", href: "/products?category=laptops" },
        { icon: "📱", name: "Smartphones", href: "/products?category=smartphones" },
        { icon: "📟", name: "Tablets", href: "/products?category=tablets" },
        { icon: "🎮", name: "Gaming", href: "/products?category=gaming" },
        { icon: "🎧", name: "Audio", href: "/products?category=audio" },
        { icon: "📺", name: "TVs", href: "/products?category=tvs" },
        { icon: "🖨️", name: "Accessories", href: "/products?category=accessories" },
        { icon: "🌐", name: "Networking", href: "/products?category=networking" },
      ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((cat) => (
        <Link
          key={cat.name}
          href={cat.href}
          className="category-card"
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            background: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: 12,
            padding: "16px 20px",
            minWidth: 100,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "#006BFF";
            el.style.transform = "translateY(-3px)";
            el.style.boxShadow = "0 8px 20px rgba(0,107,255,0.12)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "#E2E8F0";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "1.75rem" }}>{cat.icon}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111827", fontFamily: "'Space Grotesk',sans-serif", whiteSpace: "nowrap" }}>
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function ConditionBanners() {
  const banners = [
    { label: "New Electronics", sub: "Brand new, sealed box", cond: "new", bg: "#006BFF" },
    { label: "Certified Refurbished", sub: "Tested & restored by Muratis", cond: "refurbished", bg: "#16A34A" },
    { label: "Second Hand", sub: "Used, honest prices", cond: "second-hand", bg: "#EA580C" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {banners.map((b) => (
        <Link
          key={b.cond}
          href={`/products?condition=${b.cond}`}
          style={{
            background: b.bg,
            borderRadius: 12,
            padding: "24px 28px",
            display: "block",
            textDecoration: "none",
            transition: "opacity 0.2s, transform 0.2s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.opacity = "0.92";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }}
        >
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#FFFFFF" }}>{b.label}</p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", marginTop: 4, fontFamily: "'Inter',sans-serif" }}>{b.sub}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 14, color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>
            Browse <ArrowRight size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AIButton() {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 100 }}>
      <button
        style={{
          background: "#006BFF",
          borderRadius: "50%",
          width: 60,
          height: 60,
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(0,107,255,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "scale(1.08)";
          el.style.boxShadow = "0 6px 32px rgba(0,107,255,0.6)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "scale(1)";
          el.style.boxShadow = "0 4px 24px rgba(0,107,255,0.45)";
        }}
        title="Muratis AI Assistant"
      >
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>◉</span>
        <span style={{ color: "#FFFFFF", fontSize: "0.45rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, letterSpacing: "0.05em", marginTop: 2 }}>AI</span>
      </button>
    </div>
  );
}