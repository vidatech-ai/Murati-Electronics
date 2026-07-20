import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryRow, ConditionBanners, AIButton } from "@/components/ui/HomeClientSections";
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, CheckCircle2, Star } from "lucide-react";
import type { Product, Category } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data as Product[]) ?? [];
}

async function getLatestProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12);
  return (data as Product[]) ?? [];
}

async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*");
  return (data as Category[]) ?? [];
}

const TRUST_ITEMS = [
  { icon: Shield, title: "Verified Products", desc: "Every item inspected before listing" },
  { icon: Truck, title: "Nationwide Delivery", desc: "We deliver across Kenya" },
  { icon: RefreshCw, title: "Easy Returns", desc: "Not happy? We'll sort it out" },
  { icon: Headphones, title: "Local Support", desc: "Real humans, available daily" },
];

const REFURBISHED_CHECKS = [
  "Hardware fully tested",
  "Battery health verified",
  "Clean OS installation",
  "6-month warranty included",
];

const REVIEWS = [
  { name: "Brian O.", stars: 5, text: "Laptop arrived in perfect condition, exactly as described. Fast delivery to Nairobi.", role: "Verified Buyer" },
  { name: "Faith K.", stars: 5, text: "Bought a refurbished phone — it looks brand new. Muratis is legit.", role: "Verified Buyer" },
  { name: "James M.", stars: 5, text: "Great prices, paid via M-Pesa, got my tablet next day. Very impressed.", role: "Verified Buyer" },
];

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getCategories(),
  ]);

  return (
    <div style={{ background: "transparent" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, #081A2B 0%, #0A2540 60%, #0D2E52 100%)",
        minHeight: 420,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23006BFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(0,107,255,0.15)", border: "1px solid rgba(0,107,255,0.3)",
                borderRadius: 20, padding: "5px 12px", marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#006BFF", display: "inline-block" }} />
                <span style={{ color: "#006BFF", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>
                  KENYA'S TRUSTED ELECTRONICS MARKETPLACE
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: "#FFFFFF",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}>
                Technology<br />
                <span style={{ color: "#006BFF" }}>You Can Trust.</span>
              </h1>

              <p style={{
                color: "#94A3B8", fontSize: "0.95rem",
                fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
                marginBottom: 20, maxWidth: 440,
              }}>
                Premium laptops, smartphones and electronics.<br />
                New. Refurbished. Professionally tested.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/products" className="btn-primary" style={{ fontSize: "0.9rem" }}>
                  Shop Electronics <ArrowRight size={15} />
                </Link>
                <Link href="/products?condition=second-hand" className="btn-outline" style={{ fontSize: "0.9rem" }}>
                  Second Hand Deals
                </Link>
              </div>

              <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                {[
                  { num: "500+", label: "Products" },
                  { num: "M-Pesa", label: "Accepted" },
                  { num: "Next Day", label: "Delivery" },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#FFFFFF" }}>{s.num}</div>
                    <div style={{ color: "#64748B", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative" style={{ height: 340 }}>
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 280, height: 230, borderRadius: 16,
                overflow: "hidden", border: "2px solid rgba(0,107,255,0.3)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}>
                <Image
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
                  alt="Premium laptop"
                  fill
                  priority
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="280px"
                />
              </div>
              <div style={{
                position: "absolute", bottom: 0, left: 40,
                width: 200, height: 180, borderRadius: 16,
                overflow: "hidden", border: "2px solid rgba(0,107,255,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}>
                <Image
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"
                  alt="Smartphone"
                  fill
                  priority
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="200px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER SECTION ── */}
      <section style={{ background: "rgba(255,255,255,0.95)", padding: "28px 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{
              width: 110, height: 110, borderRadius: "50%",
              overflow: "hidden", flexShrink: 0,
              border: "4px solid #006BFF",
              boxShadow: "0 8px 32px rgba(0,107,255,0.25)",
            }}>
              <img src="/founder.png" alt="Founder" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ color: "#64748B", fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 500 }}>
                Welcome to Muratis Electronics — Kenya's trusted marketplace for new, refurbished and second-hand electronics.
                I personally verify every device before it reaches you. Quality and trust is our promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: "rgba(255,255,255,0.88)", padding: "24px 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title">Explore Categories</h2>
            <Link href="/products" style={{ color: "#006BFF", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
              All products <ArrowRight size={14} />
            </Link>
          </div>
          <CategoryRow categories={categories} />
        </div>
      </section>

      {/* ── CONDITION BANNERS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ConditionBanners />
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title">Featured Electronics</h2>
            <Link href="/products?featured=true" style={{ color: "#006BFF", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── REFURBISHED TRUST ── */}
      <section style={{ background: "#081A2B", padding: "36px 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span style={{ color: "#006BFF", fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.1em" }}>
                OUR PROMISE
              </span>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", color: "#FFFFFF", marginTop: 8, marginBottom: 12, lineHeight: 1.15 }}>
                Muratis Certified<br />Refurbished
              </h2>
              <p style={{ color: "#94A3B8", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: 20 }}>
                Every refurbished device is tested, verified and prepared before delivery. You get a device that works like new — at a fraction of the price.
              </p>
              <Link href="/products?condition=refurbished" className="btn-primary">
                View Refurbished Devices <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {REFURBISHED_CHECKS.map((check) => (
                <div key={check} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,107,255,0.2)",
                  borderRadius: 12, padding: "16px",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <CheckCircle2 size={18} color="#006BFF" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "#E2E8F0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST PRODUCTS ── */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title">Latest Arrivals</h2>
            <Link href="/products" style={{ color: "#006BFF", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── CUSTOMER REVIEWS ── */}
      <section style={{ background: "rgba(255,255,255,0.88)", padding: "36px 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 className="section-title">What Our Customers Say</h2>
            <p style={{ color: "#64748B", fontFamily: "'Inter',sans-serif", marginTop: 6, fontSize: "0.875rem" }}>Real buyers, real experiences</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} style={{
                background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                borderRadius: 12, padding: "20px 18px",
              }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ color: "#374151", fontFamily: "'Inter',sans-serif", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 12 }}>
                  "{r.text}"
                </p>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{r.name}</p>
                  <p style={{ color: "#64748B", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ background: "#081A2B", padding: "32px 0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ background: "rgba(0,107,255,0.15)", borderRadius: 10, padding: 8, flexShrink: 0 }}>
                  <Icon size={18} color="#006BFF" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#FFFFFF" }}>{title}</p>
                  <p style={{ color: "#64748B", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT BADGES ── */}
      <section style={{ background: "rgba(241,245,249,0.85)", padding: "16px 0", borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-4">
          {["✅ M-Pesa Accepted", "🚚 Cash on Delivery", "🔒 Secure Checkout", "📦 Verified Products"].map((badge) => (
            <span key={badge} style={{ color: "#64748B", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{badge}</span>
          ))}
        </div>
      </section>

      <AIButton />
    </div>
  );
}