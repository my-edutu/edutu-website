"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"

export default function Home() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen relative">
      {/* Hero Animated Background - ONLY for hero section */}
      <div className="absolute inset-0 z-0 h-screen overflow-hidden">
        <MeshGradient
          className="h-full w-full"
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

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        <main className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-2xl mx-auto text-center space-y-8">
            <div className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
              <h1 className="text-4xl md:text-6xl tracking-tight text-white drop-shadow-2xl py-6 font-semibold min-h-[120px] md:min-h-[144px] flex items-center justify-center">
                Find Scholarships & Global Opportunities That Match You
              </h1>
              <p className="max-w-lg drop-shadow-xl h-auto text-center text-white leading-relaxed mx-auto font-normal text-lg">
                No endless searching. Get opportunities tailored to your profile.
              </p>
            </div>

            {!showForm ? (
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 shadow-lg"
              >
                Join Waitlist
              </Button>
            ) : (
              <div id="waitlist-form" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <WaitlistForm />
                <button 
                  onClick={() => setShowForm(false)}
                  className="mt-4 text-sm text-white/60 hover:text-white/80 underline"
                >
                  Close form
                </button>
              </div>
            )}

            <div className="pt-8 text-sm text-white/80 drop-shadow-lg">
              <p>Don&apos;t Worry. We don&apos;t Spam</p>
            </div>
          </div>
        </main>

        {/* Rest of sections with white/light background */}
        <div className="bg-white">
          <CountryFlags />
          <LogoTicker />
          <ProblemSection />
          <BentoGrid />
          <HowItWorks />
          <TestimonialsSection />
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
                onButtonClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}