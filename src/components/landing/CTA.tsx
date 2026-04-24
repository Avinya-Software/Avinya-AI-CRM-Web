import { motion } from "framer-motion";
import { Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass dark:bg-black/40 p-12 md:p-20 rounded-[40px] border-black/5 dark:border-white/10 text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass dark:bg-white/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            The future of sales is here
          </div>

          <h2 className="text-4xl md:text-7xl font-display font-bold leading-tight text-slate-900 dark:text-white">
            Ready to <span className="text-gradient">Scale?</span>
          </h2>

          <p className="text-slate-700 dark:text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Supercharge your sales team with powerful tools built for success. Unlock the future of smarter sales management, starting right now.
          </p>

        </motion.div>
      </div>
    </section>
  );
}