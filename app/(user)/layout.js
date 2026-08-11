import "../globals.css";
import Navbar from "./homePageComponents/Navbar";
import Footer from "./homePageComponents/Footer";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../context/AuthContext";

// This sets the name of your website in the browser tab
export const metadata = {
  title: "Diabetes Wala",
  description: "India's leading diabetes care and reversal platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">

        <NotificationProvider>
          <AuthProvider>
            <Navbar />

            {/* main tag with flex-grow ensures footer stays at the bottom */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}