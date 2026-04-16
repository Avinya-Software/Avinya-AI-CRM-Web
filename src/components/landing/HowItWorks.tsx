// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Plus, Cpu, TrendingUp } from 'lucide-react';

const steps = [
  {
    title: "Connect & Input",
    description: "Import your existing leads or use voice commands to add new ones on the go.",
    icon: Plus,
    color: "emerald"
  },
  {
    title: "AI Processing",
    description: "Avinya analyzes, categorizes, and prioritizes your data automatically.",
    icon: Cpu,
    color: "violet"
  },
  {
    title: "Scale & Convert",
    description: "Follow AI-driven insights to close deals faster and grow your business.",
    icon: TrendingUp,
    color: "cyan"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-slate-900 dark:text-white">How It <span className="text-gradient">Works</span></h2>
          <p className="text-slate-700 dark:text-white/50 text-lg max-w-2xl mx-auto font-light">
            Three simple steps to transform your sales workflow from manual to magical.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-20 h-20 rounded-3xl glass dark:bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative border-black/5 dark:border-white/10`}>
                  <div className={`absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <step.icon className={`w-10 h-10 text-emerald-600 dark:text-emerald-400 relative z-10`} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 dark:bg-white border border-black/5 dark:border-white/10 flex items-center justify-center text-xs font-bold text-white dark:text-black">
                    0{i + 1}
                  </div>
                </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{step.title}</h2>
          <p className="text-slate-700 dark:text-white/50 font-light leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
