import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useLocation } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith("/app");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      {!isWorkspace && <Footer />}
    </div>
  );
}
