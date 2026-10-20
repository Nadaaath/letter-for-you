import { Link } from "react-router-dom";
import { Heart, PenLine, KeyRound } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-rose-100/80 bg-cream/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-burgundy shadow-sm">
            <Heart size={20} fill="currentColor" />
          </span>
          <div>
            <p className="font-serif text-xl font-bold text-burgundy">Letter For You</p>
            <p className="-mt-1 hidden text-xs text-rose-700 sm:block">private letters, softly delivered</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/unlock" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-burgundy hover:bg-rose-100">
            <KeyRound size={16} /> <span className="hidden sm:inline">I have a code</span>
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90">
            <PenLine size={16} /> My gardens
          </Link>
        </div>
      </nav>
    </header>
  );
}
