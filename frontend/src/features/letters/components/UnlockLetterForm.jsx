import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, KeyRound, Loader2, LockKeyhole } from "lucide-react";

import { unlockLetter } from "../services/lettersApi";
import { saveOpenedLetter } from "../../../lib/storage";

export default function UnlockLetterForm() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter your secret code.");
      return;
    }

    try {
      setLoading(true);

      const letter = await unlockLetter(code);

      saveOpenedLetter(letter);
      navigate("/letter/opened");
    } catch (err) {
      setError(err.response?.data?.message || "Could not open this letter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card w-full overflow-hidden rounded-[2rem] p-8 text-center shadow-soft"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        <LockKeyhole size={34} />
      </div>

      <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
        <Heart size={15} fill="currentColor" />
        Someone left you a letter
      </p>

      <h1 className="font-serif text-5xl font-bold text-burgundy">
        Enter your secret code
      </h1>

      <p className="mx-auto mt-4 max-w-md text-rose-950/70">
        If someone shared a Letter For You code with you, enter it below to
        unlock your private message.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="relative">
          <KeyRound
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
          />

          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ROSE-F0CE44"
            className="w-full rounded-2xl border border-rose-100 bg-white/80 py-4 pl-12 pr-4 text-center font-mono text-xl font-bold uppercase tracking-widest text-burgundy outline-none focus:border-burgundy"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-burgundy py-4 font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Opening...
          </>
        ) : (
          "Open letter"
        )}
      </button>
    </form>
  );
}