import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { socket } from "./socket";
import useAuth from "./hooks/useAuth";
import useSettings from "./hooks/useSettings";

import {
  battleStart,
  battleWinner,
  battleDraw,
  battleFailed,
  battleResult,
  updateOpponentCode,
} from "./redux/battleSlice";

/* Pages */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Jobs from "./pages/Jobs";
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
import JobDetailsPage from "./pages/JobDetailsPage";
import CompanyPage from "./pages/CompanyPage";
import AllCompanies from "./pages/AllCompanies";
import AISearchPage from "./pages/AISearchPage";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import About from "./pages/About";
import CodeEditor from "./pages/CodeEditor";
import LandingPage from "./pages/LandingPage";
import DoubtChatPage from "./pages/DoubtChatPage";
import PotdPage from "./pages/PotdPage.jsx";
import CodingPotdPage from "./pages/CodingPotdPage.jsx";
import YoutubeSummaryPage from "./pages/YoutubeSummaryPage";
import Resources from "./pages/Resources";
import UsersPage from "./pages/UsersPage";
import BattlePage from "./pages/BattlePage.jsx";
import TaskBoard from "./pages/TaskBoard";
import ShareTask from "./pages/ShareTask";
import FruitboxFlex from "./pages/FruitboxFlex";
import AICoach from "./pages/AICoach";
import MaintenancePage from "./pages/MaintenancePage";
import AIVoiceCoach from "./pages/AIVoiceCoach";
import CallHistory from "./pages/CallHistory";
import CallReport from "./pages/CallReport";
import CertificateVerifyPage from "./pages/CertificateVerifyPage.jsx";
import PlacementPredictor from "./pages/PlacementPredictor";

/* Components */
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import InstallPopup from "./components/InstallPopup";
import NotFoundPage from "./components/NotFoundPage";
import NotificationPopup from "./components/NotificationPopup.jsx";
import SplashScreen from "./components/SplashScreen";
import { Toaster } from "sonner";

