import { Card } from "@/components/ui/Card";
import type { TeamMember } from "@/lib/team";
import { motion } from "framer-motion";

const GRADIENTS = [
  "from-accent-cyan to-accent-blue",
  "from-accent-teal to-accent-cyan",
  "from-accent-blue to-accent-violet",
  "from-accent-violet to-accent-cyan",
  "from-accent-teal to-accent-blue",
];

export function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Card className="group relative overflow-hidden p-6 text-center transition-transform duration-300 hover:-translate-y-1.5 hover:border-mist-600">
        <div
          className={`pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35`}
        />
        <div
          className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-ink-950 shadow-glow`}
        >
          {member.initials}
        </div>
        <p className="relative mt-4 text-sm font-semibold text-white">{member.name}</p>
      </Card>
    </motion.div>
  );
}
