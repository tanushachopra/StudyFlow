# 📚 Smart Study Planner — AI-Powered

A production-ready, full-stack AI study planner built with Next.js, MongoDB, and OpenAI.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd smart-study-planner
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/studyplanner
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure
```
smart-study-planner/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   ├── (dashboard)/
│   │   ├── layout.jsx
│   │   ├── dashboard/page.jsx
│   │   ├── tasks/page.jsx
│   │   ├── planner/page.jsx
│   │   ├── progress/page.jsx
│   │   └── assistant/page.jsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.js
│   │   │   └── login/route.js
│   │   ├── tasks/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   ├── planner/
│   │   │   └── generate/route.js
│   │   └── assistant/
│   │       └── route.js
│   ├── globals.css
│   └── layout.jsx
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── ProgressBar.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── DashboardLayout.jsx
│   ├── dashboard/
│   │   ├── StatsCard.jsx
│   │   ├── TodayTasks.jsx
│   │   └── WeeklyPlan.jsx
│   ├── tasks/
│   │   ├── TaskCard.jsx
│   │   ├── TaskForm.jsx
│   │   └── TaskList.jsx
│   └── assistant/
│       ├── ChatMessage.jsx
│       └── ChatInput.jsx
├── lib/
│   ├── db.js
│   ├── auth.js
│   ├── openai.js
│   └── utils.js
├── models/
│   ├── User.js
│   ├── Task.js
│   └── StudyPlan.js
├── hooks/
│   ├── useAuth.js
│   ├── useTasks.js
│   └── useStudyPlan.js
├── store/
│   └── authStore.js
└── middleware.js
```
