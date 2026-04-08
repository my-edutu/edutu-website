"use client"

import { useState, useEffect } from "react"
import { WaitlistForm } from "@/components/waitlist-form"
import { MeshGradient } from "@paper-design/shaders-react"
import { Header } from "@/components/ui/header-1"
import { CountryFlags } from "@/components/ui/country-flags"
import { LogoTicker } from "@/components/ui/logo-ticker"
import { ProblemSection } from "@/components/ui/problem-section"
import BentoGrid from "@/components/ui/bento-grid"
import { HowItWorks } from "@/components/ui/how-it-works"
import TestimonialsSection from "@/components/ui/testimonials-section"
import BlogSection from "@/components/ui/blog-section"
import { CtaCard } from "@/components/ui/cta-card"
import Footer from "@/components/ui/footer"

export default function Home() {
  const texts = [
    "Never miss an opportunity that could change your life",
    "Join Edutu - The AI Powered App for Global Opportunities",
  ]

  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentText = texts[currentTextIndex]
    let timeoutId: NodeJS.Timeout

    if (isTyping) {
      if (displayedText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1))
        }, 50)
      } else {
        timeoutId = setTimeout(() => {
          setDisplayedText("")
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }, 4000)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [displayedText, isTyping, currentTextIndex, texts])

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <div className="fixed inset-0 z-0">
        <MeshGradient
          className="h-screen w-screen"
          distortion={0.8}
          swirl={0.1}
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(216, 90%, 27%)", "hsl(243, 68%, 36%)", "hsl(205, 91%, 64%)", "hsl(211, 61%, 57%)"]}
        />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex items-center justify-center min-h-screen p-4 my-0">
          <div className="w-full max-w-2xl mx-auto text-center space-y-8">
            <div className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl font-sans">
              <h1 className="text-4xl md:text-6xl tracking-tight text-white drop-shadow-2xl py-6 font-semibold min-h-[120px] md:min-h-[144px] flex items-center justify-center">
                {displayedText}
              </h1>
              <p className="max-w-lg drop-shadow-xl font-body h-auto text-center text-white leading-6 mx-auto px-0 py-0 font-normal text-lg tracking-[0.01em]">
                Edutu uses AI to find, filter, and personalize scholarships, fellowships, and Global opportunities —
                then helps you prepare with a clear roadmap.
              </p>
            </div>

            <div id="waitlist-form">
            <WaitlistForm />
          </div>

            <div className="pt-8 text-sm text-white/80 drop-shadow-lg font-body">
              <p>Don&#39;t Worry. We don&#39;t Spam </p>
            </div>
          </div>
        </main>

        {/* Country Flags Section */}
        <CountryFlags />

        {/* Logo Ticker Section */}
        <LogoTicker />

        {/* Problem Section */}
        <ProblemSection />

        {/* Bento Grid Section */}
        <BentoGrid />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Blog Section */}
        <BlogSection />

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <CtaCard
              title="Ready to Get Started?"
              subtitle="Start Your Journey Today"
              description="Join thousands of students who have found their dream opportunities through Edutu. Create your free profile and let our AI match you with scholarships, fellowships, and more."
              buttonText="Join the Waitlist"
              imageSrc="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&auto=format&fit=crop&q=60"
              imageAlt="Students celebrating graduation"
              onButtonClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}