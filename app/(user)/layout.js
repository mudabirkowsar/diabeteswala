import "../globals.css";
import Link from "next/link";
import { Siren, ArrowRight, Activity, ShieldAlert } from "lucide-react";
import Navbar from "./homePageComponents/Navbar";
import Footer from "./homePageComponents/Footer";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Cart from "./otherscreens/carts/Cart";

// This sets the name of your website in the browser tab
export const metadata = {
  title: "Diabetes Wala",
  description: "India's leading diabetes care and reversal platform",
};

export default function RootLayout({ children }) {
  return (
    // <html lang="en">
    <div className="min-h-screen flex flex-col bg-white relative selection:bg-rose-500 selection:text-white">

      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Cart />

            {/* ================= ULTRA-ATTRACTIVE FLOATING AMBULANCE BUTTON ================= */}
            <div className="fixed bottom-6 left-4 sm:left-6 z-50 group select-none">

              {/* Outer Radiant Glow Rings */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse pointer-events-none" />

              <Link
                href="/ambulance"
                className="relative flex items-center gap-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white pl-3.5 pr-4 py-2.5 sm:py-3 rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.6)] border border-white/25 backdrop-blur-md transition-all duration-300 transform group-hover:scale-105 group-hover:-translate-y-1 active:scale-95 overflow-hidden"
                aria-label="Book Emergency Ambulance Service"
              >
                {/* Shimmer Light Reflection Effect on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Pulsing Emergency Siren Icon Circle */}
                <div className="relative w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white group-hover:text-rose-600 transition-colors duration-300">
                  {/* Radar ping ring */}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 pointer-events-none"></span>
                  <Siren className="w-5 h-5 text-white group-hover:text-rose-600 animate-bounce duration-700 transition-colors" />
                </div>

                {/* Text Content with Dual-Tier Hierarchy */}
                <div className="flex flex-col text-left pr-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-100/90 font-mono">
                      24/7 Rapid SOS
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black tracking-wide text-white drop-shadow-sm uppercase">
                    Book Ambulance
                  </span>
                </div>

                {/* Interactive Micro Arrow */}
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>

            {/* Main content with flex-grow ensures footer stays at the bottom */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </div>
    // </html>
  );
}