// // import { motion } from 'motion/react';
// import { motion } from "framer-motion";
// import { Check, Zap, Shield, Crown } from 'lucide-react';

// const plans = [
//   {
//     name: "Starter",
//     price: "49",
//     description: "Perfect for solo founders and small teams.",
//     features: ["Up to 5 Users", "Basic AI Insights", "Voice CRM Lite", "Email Integration"],
//     icon: Zap,
//     color: "emerald",
//     iconClass: "text-emerald-600 dark:text-emerald-400",
//     bgClass: "bg-emerald-500/10"
//   },
//   {
//     name: "Professional",
//     price: "99",
//     description: "The sweet spot for growing sales teams.",
//     features: ["Up to 25 Users", "Advanced AI Scoring", "Full Voice CRM", "Custom Workflows", "API Access"],
//     icon: Shield,
//     color: "cyan",
//     iconClass: "text-cyan-600 dark:text-cyan-400",
//     bgClass: "bg-cyan-500/10",
//     popular: true
//   },
//   {
//     name: "Enterprise",
//     price: "249",
//     description: "Scale without limits. Built for big business.",
//     features: ["Unlimited Users", "Predictive AI Models", "Dedicated Support", "Custom Security", "SLA Guarantee"],
//     icon: Crown,
//     color: "violet",
//     iconClass: "text-violet-600 dark:text-violet-400",
//     bgClass: "bg-violet-500/10"
//   }
// ];

// export default function Pricing() {
//   return (
//     <div className="pt-32 pb-24 px-6 relative overflow-hidden min-h-screen">
//       <div className="bg-mesh absolute inset-0 opacity-50 dark:opacity-100" />
      
//       <div className="container mx-auto max-w-7xl relative z-10">
//         <div className="text-center mb-20">
//           <motion.h1 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-5xl md:text-8xl font-display font-bold mb-8 text-slate-900 dark:text-white leading-tight"
//           >
//             Simple, Transparent <br />
//             <span className="text-gradient">Pricing.</span>
//           </motion.h1>
//           <p className="text-slate-700 dark:text-white/60 text-xl max-w-2xl mx-auto font-light">
//             Choose the plan that's right for your team. Scale up or down at any time.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {plans.map((plan, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.1 }}
//               className={`relative glass dark:bg-white/5 p-10 rounded-[3rem] border-black/5 dark:border-white/10 flex flex-col ${plan.popular ? 'ring-2 ring-emerald-500/50' : ''}`}
//             >
//               {plan.popular && (
//                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full uppercase tracking-widest">
//                   Most Popular
//                 </div>
//               )}
              
//               <div className="mb-8">
//                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.bgClass}`}>
//                   <plan.icon className={`w-6 h-6 ${plan.iconClass}`} />
//                 </div>
//                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
//                 <p className="text-slate-600 dark:text-white/40 text-sm font-light leading-relaxed">{plan.description}</p>
//               </div>

//               <div className="mb-8">
//                 <div className="flex items-baseline gap-1">
//                   <span className="text-4xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
//                   <span className="text-slate-600 dark:text-white/40 text-sm">/month</span>
//                 </div>
//               </div>

//               <ul className="space-y-4 mb-10 flex-1">
//                 {plan.features.map((feature, j) => (
//                   <li key={j} className="flex items-center gap-3 text-slate-700 dark:text-white/60 text-sm font-light">
//                     <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
//                       <Check className="w-3 h-3 text-emerald-500" />
//                     </div>
//                     {feature}
//                   </li>
//                 ))}
//               </ul>

//               <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'glass dark:bg-white/5 text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>
//                 Get Started
//               </button>
//             </motion.div>
//           ))}
//         </div>

//         <div className="mt-24 text-center">
//           <p className="text-slate-600 dark:text-white/40 text-sm">
//             All plans include a 14-day free trial. Need a custom plan? 
//             <a href="#" className="text-emerald-500 font-bold ml-1 hover:underline">Contact Sales</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
