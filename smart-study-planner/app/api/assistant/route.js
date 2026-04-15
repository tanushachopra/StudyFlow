// app/api/assistant/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Task from '@/models/Task'
import { getAuthUser } from '@/lib/auth'
import { chatWithAssistant } from '@/lib/groq'

export async function POST(request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    let messages
    try {
      const body = await request.json()
      messages = body.messages
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body — expected JSON with a messages array.' },
        { status: 400 }
      )
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages must be a non-empty array of {role, content} objects.' },
        { status: 400 }
      )
    }

    // ── Fetch user tasks for context ────────────────────────────────────────
    await connectDB()

    const tasks = await Task
      .find({ userId: user.userId, completed: false })
      .sort({ deadline: 1 })
      .limit(15)
      .lean()

    // ── Call AI ─────────────────────────────────────────────────────────────
    let reply
    try {
      console.log(`[Assistant] Calling Groq with ${messages.length} messages…`)
      reply = await chatWithAssistant(messages, tasks)
      console.log('[Assistant] Reply length:', reply?.length)
    } catch (aiErr) {
      console.error('[Assistant] AI call failed:', aiErr.message)
      return NextResponse.json(
        {
          error: `AI call failed: ${aiErr.message}`,
          hint: 'Check your GROQ_API_KEY in .env.local and restart the server.',
        },
        { status: 502 }
      )
    }

    if (!reply || reply.trim() === '') {
      console.error('[Assistant] Empty reply from AI')
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, message: reply })

  } catch (error) {
    console.error('[Assistant] Unhandled error:', error.message)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}