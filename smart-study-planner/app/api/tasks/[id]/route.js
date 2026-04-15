import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Task from '@/models/Task'
import { getAuthUser } from '@/lib/auth'

// Helper: find task owned by user
async function getTaskForUser(taskId, userId) {
  return Task.findOne({ _id: taskId, userId })
}

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const task = await getTaskForUser(params.id, user.userId)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    await connectDB()

    const task = await getTaskForUser(params.id, user.userId)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    // Update allowed fields
    const allowedFields = [
      'subject', 'title', 'description', 'difficulty',
      'deadline', 'estimatedHours', 'completed', 'priority', 'tags', 'notes'
    ]
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        task[field] = field === 'deadline' ? new Date(body[field]) : body[field]
      }
    })

    await task.save()

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const task = await getTaskForUser(params.id, user.userId)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    await task.deleteOne()
    return NextResponse.json({ success: true, message: 'Task deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
