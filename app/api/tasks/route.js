import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Task from '@/models/Task'
import { getAuthUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const completed = searchParams.get('completed')
    const sort = searchParams.get('sort') || 'deadline'

    await connectDB()

    const filter = { userId: user.userId }
    if (subject) filter.subject = subject
    if (completed !== null && completed !== undefined) {
      filter.completed = completed === 'true'
    }

    const sortMap = {
      deadline: { deadline: 1 },
      difficulty: { difficulty: -1 },
      created: { createdAt: -1 },
      priority: { priority: -1 },
    }

    const tasks = await Task.find(filter)
      .sort(sortMap[sort] || { deadline: 1 })
      .lean()

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, title, description, difficulty, deadline, estimatedHours, priority, tags } = body

    if (!subject || !title || !difficulty || !deadline) {
      return NextResponse.json(
        { error: 'Subject, title, difficulty, and deadline are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const task = await Task.create({
      userId: user.userId,
      subject,
      title,
      description,
      difficulty,
      deadline: new Date(deadline),
      estimatedHours: estimatedHours || 2,
      priority: priority || 'medium',
      tags: tags || [],
    })

    return NextResponse.json({ success: true, task }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
