import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-2">
      <div>
        <p className="mb-4 inline-flex rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
          A soft place for words that matter
        </p>

        <h1 className="font-serif text-5xl font-extrabold leading-tight text-burgundy md:text-7xl">
          Write a secret letter, beautifully.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-rose-950/75">
          Letter For You lets you create private aesthetic letters, style them
          with soft themes, and share them through a unique access code.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/register"
            className="rounded-full bg-burgundy px-7 py-3 font-semibold text-white shadow-soft hover:opacity-90"
          >
            Start writing
          </Link>

          <Link
            to="/unlock"
            className="rounded-full border border-rose-200 bg-white/70 px-7 py-3 font-semibold text-burgundy hover:bg-rose-50"
          >
            Open a letter
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[3rem] bg-rose-200/40 blur-3xl" />

        <div className="letter-paper relative rounded-[2rem] border border-rose-100 p-8 shadow-soft">
          <div className="mb-6 flex justify-between text-rose-400">
            <Heart fill="currentColor" />
            <span className="font-script text-3xl">For you</span>
          </div>

          <h2 className="font-serif text-3xl font-bold text-burgundy">
            Open when you need a reminder
          </h2>

          <p className="mt-5 whitespace-pre-line font-serif text-xl leading-9 text-rose-950/80">
            Some words are too precious for a normal message.{"\n\n"}
            So I kept them here, wrapped softly, waiting for you.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-rose-200 bg-white/60 p-4 text-center text-sm font-semibold text-burgundy">
            Secret code: ROSE-••••••
          </div>
        </div>
      </div>
    </section>
  );
}