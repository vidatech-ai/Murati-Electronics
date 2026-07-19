import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Muratis Electronics — New, Refurbished & Second-Hand Electronics",
  icons: { icon: "/favicon.png", apple: "/favicon.png", shortcut: "/favicon.png" },
  description:
    "Kenya's trusted electronics marketplace. Shop laptops, smartphones, tablets, TVs, and more. New, refurbished, and second-hand electronics at great prices.",
  keywords: "electronics Kenya, laptops Kenya, smartphones Kenya, second hand electronics, refurbished electronics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "Inter, sans-serif", borderRadius: "8px" },
            success: { iconTheme: { primary: "#00C896", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
