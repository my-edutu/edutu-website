import React from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  Brain,
  Check,
  Globe,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useDarkMode } from '../hooks/useDarkMode';
import useTypewriter from '../hooks/useTypewriter';

interface LandingPageProps {
  onGetStarted: () => void;
}

const featureTiles = [
  {
    icon: Brain,
    title: 'AI Mentorship',
    description:
      'Context-aware guidance that understands your goals, strengths, and constraints to keep you progressing.',
  },
  {
    icon: Target,
    title: 'Adaptive Roadmaps',
    description:
      'Milestones tailored to your timeline with reminders, check-ins, and nudges that feel like a personal coach.',
  },
  {
    icon: Award,
    title: 'Opportunity Match',
    description:
      'Curated scholarships, jobs, grants, and fellowships matched to your profile with clarity on why they fit.',
  },
  {
    icon: Users,
    title: 'Peer Power',
    description:
      'A private circle of ambitious doers to trade accountability, templates, and support in real time.',
  },
  {
    icon: Bell,
    title: 'Deadline Radar',
    description:
      'Smart notifications that prioritise what you must act on next, so you never miss a critical date again.',
  },
  {
    icon: TrendingUp,
    title: 'Career Capital',
    description:
      'Actionable rituals to sharpen your portfolio, CV, and online footprint for global opportunities.',
  },
];

const benefits = [
  'Accelerate your shortlisting chances with laser-focused applications.',
  'Receive weekly nudges that keep your roadmap alive without overwhelm.',
  'Access peer-reviewed templates, resources, and community wisdom.',
  'Showcase measurable progress to mentors, funders, and employers.',
  'Sync every action across mobile and web for continuity on the go.',
  'Gain confidence with AI-assisted interview, essay, and pitch practice.',
];

const testimonials = [
  {
    name: 'Amara K.',
    role: 'Mastercard Scholar',
    quote:
      'Edutu translated my ambitious goal into a daily ritual. I stayed consistent, submitted early, and won my dream scholarship.',
    accent: 'bg-brand-500',
  },
  {
    name: 'Kwame A.',
    role: 'Software Engineer',
    quote:
      'The adaptive roadmap and weekly nudges kept me shipping. Six months later, I landed a remote role I once thought impossible.',
    accent: 'bg-accent-500',
  },
  {
    name: 'Fatima M.',
    role: 'Community Leader',
    quote:
      'The mix of AI guidance and human community is unmatched. Every opportunity now feels within reach, not a distant dream.',
    accent: 'bg-success',
  },
];

const steps = [
  {
    label: 'Tell us your ambition',
    description:
      'Pinpoint the outcomes you care about most and the timeframe you are working with.',
  },
  {
    label: 'Receive your adaptive roadmap',
    description:
      'We stitch together milestones, opportunities, and rituals that fit your life and bandwidth.',
  },
  {
    label: 'Stay accountable on autopilot',
    description:
      'Edutu keeps you nudged, resourced, and in conversation with peers until you cross the finish line.',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const texts = [
    'Transform Your Ambitions Into Achievements',
    'Join Edutu, Your AI-Powered App for Global Opportunities'
  ];
  
  const currentText = useTypewriter(texts);

  return (
    <div className={`min-h-screen bg-surface-body text-strong transition-theme ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-body/80 backdrop-blur-md border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-600 text-inverse flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div className="font-semibold text-lg">edutu</div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-soft hover:text-strong transition-colors">Features</a>
              <a href="#testimonials" className="text-soft hover:text-strong transition-colors">Testimonials</a>
              <a href="#pricing" className="text-soft hover:text-strong transition-colors">Pricing</a>
              <a href="#faq" className="text-soft hover:text-strong transition-colors">FAQ</a>
            </nav>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="h-10 w-10 rounded-full border border-subtle bg-surface-layer flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Button variant="primary" onClick={onGetStarted} className="px-6 py-2">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                  {currentText.includes('Ambitions') ? (
                    <>
                      {currentText.substring(0, currentText.indexOf('Ambitions'))}
                      <span className="text-brand-600">Ambitions</span>
                      {currentText.substring(currentText.indexOf('Ambitions') + 'Ambitions'.length)}
                    </>
                  ) : (
                    currentText
                  )}
                </h1>
                <p className="text-xl text-soft max-w-lg leading-relaxed mx-auto lg:mx-0">
                  Edutu is your AI co-pilot for career growth, offering personalized roadmaps, 
                  smart nudges, and community support to keep you on track.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-base rounded-xl" 
                  onClick={onGetStarted}
                >
                  Start Your Journey
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-strong">10K+</div>
                  <div className="text-xs text-soft">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-strong">98%</div>
                  <div className="text-xs text-soft">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-strong">500+</div>
                  <div className="text-xs text-soft">Opportunities</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-64 h-64 bg-accent-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="relative bg-surface-layer border border-subtle rounded-3xl p-8 shadow-soft max-w-md">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-4 bg-brand-100 dark:bg-brand-900/30 rounded w-3/4"></div>
                      <div className="h-4 bg-brand-100 dark:bg-brand-900/30 rounded"></div>
                      <div className="h-4 bg-brand-100 dark:bg-brand-900/30 rounded w-5/6"></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-surface-elevated border border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-strong">89%</div>
                        <div className="text-xs text-soft">Success Rate</div>
                      </div>
                      <div className="bg-surface-elevated border border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-strong">24/7</div>
                        <div className="text-xs text-soft">Support</div>
                      </div>
                      <div className="bg-surface-elevated border border-subtle rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-strong">50+</div>
                        <div className="text-xs text-soft">Experts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 rounded-full bg-brand-500/10 blur-lg"></div>
        <div className="absolute bottom-1/4 right-10 w-24 h-24 rounded-full bg-accent-500/10 blur-lg"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-layer">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Your Success</h2>
            <p className="text-xl text-soft">
              Everything you need to achieve your goals and reach your full potential
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureTiles.map((feature, index) => (
              <div 
                key={index} 
                className="bg-surface-layer border border-subtle rounded-2xl p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-surface-brand text-brand-600 flex items-center justify-center mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-soft">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Ambitious Doers</h2>
            <p className="text-xl text-soft">
              Join thousands who have transformed their career journey with Edutu
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-10 w-10 rounded-full ${testimonial.accent} text-inverse flex items-center justify-center text-sm font-bold`}>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-soft">{testimonial.role}</div>
                  </div>
                </div>
                <blockquote className="text-soft italic">
                  "{testimonial.quote}"
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-500 to-accent-500 text-inverse">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Career Journey?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of ambitious professionals who are already using Edutu to reach their goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-4 text-base bg-inverse text-brand-600 hover:bg-surface-elevated"
              onClick={onGetStarted}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-layer py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-brand-600 text-inverse flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div className="font-semibold">edutu</div>
              </div>
              <p className="text-soft text-sm">
                Empowering ambitious individuals to achieve their career goals with AI-powered guidance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-soft text-sm">
                <li><a href="#" className="hover:text-strong transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Solutions</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Tutorials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-soft text-sm">
                <li><a href="#" className="hover:text-strong transition-colors">About</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">News</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-soft text-sm">
                <li><a href="#" className="hover:text-strong transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-strong transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-subtle mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-soft text-sm">
              © {new Date().getFullYear()} Edutu. Built proudly in Africa.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-soft hover:text-strong transition-colors">
                Terms
              </a>
              <a href="#" className="text-soft hover:text-strong transition-colors">
                Privacy
              </a>
              <a href="#" className="text-soft hover:text-strong transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;