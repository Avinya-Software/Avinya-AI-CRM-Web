import { Outlet } from "react-router-dom";
import Navbar from "../../components/landing/Navbar.tsx";
import Footer from "../../components/landing/Footer.tsx";
import { ThemeProvider } from "../../context/ThemeContext";

export default function PublicLayout() {
  return (
   <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* 🔥 FIX HERE */}
        <main className="flex-1 pt-24">
          <Outlet />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}