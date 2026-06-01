import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./context/authStore";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Public pages
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import CourseLearnPage from "./pages/student/CourseLearnPage";
import QuizPage from "./pages/student/QuizPage";
import QuizGeneratorPage from "./pages/student/QuizGeneratorPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";

// Instructor pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCoursesPage from "./pages/instructor/InstructorCoursesPage";
import CreateCoursePage from "./pages/instructor/CreateCoursePage";
import ManageCoursePage from "./pages/instructor/ManageCoursePage";
import InstructorStudentsPage from "./pages/instructor/InstructorStudentsPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// FIX: ProtectedRoute correctly handles all auth states
const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to correct dashboard instead of home
    const dashMap = { admin: "/admin", instructor: "/instructor", student: "/dashboard" };
    return <Navigate to={dashMap[user.role] || "/"} replace />;
  }
  return children;
};

// Redirect logged-in users away from auth pages
const AuthRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (token && user) {
    const dashMap = { admin: "/admin", instructor: "/instructor", student: "/dashboard" };
    return <Navigate to={dashMap[user.role] || "/dashboard"} replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#111118",
              color: "#f1f1f1",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "#8b5cf6", secondary: "#fff" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

          {/* Student */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={["student"]}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="my-courses" element={<MyCoursesPage />} />
            <Route path="quiz-generator" element={<QuizGeneratorPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>

          {/* Course learning - fullscreen, no dashboard shell */}
          <Route path="/learn/:courseId" element={
            <ProtectedRoute roles={["student"]}>
              <CourseLearnPage />
            </ProtectedRoute>
          } />

          {/* Quiz */}
          <Route path="/quiz/:quizId" element={
            <ProtectedRoute><QuizPage /></ProtectedRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor" element={
            <ProtectedRoute roles={["instructor"]}>
              <DashboardLayout role="instructor" />
            </ProtectedRoute>
          }>
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCoursesPage />} />
            <Route path="courses/create" element={<CreateCoursePage />} />
            <Route path="courses/:id/manage" element={<ManageCoursePage />} />
            <Route path="students" element={<InstructorStudentsPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
