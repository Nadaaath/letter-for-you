import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";

import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import DashboardPage from "../features/letters/pages/DashboardPage";
import LetterEditorPage from "../features/letters/pages/LetterEditorPage";
import UnlockLetterPage from "../features/letters/pages/UnlockLetterPage";
import LetterViewPage from "../features/letters/pages/LetterViewPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/unlock" element={<UnlockLetterPage />} />
      <Route path="/letter/opened" element={<LetterViewPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/letters/new"
        element={
          <ProtectedRoute>
            <LetterEditorPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}