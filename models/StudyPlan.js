import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  duration: Number, // minutes
  priority: { type: String, enum: ['high', 'medium', 'low'] },
  tips: String,
  completed: { type: Boolean, default: false },
})

const DayPlanSchema = new mongoose.Schema({
  day: Number,
  date: String,
  totalHours: Number,
  sessions: [SessionSchema],
})

const StudyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'My Study Plan',
    },
    summary: String,
    totalHours: Number,
    daysAvailable: { type: Number, default: 7 },
    dailyPlans: [DayPlanSchema],
    recommendations: [String],
    taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.StudyPlan || mongoose.model('StudyPlan', StudyPlanSchema)
