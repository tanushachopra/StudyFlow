// app/api/planner/generate/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Task from '@/models/Task'
import StudyPlan from '@/models/StudyPlan'
import { getAuthUser } from '@/lib/auth'
import { generateStudyPlan } from '@/lib/groq'

export async function POST(request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    let daysAvailable = 7
    let taskIds = null
    try {
      const body = await request.json()
      daysAvailable = Number(body.daysAvailable) || 7
      taskIds = body.taskIds || null
    } catch {
      // No body is fine — use defaults
    }

    // ── Fetch tasks ─────────────────────────────────────────────────────────
    await connectDB()

    const filter = { userId: user.userId, completed: false }
    if (Array.isArray(taskIds) && taskIds.length > 0) {
      filter._id = { $in: taskIds }
    }

    const tasks = await Task.find(filter).sort({ deadline: 1 }).lean()

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'No pending tasks found. Add some tasks first, then generate a plan.' },
        { status: 400 }
      )
    }

    // ── Generate AI plan ────────────────────────────────────────────────────
    let aiPlan
    try {
      console.log(`[Planner] Generating plan for ${tasks.length} tasks over ${daysAvailable} days…`)
      aiPlan = await generateStudyPlan(tasks, daysAvailable)
      console.log('[Planner] AI plan generated successfully. Days:', aiPlan.dailyPlans?.length)
    } catch (aiErr) {
      // Log the REAL error so you can see it in the terminal
      console.error('[Planner] AI generation failed:', aiErr.message)

      // Return the error to the client so you see it in the browser too
      return NextResponse.json(
        {
          error: `AI generation failed: ${aiErr.message}`,
          hint: 'Check your GROQ_API_KEY in .env.local and restart the server.',
        },
        { status: 502 }
      )
    }

    // ── Save to DB ──────────────────────────────────────────────────────────
    await StudyPlan.updateMany(
      { userId: user.userId, isActive: true },
      { isActive: false }
    )

    const plan = await StudyPlan.create({
      userId:          user.userId,
      title:           `Study Plan — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      summary:         aiPlan.summary,
      totalHours:      aiPlan.totalHours,
      daysAvailable,
      dailyPlans:      aiPlan.dailyPlans,
      recommendations: aiPlan.recommendations,
      taskIds:         tasks.map(t => t._id),
      isActive:        true,
    })

    console.log('[Planner] Plan saved to DB:', plan._id)
    return NextResponse.json({ success: true, plan })

  } catch (error) {
    console.error('[Planner] Unhandled error:', error.message)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const plan = await StudyPlan
      .findOne({ userId: user.userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, plan: plan || null })
  } catch (error) {
    console.error('[Planner] GET error:', error.message)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}