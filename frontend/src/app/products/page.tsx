import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { Product, Category } from "@/types";

interface Props {
  searchParams: { q?: string; category?: string; condition?: string; featured?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const supabase = createClient();

  // Build query
  let query = supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }
  if (searchParams.condition) {
    query = query.eq("condition", searchParams.condition);
  }
  if (searchParams.featured === "true") {
    query = query.eq("is_featured", true);
  }
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data: products } = await query;
  const { data: categories } = await supabase.from("categories").select("*");

  const title = searchParams.q
    ? `Search: "${searchParams.q}"`
    : searchParams.category
    ? (categories as Category[])?.find((c) => c.slug === searchParams.category)?.name ?? "Products"
    : searchParams.condition
    ? `${searchParams.condition.replace("-", " ")} electronics`.replace(/^\w/, (c) => c.toUpperCase())
    : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ background: "rgba(255,255,255,0.93)", borderRadius: 16, marginTop: 16, marginBottom: 16 }}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="md:w-56 flex-shrink-0">
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: 16, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
            <ProductFilters categories={categories as Category[]} current={searchParams} />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brand">{title}</h1>
            <p className="text-sm text-muted">{(products as Product[])?.length ?? 0} products</p>
          </div>

          {(products as Product[])?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-semibold text-brand text-lg">No products found</p>
              <p className="text-muted text-sm mt-1">Try different filters or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {(products as Product[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
