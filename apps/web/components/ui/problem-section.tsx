'use client';

import { ArrowRight, Search, CalendarClock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  icon?: React.ReactNode;
}

function CardFlip({
  title,
  subtitle,
  description,
  features = [],
  icon,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Auto-flip after 2 seconds when visible
          setTimeout(() => setIsFlipped(true), 2000);
        } else {
          setIsVisible(false);
          setIsFlipped(false);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(`card-${title?.replace(/\s+/g, '-')}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [title]);

  return (
    <div
      id={`card-${title?.replace(/\s+/g, '-')}`}
      className="group relative h-[320px] w-full max-w-[320px] [perspective:2000px]"
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-2xl",
            "bg-white",
            "border border-slate-200",
            "shadow-sm",
            "transition-all duration-700",
            "group-hover:shadow-xl",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="relative h-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <div className="absolute inset-0 flex items-start justify-center pt-16">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
                <div className="text-4xl">
                  {icon}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 leading-snug tracking-tight transition-all duration-500">
                  {title}
                </h3>
                <p className="text-base text-slate-600 tracking-tight transition-all duration-500">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-2xl p-6",
            "bg-gradient-to-b from-blue-50 to-white",
            "border border-blue-200",
            "shadow-sm",
            "flex flex-col",
            "transition-all duration-700",
            "group-hover:shadow-xl",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-slate-900 leading-snug tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 tracking-tight">
                {description}
              </p>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-sm text-slate-700 transition-all duration-500"
                  key={feature}
                  style={{
                    transform: isFlipped
                      ? "translateX(0)"
                      : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 100 + 200}ms`,
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-blue-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <div
              className={cn(
                "group/start relative",
                "flex items-center justify-between",
                "-m-3 rounded-xl p-3",
                "transition-all duration-300",
                "bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100",
                "hover:scale-[1.02] hover:cursor-pointer"
              )}
            >
              <span className="font-medium text-sm text-blue-700 transition-colors duration-300 group-hover/start:text-blue-600">
                Learn how Edutu helps
              </span>
              <ArrowRight className="h-4 w-4 text-blue-500 transition-all duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const problems = [
  {
    title: "You spend hours searching",
    subtitle: "Endless research on opportunities",
    description: "Students spend 10+ hours weekly searching across dozens of websites for scholarships, fellowships, and grants. Most opportunities go unnoticed.",
    features: ["AI-powered discovery", "Personalized alerts", "One search, infinite results"],
    icon: <Search className="w-10 h-10 text-blue-600" />,
  },
  {
    title: "You miss deadlines",
    subtitle: "Critical dates slip away",
    description: "With thousands of opportunities having different deadlines, it's easy to miss application windows.",
    features: ["Smart calendar integration", "Deadline reminders", "Never miss a thing"],
    icon: <CalendarClock className="w-10 h-10 text-blue-600" />,
  },
  {
    title: "You don't know where to start",
    subtitle: "Overwhelmed by choices",
    description: "The sheer volume of opportunities makes it hard to choose. Students often give up because they don't know which opportunities are worth applying to.",
    features: ["Personalized roadmaps", "AI application guidance", "Expert mentorship matching"],
    icon: <MapPin className="w-10 h-10 text-blue-600" />,
  },
];

export function ProblemSection() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            The Struggle Is Real
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We've been there. Here's what students face every day
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {problems.map((problem, index) => (
            <CardFlip
              key={index}
              title={problem.title}
              subtitle={problem.subtitle}
              description={problem.description}
              features={problem.features}
              icon={problem.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}