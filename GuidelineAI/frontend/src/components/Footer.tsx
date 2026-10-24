import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Ask Guideline", to: "/app" },
  { label: "Guideline", to: "/guideline" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Analytics", to: "/analytics" },
  { label: "Team", to: "/team" },
];

export function Footer() {
  return (
    <footer className="border-t border-mist-800 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              "Clinical Answers, Grounded in Evidence."
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Navigate</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Technical</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/status" className="text-sm text-slate-400 hover:text-white transition-colors">
                  System Status
                </Link>
              </li>
              <li>
                <Link to="/evaluation" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Evaluation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-mist-800 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
            GuidelineAI provides evidence retrieval and support from indexed clinical guidelines. It is not a
            substitute for professional clinical judgment.
          </p>
          <p className="mt-3 text-xs text-slate-600">© {new Date().getFullYear()} GuidelineAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
