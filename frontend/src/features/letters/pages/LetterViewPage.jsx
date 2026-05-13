import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Home, Sparkles } from "lucide-react";

import { getOpenedLetter } from "../../../lib/storage";

export default function LetterViewPage() {
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);

  useEffect(() => {
    const openedLetter = getOpenedLetter();

    if (!openedLetter) {
      navigate("/unlock");
      return;
    }

    setLetter(openedLetter);
  }, [navigate]);

  if (!letter) return null;

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8 text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
          <Sparkles size={16} />
          Letter unlocked
        </p>

        <h1 className="font-serif text-5xl font-bold text-burgundy">
          This letter is for you
        </h1>

        {letter.from && (
          <p className="mt-3 text-rose-950/70">From {letter.from}</p>
        )}
      </div>

      <article className="rounded-[2.5rem] border border-rose-100 bg-white/80 p-5 shadow-soft">
        <div
          className="min-h-[30rem] rounded-[2rem] border border-rose-100 p-8 md:p-12"
          style={{
            backgroundColor: letter.backgroundColor,
            color: letter.textColor,
            fontFamily: `"${letter.fontFamily}", serif`,
          }}
        >
          <div className="mb-8 flex justify-between text-current opacity-80">
            <Heart fill="currentColor" />
            <span className="font-script text-4xl">For you</span>
          </div>

          <h2 className="text-4xl font-bold">{letter.title}</h2>

          <p className="mt-8 whitespace-pre-line text-xl leading-10">
            {letter.content}
          </p>
        </div>
      </article>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90"
        >
          <Home size={18} />
          Back home
        </Link>

        <Link
          to="/unlock"
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-6 py-3 font-semibold text-burgundy hover:bg-rose-50"
        >
          Open another letter
        </Link>
      </div>
    </section>
  );
}