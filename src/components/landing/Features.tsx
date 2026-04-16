// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { 
  Bot, 
  Users, 
  Clock, 
  Mic, 
  Layout, 
  ShieldCheck,
  Zap,
  BarChart3,
  FileText
} from 'lucide-react';

const features = [
  {
    title: "AI Chatbot Assistant",
    description: "Get instant answers about your CRM data. Ask for summaries, trends, or specific lead details.",
    icon: Bot,
    color: "emerald"
  },
  {
    title: "Smart Lead Management",
    description: "Capture, track, and convert leads with AI-driven scoring and automated follow-ups.",
    icon: Users,
    color: "cyan"
  },
  {
    title: "Task & Reminder Automation",
    description: "Never miss a deadline. AI schedules tasks and sends reminders based on priority.",
    icon: Clock,
    color: "violet"
  },
  {
    title: "Voice Command CRM",
    description: "Add leads, schedule meetings, and create tasks using just your voice. Hands-free productivity.",
    icon: Mic,
    color: "rose"
  },
  {
    title: "Project Tracking",
    description: "Full visibility into your project lifecycle. Track milestones, resources, and budgets.",
    icon: Layout,
    color: "amber"
  },
  {
    title: "Role-Based Access",
    description: "Secure your data with granular permissions. Manage teams with ease and confidence.",
    icon: ShieldCheck,
    color: "blue"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-display font-bold mb-6 text-slate-900 dark:text-white"
          >
            Built for the <span className="text-gradient">Next Era</span> of Sales
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-white/60 text-lg max-w-2xl mx-auto font-light"
          >
            Everything you need to manage your business, powered by the most 
            advanced AI models available today.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: any;
    color: string;
  };
  index: number;
  key?: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative p-8 rounded-3xl glass dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-500 border-black/5 dark:border-white/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
      
      <div className={feature.color === 'emerald' ? 'w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform' : 
                      feature.color === 'cyan' ? 'w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform' :
                      feature.color === 'violet' ? 'w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform' :
                      feature.color === 'rose' ? 'w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform' :
                      feature.color === 'amber' ? 'w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform' :
                      'w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform'}>
        <Icon className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 text-slate-900 dark:text-white transition-colors">{feature.title}</h3>
      <p className="text-slate-700 dark:text-white/50 font-light leading-relaxed">{feature.description}</p>
      
      <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-white/30 group-hover:text-slate-900 dark:group-hover:text-white/80 transition-colors">
        Learn more <Zap className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
