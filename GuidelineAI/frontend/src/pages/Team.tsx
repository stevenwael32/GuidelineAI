import { TeamCard } from "@/components/TeamCard";
import { TEAM } from "@/lib/team";
import { motion } from "framer-motion";

export default function Team() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-mist-700 bg-ink-900/60 px-3 py-1 text-xs font-medium text-accent-cyan">
            The Team
          </span>
          <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">Meet the Team</h1>
          <p className="mt-4 text-slate-400">Building an evidence-first approach to clinical AI.</p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3">
          {TEAM.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
