import React from 'react';
import {
    ArrowRight,
    Brain,
    Twitter,
    Linkedin,
    Sun,
    Moon,
    Sparkles,
    Zap,
    Github,
    Users
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from './ui/Button';
import { useDarkMode } from '../hooks/useDarkMode';

interface LandingPageProps {
    onGetStarted: () => void;
}


const LandingPageV3: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { scrollYProgress } = useScroll();

    const headerBg = useTransform(
        scrollYProgress,
        [0, 0.05],
        ['rgba(var(--surface-body) / 0)', 'rgba(var(--surface-body) / 0.8)']
    );


    return (
        <div className={`min-h-screen bg-surface-body text-strong transition-theme overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}>
            {/* Minimalist Navigation */}
            <motion.header
                style={{ backgroundColor: headerBg }}
                className="sticky top-0 z-50 backdrop-blur-md border-b border-subtle/50 transition-theme bg-white/80 dark:bg-gray-950/80"
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="h-8 w-8 p-1 bg-white dark:bg-gray-900 rounded-lg border border-subtle shadow-sm">
                            <img src="/Edutu (4).jpg" alt="Edutu Logo" className="h-full w-full object-contain" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            edutu
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {['Platform', 'Impact', 'Network', 'Guides'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg border border-subtle bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors"
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <Button
                            variant="primary"
                            onClick={onGetStarted}
                            className="px-5 py-2 rounded-lg font-bold text-sm shadow-sm"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </motion.header>

            <main className="relative z-10">
                {/* Minimalist Hero Section */}
                <section className="relative pt-24 pb-32 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-subtle text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} className="text-brand-500" />
                            <span>v3.0 • The Intelligence Career OS</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1]">
                            Unleash Your <br />
                            <span className="text-brand-600">Full Potential</span>
                        </h1>

                        <p className="max-w-2xl text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Edutu maps your ambition to global opportunities. We build automated path to mastery through intelligence-driven career orchestration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                onClick={onGetStarted}
                                className="px-10 py-4 text-base font-bold rounded-xl shadow-lg shadow-brand-500/10 group"
                            >
                                Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="px-10 py-4 text-base font-bold rounded-xl border border-subtle"
                            >
                                See How it Works
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Minimalist Bento Features */}
                <section className="py-24 px-6 border-y border-subtle bg-slate-50/50 dark:bg-gray-950/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for the <span className="text-brand-600">Ambitious</span></h2>
                            <p className="max-w-xl text-slate-500 font-medium">Modular tools designed to scale your career from day one.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'AI Mentorship', desc: 'Personalized guidance based on your specific career context.', icon: Brain, color: 'text-purple-500' },
                                { title: 'Automated Roadmaps', desc: 'Milestones that shift based on market and your progress.', icon: Zap, color: 'text-amber-500' },
                                { title: 'Global Network', desc: 'Connect with mentors and peers in your niche.', icon: Users, color: 'text-brand-500' }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-subtle shadow-sm hover:border-brand-500/30 transition-colors space-y-6">
                                    <div className={`h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${feature.color}`}>
                                        <feature.icon size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl">{feature.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process Highlights */}
                <section className="py-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto lg:flex items-center gap-20">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Vision to <span className="text-brand-600">Reality.</span></h2>
                            <div className="space-y-8 pt-4 text-slate-500">
                                {[
                                    "Define Your Ambition — Start with the outcome you want.",
                                    "Get Your Blueprint — Receive an adaptive, real-time roadmap.",
                                    "Execute & Scale — Access resources, mentors, and hidden opportunities."
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 items-start font-medium border-l-2 border-slate-100 dark:border-slate-800 pl-6 hover:border-brand-500 transition-colors py-2">
                                        <div className="h-6 w-6 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-bold flex items-center justify-center shrink-0">0{i + 1}</div>
                                        <p className="leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 mt-16 lg:mt-0 relative flex items-center justify-center">
                            <div className="w-full max-w-md aspect-square bg-slate-50 dark:bg-slate-900 rounded-3xl border border-subtle p-8 flex flex-col justify-center items-center text-center space-y-6">
                                <div className="h-20 w-20 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                                    <Sparkles size={32} />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold">Processing Your Intent</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Integrating Career Context...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Simplified CTA */}
                <section className="py-32 px-6">
                    <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 dark:bg-gray-950 p-12 lg:p-20 text-center space-y-8 text-white">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Reach your peak performance.</h2>
                        <p className="max-w-xl mx-auto text-slate-400 text-lg font-medium">Join thousands of professionals automating their career growth with Edutu.</p>
                        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" onClick={onGetStarted} className="px-10 py-4 font-bold rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                                Create My Roadmap
                            </Button>
                            <button className="px-10 py-4 font-bold border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
                                Talk to Mentors
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-16 px-6 border-t border-subtle">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-4 max-w-xs">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 p-1 bg-white dark:bg-slate-800 rounded border border-subtle">
                                <img src="/Edutu (4).jpg" alt="Edutu Logo" className="h-full w-full object-contain" />
                            </div>
                            <span className="font-display font-bold text-lg tracking-tight">edutu</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Modular career operating system. Mapping potential to progress, one milestone at a time.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Github size={20} /></a>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-subtle flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} Edutu Inc.</span>
                    <span>v3.0.4-beta</span>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        .shadow-soft {
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
        }
      `}} />
        </div>
    );
};


export default LandingPageV3;
