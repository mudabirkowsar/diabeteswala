import "../globals.css";
import Navbar from "./homePageComponents/Navbar";
import Footer from "./homePageComponents/Footer";
export default function RootLayout({
  children,
}) {
  return (
    <html
      lang="en">
      <body className="min-h-full flex flex-col">
        <>
        <Navbar/>
        {children}
        <Footer />
        </>
      </body>
    </html>
  );
}
