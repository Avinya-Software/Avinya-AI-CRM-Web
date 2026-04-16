import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Calendar, Clock, User, Mail, Building, Send } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from "../../context/ThemeContext";


const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BookingForm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputClassName = `w-full rounded-xl px-4 py-3 outline-none transition-colors ${isDark ? "bg-slate-100 border border-black/10 text-slate-900 placeholder:text-slate-400 focus:bg-white" : "bg-white border border-black/10 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50"}`;
  const textareaClassName = `w-full rounded-xl px-4 py-3 outline-none transition-colors resize-none ${isDark ? "bg-slate-100 border border-black/10 text-slate-900 placeholder:text-slate-400 focus:bg-white" : "bg-white border border-black/10 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50"}`;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log('Booking data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-12 rounded-[2rem] text-center space-y-6 max-w-2xl mx-auto ${isDark ? "bg-slate-950/95 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.25)]" : "glass dark:bg-white/5"}`}
      >
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <Send className="text-emerald-500 w-10 h-10" />
        </div>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Demo Booked!</h2>
        <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Thank you for your interest. One of our experts will reach out to you shortly to confirm the details.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
        >
          Book Another
        </button>
      </motion.div>
    );
  }

  return (
    <section id="booking" className="py-24 px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-6xl font-display font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Book a <span className="text-gradient">Personal Demo</span>
          </h2>
          <p className={`text-lg font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            See how Avinya can transform your specific sales workflow.
          </p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className={`p-8 md:p-12 rounded-[2.5rem] space-y-6 ${isDark ? "bg-slate-950/95 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.25)]" : "glass dark:bg-white/5 border-black/5 dark:border-white/10 shadow-2xl"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                <User className="w-4 h-4" /> Full Name
              </label>
              <input 
                {...register('name')}
                className={inputClassName}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input 
                {...register('email')}
                className={inputClassName}
                placeholder="john@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                <Building className="w-4 h-4" /> Company
              </label>
              <input 
                {...register('company')}
                className={inputClassName}
                placeholder="Acme Corp"
              />
              {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                  <Calendar className="w-4 h-4" /> Date
                </label>
                <input 
                  type="date"
                  {...register('date')}
                  className={inputClassName}
                />
                {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                  <Clock className="w-4 h-4" /> Time
                </label>
                <input 
                  type="time"
                  {...register('time')}
                  className={inputClassName}
                />
                {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Additional Message (Optional)</label>
            <textarea 
              {...register('message')}
              rows={4}
              className={textareaClassName}
              placeholder="Tell us about your needs..."
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
            <Send className="w-5 h-5" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
