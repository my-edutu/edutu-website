'use client';

import { ArrowUpRight, CheckCircle2, Clock, MapPin, Mic, Save, Bell, Globe, Sparkles } from "lucide-react";
import { motion, useMotionValue, useTransform, type Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  href?: string;
  feature?: "spotlight" | "typing" | "icons" | "globe" | "voice";
  spotlightItems?: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "main",
    title: "Opportunities Matched to You",
    description: "Edutu analyzes your profile to surface scholarships and global opportunities that actually fit you—so you don't waste time scrolling irrelevant listings.",
    href: "#",
    feature: "spotlight",
    spotlightItems: [
      "Fully Funded Programs",
      "Nigeria Eligible",
      "Undergraduate / Masters",
      "Deadline: Aug 30",
    ],
    size: "lg",
    className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  },
  {
    id: "ai",
    title: "Ask Edutu AI",
    description: "Search smarter. Get instant scholarship suggestions, summaries, and guidance—just by asking.",
    href: "#",
    feature: "typing",
    size: "md",
    className: "col-span-2 row-span-1 col-start-1 col-end-3",
  },
  {
    id: "discover",
    title: "All Opportunities, One Place",
    description: "Scholarships, internships, fellowships, and grants—collected and organized in one platform.",
    href: "#",
    feature: "globe",
    size: "sm",
    className: "col-span-1 row-span-1",
  },
  {
    id: "track",
    title: "Track & Never Miss Deadlines",
    description: "Save opportunities, monitor deadlines, and stay on top of every application.",
    href: "#",
    feature: "spotlight",
    spotlightItems: [
      "Saved Opportunities",
      "Deadline Reminders",
      "Application Status",
    ],
    size: "sm",
    className: "col-span-1 row-span-1",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const SpotlightFeature = ({ items }: { items: string[] }) => (
  <ul className="mt-3 space-y-2">
    {items.map((item, index) => (
      <motion.li
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
        transition={{ delay: 0.1 * index }}
      >
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-orange-500" />
        <span className="text-zinc-700 text-sm dark:text-zinc-300">
          {item}
        </span>
      </motion.li>
    ))}
  </ul>
);

function GlobeAnimation() {
  return (
    <div className="relative mt-4 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative h-20 w-20"
      >
        {/* Globe circle */}
        <div className="absolute inset-0 rounded-full border-2 border-orange-200 dark:border-orange-800" />
        
        {/* Horizontal arcs */}
        <motion.div
          animate={{ rotateX: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-orange-300/50 dark:border-orange-700/50"
          style={{ transformStyle: "preserve-3d" }}
        />
        
        {/* Vertical arcs */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-orange-400/30 dark:border-orange-600/30"
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
        </div>
      </motion.div>
      
      {/* Floating labels */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-0 text-xs font-medium text-orange-600 dark:text-orange-400"
      >
        🌍
      </motion.div>
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-0 text-xs font-medium text-orange-600 dark:text-orange-400"
      >
        🎓
      </motion.div>
    </div>
  );
}

function VoiceAnimation() {
  const [submitted, setSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, 3000);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="w-full py-2">
      <div className="flex h-16 w-full items-center justify-center gap-0.5">
        {[...Array(32)].map((_, i) => (
          <motion.div
            key={`voice-bar-${i}`}
            className="w-1 rounded-full bg-orange-500"
            animate={
              submitted && isClient
                ? { height: [`8px`, `${20 + Math.random() * 60}%`, `8px`] }
                : { height: "8px" }
            }
            transition={
              submitted && isClient
                ? {
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.03,
                  }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        {submitted ? "Listening..." : "Click to ask Edutu"}
      </p>
    </div>
  );
}

const BentoCard = ({ item }: { item: BentoItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
    >
      <Link
        aria-label={`${item.title} - ${item.description}`}
        className={cn(
          "group relative flex h-full flex-col gap-3 rounded-xl border border-zinc-200/60 bg-gradient-to-b from-zinc-50/60 via-zinc-50/40 to-zinc-50/30 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-[4px] transition-all duration-500 ease-out before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/10 before:via-white/20 before:to-transparent before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-0 after:z-[-1] after:rounded-xl after:bg-zinc-50/70 hover:border-orange-300/50 hover:bg-gradient-to-b hover:from-orange-50/60 hover:via-orange-50/30 hover:to-orange-50/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:backdrop-blur-[6px] dark:border-zinc-800/60 dark:from-zinc-900/60 dark:via-zinc-900/40 dark:to-zinc-900/30 dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] dark:hover:border-orange-700/50 dark:hover:from-orange-950/60 dark:hover:via-orange-950/30 dark:hover:to-orange-950/20 dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:after:bg-zinc-900/70 dark:before:from-black/10 dark:before:via-black/20 dark:before:to-transparent",
          item.className
        )}
        href={item.href || "#"}
        tabIndex={0}
      >
        <div
          className="relative z-10 flex h-full flex-col gap-2"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex flex-1 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 text-xl tracking-tight transition-colors duration-300 group-hover:text-orange-700 dark:text-zinc-100 dark:group-hover:text-orange-300">
                {item.title}
              </h3>
              <div className="text-orange-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <p className="text-zinc-600 text-sm tracking-tight dark:text-zinc-400">
              {item.description}
            </p>

            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "typing" && <VoiceAnimation />}

            {item.feature === "globe" && <GlobeAnimation />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function BentoGrid() {
  return (
    <section className="relative overflow-hidden bg-white py-20 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Why Choose Edutu?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need to find and apply for global opportunities
          </p>
        </div>

        <motion.div
          className="grid gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true }}
          whileInView="visible"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[2]} />
            </motion.div>
            <motion.div className="md:col-span-1" variants={fadeInUp}>
              <BentoCard item={bentoItems[3]} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}