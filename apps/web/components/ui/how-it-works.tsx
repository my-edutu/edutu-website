'use client';

import { User, Sparkles, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: User,
    title: "Create your profile",
    description: "Tell us about your education, interests, and goals",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    icon: Sparkles,
    title: "Get matched with opportunities",
    description: "Our AI finds scholarships and programs that fit you",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: Rocket,
    title: "Apply and track deadlines",
    description: "Never miss an opportunity with smart reminders",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full py-20 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Get started in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative text-center p-8"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md">
                {index + 1}
              </div>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.color} mb-6 mt-4`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}