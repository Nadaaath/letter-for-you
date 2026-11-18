import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../features/landing/pages/LandingPage";
import DashboardPage from "../features/letters/pages/DashboardPage";
import LetterEditorPage from "../features/letters/pages/LetterEditorPage";
import UnlockLetterPage from "../features/letters/pages/UnlockLetterPage";
import LetterViewPage from "../features/letters/pages/LetterViewPage";
import VaultDetailPage from "../features/letters/pages/VaultDetailPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/vaults/:vaultId" element={<VaultDetailPage />} />
      <Route path="/vaults/:vaultId/letters/new" element={<LetterEditorPage />} />
      <Route path="/unlock" element={<UnlockLetterPage />} />
      <Route path="/letter/opened" element={<LetterViewPage />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
