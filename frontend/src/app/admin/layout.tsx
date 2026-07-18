"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Plus } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Skip guard on the login page itself
    if (pathname === "/admin/login") { setReady(true); return; }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/admin/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();
      if (!profile?.is_admin) { router.push("/admin/login"); return; }
      setReady(true);
    });
  }, [pathname]);

  if (!ready) return (
    <div className="min-h-screen bg-brand flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // No sidebar on login
  if (pathname === "/admin/login") return <>{children}</>;

  const NAV = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/products/new", label: "Add Product", icon: Plus },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-56 bg-brand text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-brand-light">
          <p className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
            Muratis<span className="text-accent">.</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? "bg-accent text-white font-semibold"
                  : "text-gray-300 hover:bg-brand-light hover:text-white"
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-brand-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-brand-light hover:text-white w-full transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
