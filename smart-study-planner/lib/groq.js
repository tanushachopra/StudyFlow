// lib/groq.js
// Groq API — free tier, no billing required, ~10x faster than Gemini
// Docs: https://console.groq.com/docs/openai
// Free limits: 30 req/min, 14,400 req/day on llama-3.3-70b-versatile

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile' // best free model on Groq

// ─── Low-level fetch wrapper ──────────────────────────────────────────────────
async function callGroq(messages, { temperature = 0.5, maxTokens = 2048, jsonMode = false } = {}) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is missing from .env.local. ' +
      'Get a free key at https://console.groq.com'
    )
  }

  if (!apiKey.startsWith('gsk_')) {
    throw new Error(
      `GROQ_API_KEY looks wrong — it should start with "gsk_" but got: "${apiKey.slice(0, 8)}..."`
    )
  }

  const body = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  }

  // JSON mode forces the model to return valid JSON — no code fences, no prose
  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  let res
  try {
    res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (networkErr) {
    throw new Error(`Network error calling Groq: ${networkErr.message}`)
  }

  // Parse response body regardless of status code
  let data
  try {
    data = await res.json()
  } catch {
    const raw = await res.text().catch(() => '(unreadable)')
    throw new Error(`Groq returned non-JSON response (status ${res.status}): ${raw.slice(0, 200)}`)
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || JSON.stringify(data)
    const hint =
      res.status === 401 ? ' → Your API key is invalid. Regenerate it at console.groq.com/keys' :
      res.status === 429 ? ' → Rate limit hit. Wait 60 seconds and try again.' :
      res.status === 400 ? ' → Bad request. Check model name and message format.' :
      ''
    throw new Error(`Groq API error ${res.status}: ${errMsg}${hint}`)
  }

  const text = data?.choices?.[0]?.message?.content
  if (!text || text.trim() === '') {
    const finishReason = data?.choices?.[0]?.finish_reason
    throw new Error(
      `Groq returned empty content. finish_reason="${finishReason}". ` +
      'Full response: ' + JSON.stringify(data).slice(0, 300)
    )
  }

  return text.trim()
}

// ─── Strip code fences if the model adds them despite json_mode ───────────────
function safeParseJSON(raw) {
  let text = raw.trim()
  // Remove ```json ... ``` or ``` ... ```
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  // Find first { or [
  const firstBrace   = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let start = -1
  if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket)
  else if (firstBrace !== -1) start = firstBrace
  else if (firstBracket !== -1) start = firstBracket
  if (start > 0) text = text.slice(start)
  return JSON.parse(text)
}

