import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const { name, email } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    await sql`
      INSERT INTO waitlist (name, email) 
      VALUES (${name.trim()}, ${email})
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Handle duplicate email error
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "This email is already on the waitlist" }, { status: 409 })
    }

    console.error("Waitlist signup error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
