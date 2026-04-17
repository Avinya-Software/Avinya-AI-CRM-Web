// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from 'lucide-react';

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
            Join 5,000+ high-growth teams
          </div>
          
          <h2 className="text-4xl md:text-7xl font-display font-bold leading-tight text-slate-900 dark:text-white">
            Ready to <span className="text-gradient">Scale?</span>
          </h2>
          
          <p className="text-slate-700 dark:text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Start your 14-day free trial today. No credit card required. 
            Experience the future of sales management.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={() => {
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 rounded-full bg-emerald-500 text-black font-bold text-xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-2xl shadow-emerald-500/20"
            >
              Get Started
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="px-10 py-5 rounded-full glass dark:bg-white/5 text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all font-semibold text-lg">
              Talk to Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
