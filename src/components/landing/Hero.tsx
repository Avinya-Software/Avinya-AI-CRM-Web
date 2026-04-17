import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Bot, Mic, Layout, Users, X } from 'lucide-react';
import * as Dialog from "@radix-ui/react-dialog";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden transition-colors duration-500">
      <div className="bg-mesh absolute inset-0 opacity-50 dark:opacity-100" />
      
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-1.5 rounded-full glass dark:bg-white/5 border-black/5 dark:border-white/10 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase"
          >
            <SparkleIcon />
            AI-Powered CRM Evolution
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-display font-extrabold tracking-tight leading-[0.9] max-w-4xl text-slate-900 dark:text-white"
          >
            AI CRM That <span className="text-gradient">Works For You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-700 dark:text-white/60 max-w-2xl font-light leading-relaxed"
          >
            Automate leads, schedule tasks with voice, and manage projects with a 
            billion-dollar brain. The only platform that grows as fast as your ambition.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <button 
              onClick={() => {
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group px-8 py-4 rounded-full bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-2xl shadow-emerald-500/20"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="px-8 py-4 rounded-full glass dark:bg-white/5 text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-2 font-semibold">
                  <Play className="w-5 h-5 fill-slate-900 dark:fill-white" />
                  Watch Demo
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden z-[101] shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                  <Dialog.Title className="sr-only">Product Demo Video</Dialog.Title>
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10">
                    <Dialog.Close asChild>
                      <X className="w-6 h-6" />
                    </Dialog.Close>
                  </button>
                  <video
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    src="/ss4-recording-ai-crm.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </motion.div>
        </div>

        {/* Floating UI Elements */}
        <div className="mt-20 relative h-[400px] md:h-[600px] w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute inset-0 glass-dark dark:bg-black/40 rounded-3xl overflow-hidden border-black/5 dark:border-white/10 shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-12 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="pt-16 px-8 grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 space-y-4">
                <div className="h-4 w-full bg-black/5 dark:bg-white/5 rounded" />
                <div className="h-4 w-3/4 bg-black/5 dark:bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-black/5 dark:bg-white/5 rounded" />
                <div className="pt-8 space-y-4">
                   {[1,2,3,4].map(i => <div key={i} className="h-10 w-full glass dark:bg-white/5 rounded-lg" />)}
                </div>
              </div>
              <div className="col-span-9 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   {[1,2,3].map(i => <div key={i} className="h-32 glass dark:bg-white/5 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20" />
                      <div className="h-4 w-1/2 bg-black/10 dark:bg-white/10 rounded" />
                   </div>)}
                </div>
                <div className="h-64 glass dark:bg-white/5 rounded-2xl p-6">
                   <div className="flex justify-between items-center mb-6">
                      <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded" />
                      <div className="h-6 w-24 bg-black/10 dark:bg-white/10 rounded" />
                   </div>
                   <div className="flex items-end gap-2 h-32">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                          className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400 rounded-t-lg"
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Cards */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 md:-left-20 glass dark:bg-white/10 p-4 rounded-2xl shadow-xl border-black/5 dark:border-emerald-500/20 z-20 hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Users className="text-black w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-white/50 font-bold uppercase tracking-wider">New Leads</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">+124%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-40 -right-10 md:-right-20 glass dark:bg-white/10 p-4 rounded-2xl shadow-xl border-black/5 dark:border-violet-500/20 z-20 hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-white/50 font-bold uppercase tracking-wider">AI Assistant</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Drafting quotation...</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 -left-10 md:-left-20 glass dark:bg-white/10 p-4 rounded-2xl shadow-xl border-black/5 dark:border-cyan-500/20 z-20 hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                <Mic className="text-black w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-white/50 font-bold uppercase tracking-wider">Voice Command</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">"Schedule meeting with..."</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
    </svg>
  );
}
