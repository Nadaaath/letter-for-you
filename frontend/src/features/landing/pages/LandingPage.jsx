import { Link } from "react-router-dom";
import {
  Flower2,
  Heart,
  KeyRound,
  LockKeyhole,
  PenLine,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_0.9fr]">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />

        <div className="relative z-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
            <Sparkles size={16} />
            Private letters, beautifully sealed
          </p>

          <h1 className="max-w-4xl font-serif text-6xl font-bold leading-tight text-burgundy md:text-7xl">
            Send a secret garden of letters to someone special.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-rose-950/70">
            Letter For You lets you create private gardens, write aesthetic
            letters, seal them, and share everything through one secret access
            code.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-burgundy px-7 py-4 font-semibold text-white shadow-soft hover:opacity-90"
            >
              <PenLine size={18} />
              Start writing
            </Link>

            <Link
              to="/unlock"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-7 py-4 font-semibold text-burgundy hover:bg-rose-50"
            >
              <KeyRound size={18} />
              Open a garden
            </Link>
          </div>
        </div>

        <HeroPreview />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
            <Flower2 size={16} />
            How it works
          </p>

          <h2 className="font-serif text-5xl font-bold text-burgundy">
            One code. Many letters.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-rose-950/70">
            Create a private garden for one person, add as many sealed letters
            as you want, then share one access code.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            number="01"
            icon={<Flower2 size={24} />}
            title="Create a private garden"
            text="Make one garden for someone special, a birthday, a memory, or a collection of open-when letters."
          />

          <StepCard
            number="02"
            icon={<PenLine size={24} />}
            title="Write and seal letters"
            text="Customize the letter style, envelope, colors, flowers, icons, and then seal it permanently."
          />

          <StepCard
            number="03"
            icon={<KeyRound size={24} />}
            title="Share one secret code"
            text="The receiver enters the code and finds every letter waiting inside their private garden."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            icon={<LockKeyhole size={24} />}
            title="Private by design"
            text="Writers manage only their own gardens. Receivers do not need an account; they only need the secret code."
          />

          <FeatureCard
            icon={<Sparkles size={24} />}
            title="Aesthetic customization"
            text="Choose themes, envelopes, fonts, colors, flowers, and icons to make every letter feel personal."
          />

          <FeatureCard
            icon={<Heart size={24} />}
            title="Sealed letters"
            text="Once a letter is sealed, it cannot be edited. It feels more meaningful, like a real message."
          />

          <FeatureCard
            icon={<KeyRound size={24} />}
            title="Open-once option"
            text="Some letters can be opened only once, making them feel even more intimate and special."
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center">
        <div className="glass-card rounded-[2.5rem] p-10 shadow-soft">
          <h2 className="font-serif text-5xl font-bold text-burgundy">
            Ready to write something unforgettable?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-rose-950/70">
            Start a private garden, seal your first letter, and share it with a
            code made only for them.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-burgundy px-7 py-4 font-semibold text-white shadow-soft hover:opacity-90"
            >
              Create your garden
            </Link>

            <Link
              to="/unlock"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-7 py-4 font-semibold text-burgundy hover:bg-rose-50"
            >
              I have a code
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroPreview() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-md">
      <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-rose-200/60 blur-2xl" />
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-200/60 blur-2xl" />

      <div className="relative rounded-[2.5rem] border border-rose-100 bg-white/75 p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-burgundy">
            Private Garden
          </span>

          <span className="text-2xl">🌸</span>
        </div>

        <div className="rounded-[2rem] bg-rose-50/70 p-5">
          <div className="mx-auto mb-6 h-36 w-[85%] rounded-xl bg-[#f5d0d8] shadow-lg">
            <div
              className="h-full w-full rounded-xl"
              style={{
                clipPath: "polygon(0 0, 50% 58%, 100% 0)",
                backgroundColor: "#efb5c4",
              }}
            />
          </div>

          <div className="space-y-3">
            <MiniLetter title="Open when you miss me" />
            <MiniLetter title="Open when you need courage" />
            <MiniLetter title="Open on your birthday" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Secret code
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-burgundy">
            ROSE-F0CE44
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniLetter({ title }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-burgundy shadow-sm">
      <span>{title}</span>
      <span>✦</span>
    </div>
  );
}

function StepCard({ number, icon, title, text }) {
  return (
    <div className="glass-card rounded-[2rem] p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-burgundy">
          {icon}
        </div>

        <span className="font-serif text-3xl font-bold text-rose-200">
          {number}
        </span>
      </div>

      <h3 className="font-serif text-2xl font-bold text-burgundy">{title}</h3>

      <p className="mt-3 leading-7 text-rose-950/70">{text}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="glass-card rounded-[2rem] p-6 shadow-soft">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        {icon}
      </div>

      <h3 className="font-serif text-2xl font-bold text-burgundy">{title}</h3>

      <p className="mt-3 leading-7 text-rose-950/70">{text}</p>
    </div>
  );
}