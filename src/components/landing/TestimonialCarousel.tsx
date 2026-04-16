// import { motion, AnimatePresence } from 'motion/react';
import { motion , AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Avinya transformed our sales process. The AI insights are scarily accurate.",
    author: "Sarah Chen",
    role: "VP of Sales, TechFlow",
    image: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    quote: "The interface is so clean, my team actually enjoys using the CRM now.",
    author: "Marcus Rodriguez",
    role: "CEO, GrowthScale",
    image: "https://picsum.photos/seed/marcus/100/100"
  },
  {
    quote: "Voice commands are a game changer for our field agents. Incredible tech.",
    author: "Elena Petrova",
    role: "Operations Director, GlobalLogistics",
    image: "https://picsum.photos/seed/elena/100/100"
  }
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                <Quote className="w-8 h-8" />
              </div>
              <p className="text-3xl md:text-4xl font-display font-medium leading-tight text-slate-900 dark:text-white italic">
                "{testimonials[index].quote}"
              </p>
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={testimonials[index].image} 
                  alt={testimonials[index].author}
                  className="w-16 h-16 rounded-full border-2 border-emerald-500/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{testimonials[index].author}</h4>
                  <p className="text-slate-600 dark:text-white/40 text-sm">{testimonials[index].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${index === i ? 'w-8 bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
