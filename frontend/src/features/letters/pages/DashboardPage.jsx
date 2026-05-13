import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, PenLine, Search } from "lucide-react";

import LetterCard from "../components/LetterCard";
import { deleteLetter, getLetters } from "../services/lettersApi";

export default function DashboardPage() {
  const [letters, setLetters] = useState([]);
  const [filteredLetters, setFilteredLetters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLetters() {
    try {
      setLoading(true);
      setError("");

      const data = await getLetters();

      setLetters(data);
      setFilteredLetters(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load letters");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(letterId) {
    const confirmed = window.confirm("Delete this letter permanently?");

    if (!confirmed) return;

    try {
      await deleteLetter(letterId);

      const updatedLetters = letters.filter((letter) => letter.id !== letterId);

      setLetters(updatedLetters);
      setFilteredLetters(
        updatedLetters.filter((letter) => {
          const query = search.toLowerCase();
          return (
            letter.title.toLowerCase().includes(query) ||
            letter.content.toLowerCase().includes(query)
          );
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete letter");
    }
  }

  useEffect(() => {
    loadLetters();
  }, []);

  useEffect(() => {
    const result = letters.filter((letter) => {
      const query = search.toLowerCase();

      return (
        letter.title.toLowerCase().includes(query) ||
        letter.content.toLowerCase().includes(query)
      );
    });

    setFilteredLetters(result);
  }, [search, letters]);

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white/70 px-6 py-4 text-burgundy shadow-soft">
          <Loader2 className="animate-spin" size={20} />
          Loading your letters...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
            <Heart size={16} fill="currentColor" />
            Private vault
          </p>

          <h1 className="font-serif text-5xl font-bold text-burgundy">
            Letters you wrote
          </h1>

          <p className="mt-3 max-w-2xl text-rose-950/70">
            Manage the private letters you created. To open a letter someone sent you,
use its secret access code.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
  <Link
    to="/unlock"
    className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/70 px-6 py-3 font-semibold text-burgundy hover:bg-rose-50"
  >
    Open a letter with a code
  </Link>

  <Link
    to="/letters/new"
    className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90"
  >
    <PenLine size={18} />
    Write new letter
  </Link>
</div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your letters..."
            className="w-full rounded-2xl border border-rose-100 bg-white/75 py-3 pl-11 pr-4 text-burgundy outline-none shadow-sm focus:border-burgundy"
          />
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white/75 px-5 py-3 text-sm font-semibold text-burgundy shadow-sm">
          {letters.length} letter{letters.length !== 1 ? "s" : ""}
        </div>
      </div>

      {filteredLetters.length === 0 ? (
        <EmptyState hasLetters={letters.length > 0} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredLetters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ hasLetters }) {
  return (
    <div className="glass-card rounded-[2rem] p-10 text-center shadow-soft">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        <Heart size={28} fill="currentColor" />
      </div>

      <h2 className="font-serif text-3xl font-bold text-burgundy">
        {hasLetters ? "No matching letters" : "Your vault is still empty"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-rose-950/70">
        {hasLetters
          ? "Try searching with another title or word."
          : "Start by writing your first private letter and turn it into a soft little secret."}
      </p>

      {!hasLetters && (
        <Link
          to="/letters/new"
          className="mt-6 inline-flex rounded-full bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90"
        >
          Write your first letter
        </Link>
      )}
    </div>
  );
}