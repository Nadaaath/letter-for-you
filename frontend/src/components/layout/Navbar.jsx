import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, PenLine } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-rose-100/80 bg-cream/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-burgundy shadow-sm">
            <Heart size={20} fill="currentColor" />
          </span>

          <div>
            <p className="font-serif text-xl font-bold text-burgundy">
              Letter For You
            </p>
            <p className="-mt-1 hidden text-xs text-rose-700 sm:block">
              private letters, softly delivered
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-rose-900 sm:inline">
                Hi, {user?.name}
              </span>

              <Link
                to="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-semibold text-burgundy hover:bg-rose-100"
              >
                Vault
              </Link>

              <Link
  to="/dashboard"
  className="hidden items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 sm:flex"
>
  <PenLine size={16} />
  My gardens
</Link>

              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-burgundy hover:bg-rose-100"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-burgundy hover:bg-rose-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                Start writing
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}