import { Logo } from "@/components/Logo";
import { SystemStatusPill } from "@/components/SystemStatusPill";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Ask Guideline", to: "/app" },
  { label: "Guideline", to: "/guideline" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Analytics", to: "/analytics" },
  { label: "Team", to: "/team" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-mist-800 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="GuidelineAI home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white hover:bg-mist-800",
                location.pathname === link.to && "text-white bg-mist-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SystemStatusPill />
          <Link to="/app">
            <Button size="sm">Ask Guideline</Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-mist-800 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] glass-panel border-l"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-mist-800">
                <Logo />
                <button
                  className="rounded-lg p-2 text-slate-300 hover:bg-mist-800"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-slate-200 hover:bg-mist-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 space-y-3">
                <SystemStatusPill className="w-full justify-center" />
                <Link to="/app" onClick={() => setOpen(false)}>
                  <Button className="w-full">Ask Guideline</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
