// import { motion, AnimatePresence } from 'motion/react';
import { motion , AnimatePresence  } from "framer-motion";
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Layout, Users, FileText, CheckSquare } from 'lucide-react';
const dashboard2 = "/Images/Dashboard2.png";
const Lead2 = "/Images/Lead2.png";
const aichatbot2 = "/Images/ai-chatbot2.png";
const taskmanagement2 = "/Images/Taskmanagement2.png";


const screens = [
  {
    title: "Action Dashboard",
    description: "Your mission control. See hot leads, pending tasks, and revenue at a glance.",
    icon: Layout,
    image: dashboard2
  },
  {
    title: "Lead Management",
    description: "Track every interaction. Our AI scores leads based on engagement and intent.",
    icon: Users,
    image: Lead2
  },
  {
    title: "Ai Chatbot",
    description: "Handle customer queries in seconds. AI provides smart responses based on conversation history.",
    icon: FileText,
    image: aichatbot2
  },
  {
    title: "Task Board",
    description: "Stay organized with Kanban-style task management and automated scheduling.",
    icon: CheckSquare,
    image: taskmanagement2
  }
];

export default function Showcase() {
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev + 1) % screens.length);
  const prev = () => setActive((prev) => (prev - 1 + screens.length) % screens.length);

  return (
    <section className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-display font-bold mb-4 text-slate-900 dark:text-white"
            >
              Experience the <span className="text-gradient">Interface</span>
            </motion.h2>
            <p className="text-slate-600 dark:text-white/50 text-lg font-light">
              Designed for speed, clarity, and focus. No clutter, just what you need to close the next deal.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full glass dark:bg-white/5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full glass dark:bg-white/5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            {screens.map((screen, i) => (
              <motion.div
                key={i}
                onClick={() => setActive(i)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 border ${active === i ? 'glass dark:bg-white/5 border-emerald-500/30' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-none w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center ${active === i ? 'bg-emerald-500 text-black' : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-white/40'}`}>
                    <screen.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold transition-colors ${active === i ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40'}`}>
                      {screen.title}
                    </h3>
                    {active === i && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-slate-700 dark:text-white/50 mt-2 font-light leading-relaxed"
                      >
                        {screen.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden glass dark:bg-white/5 border-black/5 dark:border-white/10 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={screens[active].image} 
                    alt={screens[active].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