/* Admin Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminCreatePotd from "./pages/admin/AdminCreatePotd";
import AdminCreateCpotd from "./pages/admin/AdminCreateCpotd";
import AdminEmailCenter from "./pages/admin/AdminEmailCenter";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMaintenanceManager from "./pages/admin/AdminMaintenanceManager.jsx";
import AdminSecurity from "./pages/admin/AdminSecurity";
import Certificates from "./pages/Certificates.jsx";
import CookieConsent from "./components/CookieConsent";

function App() {
  const { getCurrentUser } = useAuth();
  const { user, loading } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  /* SETTINGS */
  const {
    data: settingsData,
    isLoading: settingsLoading,
  } = useSettings();

  const maintenanceActive =
    settingsData?.data?.maintenanceMode;

  const isAdminRoute =
    location.pathname.startsWith("/admin");

 useEffect(() => {
  const publicVerifyPage =
    location.pathname.startsWith("/verify/");

  if (!loading && user && !publicVerifyPage) {
    const seen = sessionStorage.getItem("seenSplash");

    if (!seen && location.pathname !== "/splash") {
      sessionStorage.setItem("seenSplash", "true");
      navigate("/splash");
    }
  }
}, [user, loading, location.pathname]);

  /* LOAD USER */
  useEffect(() => {
    getCurrentUser();
  }, []);

  /* SOCKET JOIN */
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  /* POPUPS */
  const [showPopup, setShowPopup] =
    useState(false);

  const [popupData, setPopupData] =
    useState(null);

  const [popupType, setPopupType] =
    useState("");

  useEffect(() => {
    const handleFriendRequest = (
      data
    ) => {
      setPopupData(data.requester);
      setPopupType("friend");
      setShowPopup(true);
    };

    const handleChallenge = (
      data
    ) => {
      setPopupData(
        data.challenger || data
      );
      setPopupType("challenge");
      setShowPopup(true);
    };

    socket.on(
      "friend_request_received",
      handleFriendRequest
    );

    socket.on(
      "challenge_received",
      handleChallenge
    );

    return () => {
      socket.off(
        "friend_request_received",
        handleFriendRequest
      );

      socket.off(
        "challenge_received",
        handleChallenge
      );
    };
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    setPopupData(null);
    setPopupType("");
  };

  /* BATTLE SOCKETS */
  useEffect(() => {
    const handleBattleStart = (
      data
    ) => {
      dispatch(battleStart(data));

      navigate(
        `/battle/${data.roomId}`,
        {
          state: {
            problem: data.problem,
            opponent:
              data.opponent,
            timeLimit:
              data.timeLimit,
          },
        }
      );
    };

    socket.on(
      "battle:start",
      handleBattleStart
    );

    socket.on(
      "battle:winner",
      (data) =>
        dispatch(
          battleWinner(data)
        )
    );

    socket.on(
      "battle:draw",
      () =>
        dispatch(
          battleDraw()
        )
    );

    socket.on(
      "battle:failed",
      () =>
        dispatch(
          battleFailed()
        )
    );

    socket.on(
      "battle:result",
      (data) =>
        dispatch(
          battleResult(data)
        )
    );

    socket.on(
      "opponent_code_change",
      (data) =>
        dispatch(
          updateOpponentCode(data)
        )
    );

    return () => {
      socket.off(
        "battle:start",
        handleBattleStart
      );
      socket.off(
        "battle:winner"
      );
      socket.off(
        "battle:draw"
      );
      socket.off(
        "battle:failed"
      );
      socket.off(
        "battle:result"
      );
      socket.off(
        "opponent_code_change"
      );
    };
  }, [dispatch, navigate]);

  /* LOADER */
  if (loading || settingsLoading) {
    return null;
  }

  /* MAINTENANCE BLOCK
     ADMIN ROUTES ALWAYS ALLOWED */
  if (
    maintenanceActive &&
    !isAdminRoute &&
    user?.role !== "admin" &&
    user?.role !== "superadmin"
  ) {
    return <MaintenancePage />;
  }

  return (
    <>
      <InstallPopup />
      <CookieConsent />
      <Toaster
        position="top-right"
        richColors
      />

      {showPopup && (
        <NotificationPopup
          type={popupType}
          data={popupData}
          onClose={closePopup}
        />
      )}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify/:id" element={<CertificateVerifyPage />} />

        {/* ADMIN */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/create-potd" element={<AdminCreatePotd />} />
            <Route path="/admin/create-cpotd" element={<AdminCreateCpotd />} />
            <Route path="/admin/email-center" element={<AdminEmailCenter />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/maintenance-manager" element={<AdminMaintenanceManager />} />
          </Route>
        </Route>

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/history" element={<InterviewHistory />} />
          <Route path="/report/:id" element={<InterviewReport />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/planner-history" element={<PlannerHistory />} />
          <Route path="/ai-planner/:id" element={<AIPlanner />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/resume-generator" element={<ResumeGenerator />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/companies" element={<AllCompanies />} />
          <Route path="/company/:name?" element={<CompanyPage />} />
          <Route path="/ai-search" element={<AISearchPage />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/about" element={<About />} />
          <Route path="/doubts" element={<DoubtChatPage />} />
          <Route path="/potd" element={<PotdPage />} />
          <Route path="/coding-potd" element={<CodingPotdPage />} />
          <Route path="/youtube-summary" element={<YoutubeSummaryPage />} />
          <Route path="/dashboard/tasks" element={<TaskBoard />} />
          <Route path="/dashboard/fruitbox-flex" element={<FruitboxFlex />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/battle/:roomId" element={<BattlePage />} />
          <Route path="/share/task/:shareId" element={<ShareTask />} />
          <Route path="/ai-voice-coach" element={<AIVoiceCoach />} />
          <Route path="/placement-predictor" element={<PlacementPredictor />} />
          <Route path="/voice-history" element={<CallHistory />} />
          <Route path="/voice-report/:id" element={<CallReport />} />
        </Route>

        {/* SPECIAL */}
        <Route
          path="/maintenance"
          element={<MaintenancePage />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;