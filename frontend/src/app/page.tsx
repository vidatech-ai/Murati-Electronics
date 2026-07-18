import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, Shield, Truck, RefreshCw, Headphones } from "lucide-react";
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
  { icon: Truck, title: "Delivery in Kenya", desc: "We deliver across the country" },
  { icon: RefreshCw, title: "Easy Returns", desc: "Not happy? We'll sort it out" },
  { icon: Headphones, title: "Local Support", desc: "Real humans, available daily" },
];

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Kenya's Electronics Marketplace
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              New. Refurbished.<br />
              <span className="text-accent">Real Deals.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-lg">
              Browse laptops, phones, TVs and more — new, refurbished, and second-hand. Pay with M-Pesa or cash on delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link href="/products?condition=second-hand" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-brand inline-flex items-center gap-2">
                Second Hand Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-5 py-3 hover:border-accent hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-brand whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand">Featured Deals</h2>
            <Link href="/products?featured=true" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── CONDITION BANNERS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "New Electronics", sub: "Brand new, sealed box", cond: "new", color: "bg-accent" },
            { label: "Refurbished", sub: "Tested & restored", cond: "refurbished", color: "bg-blue-600" },
            { label: "Second Hand", sub: "Used, honest prices", cond: "second-hand", color: "bg-yellow-500" },
          ].map((b) => (
            <Link
              key={b.cond}
              href={`/products?condition=${b.cond}`}
              className={`${b.color} text-white rounded-xl p-6 hover:opacity-90 transition-opacity`}
            >
              <p className="font-bold text-lg">{b.label}</p>
              <p className="text-sm opacity-80 mt-1">{b.sub}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold">
                Browse <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST PRODUCTS ── */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand">Latest Arrivals</h2>
            <Link href="/products" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ── */}
      <section className="bg-brand mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 text-white">
                <div className="bg-accent/20 p-2 rounded-lg flex-shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
