import "../globals.css";
import Navbar from "./homePageComponents/Navbar";
import Footer from "./homePageComponents/Footer";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import AmbulanceButton  from "../context/AmbulanceButton";
import Cart from "./otherscreens/carts/Cart";

// This sets the name of your website in the browser tab
export const metadata = {
  title: "Diabetes Wala",
  description: "India's leading diabetes care and reversal platform",
};

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white relative selection:bg-rose-500 selection:text-white">
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Cart />

            {/* Conditional Floating Ambulance Button */}
            <AmbulanceButton />

            {/* Main content with flex-grow ensures footer stays at the bottom */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </div>
  );
}