// ─── Guarantee the plan has the shape the UI expects ─────────────────────────
function normalisePlan(raw, tasks, daysAvailable) {
  const today = new Date()

  // Accept multiple key names the model might use
  const rawDays = raw.dailyPlans || raw.daily_plans || raw.days || raw.plan || []

  const dailyPlans = Array.isArray(rawDays)
    ? rawDays.slice(0, daysAvailable).map((day, idx) => {
        const date = new Date(today)
        date.setDate(today.getDate() + idx)

        const rawSessions = day.sessions || day.tasks || day.schedule || []
        const sessions = Array.isArray(rawSessions)
          ? rawSessions.map(s => ({
              subject:  String(s.subject  || s.topic    || 'General'),
              topic:    String(s.topic    || s.title    || s.task || 'Study session'),
              duration: Math.max(30, Number(s.duration  || s.minutes || s.time || 60)),
              priority: ['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium',
              tips:     String(s.tips     || s.tip      || s.hint || ''),
            }))
          : []

        return {
          day:        idx + 1,
          date:       String(day.date || date.toISOString().split('T')[0]),
          totalHours: Number((sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1)),
          sessions,
        }
      })
    : []

  // Hard fallback: if AI returned zero days, build one from tasks directly
  if (dailyPlans.length === 0) {
    console.warn('[Groq] AI returned no daily plans — using task fallback')
    tasks.forEach((task, idx) => {
      const date = new Date(today)
      date.setDate(today.getDate() + (idx % daysAvailable))
      dailyPlans.push({
        day:        idx + 1,
        date:       date.toISOString().split('T')[0],
        totalHours: task.estimatedHours || 2,
        sessions: [{
          subject:  task.subject,
          topic:    task.title,
          duration: (task.estimatedHours || 2) * 60,
          priority: task.difficulty === 'hard' ? 'high' : task.difficulty === 'easy' ? 'low' : 'medium',
          tips:     'Stay focused. Take a 10-min break every 50 minutes.',
        }],
      })
    })
  }

  return {
    summary: String(raw.summary || raw.overview || 'Your personalised study plan is ready.'),
    totalHours: Number(
      (raw.totalHours || raw.total_hours ||
       dailyPlans.reduce((s, d) => s + d.totalHours, 0)).toFixed(1)
    ),
    dailyPlans,
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.map(String)
      : [
          'Study your hardest subject first while your focus is sharpest.',
          'Use the Pomodoro technique: 50 min study, 10 min break.',
          'Review notes the evening before each exam.',
        ],
  }
}

// ─── Public: generate study plan ─────────────────────────────────────────────
export async function generateStudyPlan(tasks, daysAvailable = 7) {
  const taskLines = tasks.map((t, i) => {
    const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / 86_400_000)
    return `${i + 1}. subject="${t.subject}" topic="${t.title}" difficulty="${t.difficulty}" dueInDays=${daysLeft} estHours=${t.estimatedHours || 2}`
  }).join('\n')

  const today = new Date().toISOString().split('T')[0]

  const messages = [
    {
      role: 'system',
      content:
        'You are a study planner. You output ONLY valid JSON — no explanation, no markdown, no code fences. ' +
        'Your JSON must be parseable by JSON.parse().',
    },
    {
      role: 'user',
      content: `Create a ${daysAvailable}-day study plan starting ${today} for these tasks:
${taskLines}

Rules:
- Max 6 study hours per day
- Tasks with fewer dueInDays get higher priority
- Hard tasks need more time than easy ones
- Each session must be 30–120 minutes

Return ONLY this JSON structure, nothing else:
{
  "summary": "one sentence describing the plan",
  "totalHours": <number>,
  "recommendations": ["tip 1", "tip 2", "tip 3"],
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "totalHours": <number>,
      "sessions": [
        {
          "subject": "...",
          "topic": "...",
          "duration": <integer minutes>,
          "priority": "high|medium|low",
          "tips": "one short study tip"
        }
      ]
    }
  ]
}`,
    },
  ]

  const raw    = await callGroq(messages, { temperature: 0.3, maxTokens: 2048, jsonMode: true })
  const parsed = safeParseJSON(raw)
  return normalisePlan(parsed, tasks, daysAvailable)
}

// ─── Public: chat assistant ───────────────────────────────────────────────────
export async function chatWithAssistant(conversationMessages, userTasks = []) {
  const taskContext = userTasks.length > 0
    ? `\n\nStudent's pending tasks:\n${userTasks.map(t =>
        `- ${t.subject}: "${t.title}" | ${t.difficulty} difficulty | due ${new Date(t.deadline).toLocaleDateString()} | ~${t.estimatedHours || 2}h`
      ).join('\n')}`
    : '\n\nThe student has no pending tasks yet.'

  const systemMessage = {
    role: 'system',
    content:
      'You are StudyFlow AI, a friendly and knowledgeable academic study coach. ' +
      'Help students plan their studies, stay motivated, and understand difficult topics. ' +
      'Be warm, concise, and practical. Use bullet points when listing things.' +
      taskContext,
  }

  // Filter out any empty messages and map roles correctly
  const history = conversationMessages
    .filter(m => m && (m.content || '').trim() !== '')
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.trim() }))

  if (history.length === 0) {
    return 'Please send a message and I will be happy to help!'
  }

  // Last message must be from user
  if (history[history.length - 1].role !== 'user') {
    return 'Please send a message and I will be happy to help!'
  }

  const messages = [systemMessage, ...history]
  return callGroq(messages, { temperature: 0.7, maxTokens: 1024 })
}