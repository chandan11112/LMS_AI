# 🎓 LearnKro — AI-Powered LMS

LearnKro is a full-stack AI-powered Learning Management System built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) using **Vite** for the frontend. It integrates the **Groq API** for AI-powered quiz generation and chatbot assistance.

---

## 🚀 Features

- **AI Quiz Generator** — Generate topic-based MCQ quizzes using Groq API (Llama 3)
- **AI Chatbot Assistant** — 24/7 platform guidance via intelligent chatbot
- **Course Management** — Full CRUD with sections, lectures, and video upload via Cloudinary
- **Role-Based Access** — Student, Instructor, Admin roles with protected routes
- **Video Streaming** — Cloudinary-hosted lectures with progress tracking
- **Admin Panel** — Approve instructors, manage users, toggle course visibility
- **Progress Tracking** — Per-lecture completion, overall course progress
- **Ratings & Reviews** — Students can rate and review enrolled courses

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6 |
| State | Zustand, TanStack Query |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq API (Llama 3) |
| Media | Cloudinary |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |

---

## 📁 Project Structure

```
learnkro/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── server.js        # Entry point
│   └── .env.example     # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── layout/  # Navbar, Footer, DashboardLayout
│   │   │   ├── chatbot/ # AI Chatbot widget
│   │   │   └── course/  # CourseCard
│   │   ├── context/     # Zustand store (auth)
│   │   ├── pages/       # Page components
│   │   │   ├── auth/    # Login, Register
│   │   │   ├── student/ # Dashboard, Courses, Quiz, Profile
│   │   │   ├── instructor/ # Dashboard, Create/Manage courses
│   │   │   └── admin/   # Dashboard, Users, Courses
│   │   ├── utils/       # Axios API client
│   │   └── App.jsx      # Router & providers
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Cloudinary account (free tier)

### 1. Clone / Extract the project
```bash
cd learnkro
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy env file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

**Backend** (from `/backend`):
```bash
npm run dev
# Starts on http://localhost:5000
```

**Frontend** (from `/frontend`):
```bash
npm run dev
# Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnkro
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List published courses |
| GET | `/api/courses/:id` | Get course detail |
| POST | `/api/courses` | Create course (Instructor) |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| POST | `/api/courses/:id/sections` | Add section |
| POST | `/api/courses/:id/sections/:sectionId/lectures` | Add lecture |

### Quiz (AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/generate` | Generate AI quiz |
| GET | `/api/quiz` | List quizzes |
| GET | `/api/quiz/:id` | Get quiz |
| POST | `/api/quiz/:id/submit` | Submit answers |
| GET | `/api/quiz/my-results` | My quiz history |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/chat` | Chat with AI assistant |
| GET | `/api/chatbot/topics` | Quick help topics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform analytics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/approve` | Approve instructor |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/courses` | All courses |
| PUT | `/api/admin/courses/:id/publish` | Toggle publish |

---

## 🎭 Demo Credentials

You can seed these users manually or register them:

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | password123 |
| Instructor | instructor@demo.com | password123 |
| Admin | admin@demo.com | password123 |

---

## 🌟 Key Highlights

1. **AI Quiz Generator**: Uses Groq's Llama 3 model to generate 5–20 MCQ questions on any topic with difficulty levels, timing, explanations, and instant scoring.

2. **AI Chatbot**: Context-aware assistant with conversation history, platform guidance, and quick-prompt chips.

3. **Video Upload**: Instructors can upload video lectures up to 500MB to Cloudinary with automatic duration detection.

4. **Progress Tracking**: Per-lecture completion tracking with percentage calculation and completion certificates (planned).

5. **Role-Based Dashboards**: Separate UI experiences for Students, Instructors, and Admins.

---

## 📦 Build for Production

```bash
# Build frontend
cd frontend && npm run build

# The /dist folder can be served statically
# Set NODE_ENV=production in backend .env
```

---

## 🛠️ Built With

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Groq API](https://console.groq.com/)
- [Cloudinary](https://cloudinary.com/)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Recharts](https://recharts.org/)

---

*Made with ❤️ — LearnKro LMS*
