import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regional Infrastructure Fund – II in Khyber Pakhtunkhwa for RESILIENT RESOURCE MANAGEMENT IN CITIES (RRMIC)",
  description: "RIF-II Management Information System - Resilient Resource Management in Cities"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen" style={{ fontFamily: 'Calibri, "Segoe UI", Arial, Helvetica, sans-serif' }}>
        <main className="w-full max-w-none">{children}</main>
        <footer className="bg-[#0b4d2b]">
          <div className="mx-auto w-full max-w-none px-6 py-4 text-center text-white text-sm">
            <div className="flex justify-between items-center">
              <span>&copy; 2025 RIF-II, All rights reserved.</span>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Home
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/contact-us"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Contact Us
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/about-team"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  About Team
                </Link>
                <span className="text-gray-400">|</span>
                <Link
                  href="/about-consultancy-firm"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  About Consultancy Firm
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
