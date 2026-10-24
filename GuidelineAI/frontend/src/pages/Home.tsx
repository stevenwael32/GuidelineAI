import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TeamCard } from "@/components/TeamCard";
import { TrustSection } from "@/components/TrustSection";
import { Button } from "@/components/ui/Button";
import { TEAM } from "@/lib/team";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <Hero />
      <TrustSection />
      <HowItWorks />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Meet the Team</h2>
          <p className="mt-4 text-slate-400">Building an evidence-first approach to clinical AI.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {TEAM.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/team">
            <Button variant="secondary">
              Meet the Team
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
