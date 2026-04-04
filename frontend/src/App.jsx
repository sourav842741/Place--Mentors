import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import useAuth from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "sonner";
import Profile from "./pages/Profile";
import QuizPage from "./pages/QuizPage";
import Pricing from "./pages/Pricing";
import InterviewHistory from "./pages/InterviewHistory";
import InterviewReport from "./pages/InterviewReport";
import Leaderboard from "./pages/Leaderboard";
import AIPlanner from "./pages/AIPlanner";
import PlannerHistory from "./pages/PlannerHistory";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeGenerator from "./pages/ResumeGenerator";

function App() {
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <>
      {/*  Toaster must be inside */}
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<QuizPage />} />
           <Route path="/pricing" element={<Pricing />} />
           <Route path="/history" element={<InterviewHistory />} />
           <Route path="/report/:id" element={<InterviewReport />} />
           <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/ai-planner" element={<AIPlanner />} />
            <Route path="/planner-history" element={<PlannerHistory />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/resume-generator" element={<ResumeGenerator />} />
            <Route path="/ai-planner/:id" element={<AIPlanner />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
