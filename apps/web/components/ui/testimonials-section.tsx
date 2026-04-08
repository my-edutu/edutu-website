"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    quote: "Edutu helped me find a fully funded scholarship to study in Canada. The AI matching was incredibly accurate!",
    author: "Amara Johnson",
    role: "Student",
    company: "University of Toronto",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    quote: "I discovered opportunities I never knew existed. Edutu made the scholarship search so much easier.",
    author: "David Chen",
    role: "Graduate Student",
    company: "MIT",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    quote: "The deadline reminders saved me multiple times. Highly recommend for anyone looking for global opportunities.",
    author: "Sarah Williams",
    role: "Undergraduate",
    company: "Oxford University",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&auto=format&fit=crop&q=60",
  },
]

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleChange = (index: number) => {
    if (index === active || isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActive(index)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  const handlePrev = () => {
    const newIndex = active === 0 ? testimonials.length - 1 : active - 1
    handleChange(newIndex)
  }

  const handleNext = () => {
    const newIndex = active === testimonials.length - 1 ? 0 : active + 1
    handleChange(newIndex)
  }

  const current = testimonials[active]

  return (
    <section className="w-full py-20 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            What Students Say
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Join thousands of students who found their dream opportunities
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-8">
            <span className="text-[120px] font-light leading-none text-orange-500/20 select-none" style={{ fontFeatureSettings: '"tnum"' }}>
              {String(active + 1).padStart(2, "0")}
            </span>

            <div className="flex-1 pt-8">
              <blockquote className={`text-xl md:text-2xl font-light leading-relaxed text-zinc-900 dark:text-white transition-all duration-300 ${isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
                "{current.quote}"
              </blockquote>

              <div className={`mt-8 group cursor-default transition-all duration-300 delay-100 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all duration-300">
                    <Image src={current.image} alt={current.author} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{current.author}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {current.role} at {current.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {testimonials.map((_, index) => (
                  <button key={index} onClick={() => handleChange(index)} className="group relative py-4">
                    <span className={`block h-px transition-all duration-500 ease-out ${index === active ? "w-12 bg-orange-500" : "w-6 bg-zinc-300 dark:bg-zinc-700 group-hover:w-8 group-hover:bg-orange-400"}`} />
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-400 tracking-widest uppercase">
                {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}