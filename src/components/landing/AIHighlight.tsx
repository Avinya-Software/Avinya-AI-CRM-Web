// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Send, Bot, User, Mic, Sparkles } from 'lucide-react';

export default function AIHighlight() {
  return (
    <section className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3 h-3" />
              Intelligence at the core
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-display font-bold leading-tight text-slate-900 dark:text-white"
            >
              Your CRM, <br />
              <span className="text-gradient">Now with a Voice.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-700 dark:text-white/60 text-lg font-light leading-relaxed"
            >
              Avinya isn't just a database. It's an active participant in your business. 
              Create leads, schedule meetings, and generate quotations using natural 
              language or voice commands.
            </motion.p>
            
            <div className="space-y-4 pt-4">
              {[
                "Create a lead for John from Apple",
                "What's my revenue forecast for Q3?",
                "Schedule a follow-up with Sarah tomorrow at 10 AM"
              ].map((text, i) => (
                <motion.div 
                   key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-3 text-slate-600 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-default group"
                >
                  <div className="w-8 h-8 rounded-full glass dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20">
                    <Mic className="w-4 h-4" />
                  </div>
                  <span className="font-medium italic text-slate-700 dark:text-white/40">"{text}"</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative perspective-1000"
          >
            <div className="glass dark:bg-black/40 rounded-3xl border-black/5 dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Bot className="text-black w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Avinya AI Assistant</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] p-6 overflow-y-auto space-y-6 no-scrollbar">
                <ChatMessage 
                  type="user" 
                  text="Show me my hot leads for this week." 
                />
                <ChatMessage 
                  type="bot" 
                  text="I've found 4 hot leads that need immediate attention. Would you like me to draft follow-up emails for them?" 
                  data={[
                    { name: "Anant Light", status: "Active", priority: "High" },
                    { name: "Pratham Corp", status: "Active", priority: "High" }
                  ]}
                />
                <ChatMessage 
                  type="user" 
                  text="Yes, and schedule a meeting with Anant for tomorrow." 
                />
                <ChatMessage 
                  type="bot" 
                  text="Done! I've drafted the email and scheduled a meeting for tomorrow at 11:00 AM. I've also added a reminder to your dashboard." 
                />
              </div>
              
              <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
                <div className="glass dark:bg-white/5 dark:border-white/10 rounded-2xl flex items-center px-4 py-2 gap-3">
                  <Mic className="text-slate-400 dark:text-white/40 w-5 h-5 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400" />
                  <input 
                    type="text" 
                    placeholder="Ask Avinya anything..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm py-2 text-slate-900 dark:text-white"
                  />
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition-colors">
                    <Send className="text-black w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ChatMessage({ type, text, data }: { type: 'user' | 'bot', text: string, data?: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${type === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-emerald-500'}`}>
        {type === 'user' ? <User className="w-4 h-4 text-slate-700 dark:text-white" /> : <Bot className="w-4 h-4 text-black" />}
      </div>
      <div className={`max-w-[80%] space-y-3`}>
        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${type === 'user' ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-tr-none' : 'glass dark:bg-white/10 text-slate-900 dark:text-white rounded-tl-none'}`}>
          {text}
        </div>
        {data && (
          <div className="grid grid-cols-1 gap-2">
            {data.map((item, i) => (
              <div key={i} className="glass dark:bg-white/5 border-black/5 dark:border-white/10 p-3 rounded-xl flex items-center justify-between text-xs text-slate-900 dark:text-white">
                <span className="font-bold">{item.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">{item.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
