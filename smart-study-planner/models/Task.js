import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    estimatedHours: {
      type: Number,
      default: 2,
      min: 0.5,
      max: 20,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Auto-set completedAt when completed flips to true
TaskSchema.pre('save', function (next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date()
  }
  if (this.isModified('completed') && !this.completed) {
    this.completedAt = null
  }
  next()
})

// Virtual: days until deadline
TaskSchema.virtual('daysUntilDeadline').get(function () {
  return Math.ceil((this.deadline - new Date()) / (1000 * 60 * 60 * 24))
})

// Virtual: is overdue
TaskSchema.virtual('isOverdue').get(function () {
  return !this.completed && this.deadline < new Date()
})

TaskSchema.set('toJSON', { virtuals: true })
TaskSchema.set('toObject', { virtuals: true })

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)
