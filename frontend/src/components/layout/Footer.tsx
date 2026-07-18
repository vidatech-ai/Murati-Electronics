import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
              Muratis<span className="text-accent">.</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Kenya's trusted electronics marketplace. New, refurbished & second-hand devices at honest prices.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-3 text-accent">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/products?condition=new" className="hover:text-accent transition-colors">New Electronics</Link></li>
              <li><Link href="/products?condition=refurbished" className="hover:text-accent transition-colors">Refurbished</Link></li>
              <li><Link href="/products?condition=second-hand" className="hover:text-accent transition-colors">Second Hand</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-accent transition-colors">Featured Deals</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3 text-accent">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/products?category=laptops" className="hover:text-accent transition-colors">Laptops</Link></li>
              <li><Link href="/products?category=smartphones" className="hover:text-accent transition-colors">Smartphones</Link></li>
              <li><Link href="/products?category=tvs" className="hover:text-accent transition-colors">TVs</Link></li>
              <li><Link href="/products?category=tablets" className="hover:text-accent transition-colors">Tablets</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><MapPin size={14} /> Kakamega, Kenya</li>
              <li className="flex items-center gap-2"><Phone size={14} />
                <a href="tel:+254113259315" className="hover:text-accent transition-colors">+254 113 259 315</a>
              </li>
              <li className="flex items-center gap-2"><Mail size={14} />
                <a href="mailto:muratielectronics@gmail.com" className="hover:text-accent transition-colors">muratielectronics@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-light mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Muratis Electronics. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">✅ M-Pesa Accepted</span>
            <span className="flex items-center gap-1">🚚 Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
