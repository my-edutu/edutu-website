"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function WaitlistForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Thanks for joining! We'll be in touch soon.")
        setName("")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-slate-900/30 border-white/30 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">Congratulations! 🎉</h3>
              <p className="text-white/90 text-lg leading-relaxed">
                You are among the first users! You'll get a notification once Edutu is available to use.
              </p>
            </div>
            <Button
              onClick={() => setStatus("idle")}
              className="mt-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 py-3 text-base rounded-lg"
            >
              Join Another Person
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-slate-900/30 border-white/30 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">Join the Waitlist</CardTitle>
        <CardDescription className="text-white/90 font-normal italic drop-shadow-md">
          Get earlybird offers when we launch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              className="border-white/40 bg-white/10 text-slate-300 placeholder:text-slate-400 backdrop-blur-sm h-12 px-4 py-3 text-base md:h-14 md:px-5 md:py-4 md:text-lg rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 transition-all duration-200"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
              required
            />
            <Input
              className="border-white/40 bg-white/10 text-slate-300 placeholder:text-slate-400 backdrop-blur-sm h-12 px-4 py-3 text-base md:h-14 md:px-5 md:py-4 md:text-lg rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 transition-all duration-200"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-4 py-3 text-base md:h-14 md:px-5 md:py-4 md:text-lg rounded-lg"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </form>

        {status === "error" && (
          <Alert className="mt-4 border-blue-400/50 bg-blue-900/30 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-100">{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
