// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Users, Target, Rocket, Heart } from 'lucide-react';
const aboutusimage = "/Images/About.png";
import SEO from '../../components/common/SEO.tsx';

const values = [
  {
    title: "Customer First",
    description: "We build for the people who use our software every day.",
    icon: Heart
  },
  {
    title: "AI with Purpose",
    description: "Technology should empower, not replace, human intuition.",
    icon: Target
  },
  {
    title: "Radical Simplicity",
    description: "Complexity is the enemy of productivity. We simplify everything.",
    icon: Rocket
  }
];

export default function About() {
  return (
    <div className="pt-32 pb-24 px-6 relative overflow-hidden min-h-screen">
      <SEO 
        title="Our Story & Mission - The Team Behind the Innovation"
        description="Learn about Avinya AI CRM's mission to humanize CRM technology. Our team is dedicated to building the future of intelligent sales automation."
        keywords="About Avinya AI, AI CRM Mission, Future of Sales, CRM Innovation Team"
      />
      <div className="bg-mesh absolute inset-0 opacity-50 dark:opacity-100" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-bold mb-8 text-slate-900 dark:text-white"
          >
            We're building the <br />
            <span className="text-gradient">Future of Sales.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-700 dark:text-white/60 text-xl max-w-3xl mx-auto font-light leading-relaxed"
          >
            Avinya was founded on a simple premise: CRMs shouldn't be a chore. 
            We're a team of designers, engineers, and sales experts dedicated to 
            making CRM software that people actually love to use.
          </motion.p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Our Story</h2>
            <p className="text-slate-700 dark:text-white/60 text-lg font-light leading-relaxed">
              In 2026, we realized that while sales teams were moving faster than ever, 
              their tools were stuck in the past. We saw sales reps spending 60% of 
              their time on data entry instead of talking to customers.
            </p>
            <p className="text-slate-700 dark:text-white/60 text-lg font-light leading-relaxed">
              We decided to build something different. A CRM that uses AI to handle 
              the grunt work, voice commands for speed, and a design language that 
              feels like a premium consumer app.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-[3rem] overflow-hidden glass dark:bg-white/5 border-black/5 dark:border-white/10"
          >
            <img 
              src={aboutusimage}
              alt="Our Team"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-32">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass dark:bg-white/5 p-10 rounded-[2.5rem] border-black/5 dark:border-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{value.title}</h3>
                <p className="text-slate-700 dark:text-white/50 font-light leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
