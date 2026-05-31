import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Flower2, Home, Sparkles, X } from "lucide-react";

import { getOpenedVault } from "../../../lib/storage";
import { formatDate } from "../../../lib/formatDate";
import EnvelopeThumbnail from "../components/EnvelopeThumbnail";

export default function LetterViewPage() {
  const navigate = useNavigate();

  const [vault, setVault] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    const openedVault = getOpenedVault();

    if (!openedVault) {
      navigate("/unlock");
      return;
    }

    setVault(openedVault);
  }, [navigate]);

  if (!vault) return null;

  const letters = vault.letters || [];

  return (
    <>
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy/30 px-5 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2.5rem] border border-rose-100 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-rose-50 p-2 text-burgundy hover:bg-rose-100"
              aria-label="Close letter"
            >
              <X size={20} />
            </button>

            <LetterPopupCard letter={selectedLetter} />
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
            <Flower2 size={16} />
            Private garden unlocked
          </p>

          <h1 className="font-serif text-5xl font-bold text-burgundy">
            {vault.name}
          </h1>

          {vault.description && (
            <p className="mx-auto mt-3 max-w-2xl text-rose-950/70">
              {vault.description}
            </p>
          )}

          {vault.from && (
            <p className="mt-3 text-sm font-semibold text-rose-900/70">
              From {vault.from}
            </p>
          )}
        </div>

        {letters.length === 0 ? (
          <EmptyUnlockedGarden />
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="font-serif text-3xl font-bold text-burgundy">
                Letters waiting for you
              </h2>

              <p className="mt-2 text-rose-950/70">
                This private garden contains {letters.length} letter
                {letters.length !== 1 ? "s" : ""}. Click an envelope to read it.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {letters.map((letter, index) => (
                <ReceiverLetterCard
                  key={letter.id}
                  letter={letter}
                  index={index}
                  onOpen={setSelectedLetter}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
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
            <ArrowLeft size={18} />
            Open another garden
          </Link>
        </div>
      </section>
    </>
  );
}

function ReceiverLetterCard({ letter, index, onOpen }) {
  const styleConfig = letter.styleConfig || {};
  const themeId = styleConfig.theme?.id || "rose";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-rose-100 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-white">
      <div className="mb-4">
        <span className="mb-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-burgundy">
          Letter {index + 1}
        </span>

        <h3 className="font-serif text-2xl font-bold leading-tight text-burgundy">
          {letter.title || "Untitled letter"}
        </h3>

        <p className="mt-1 text-xs text-rose-900/50">
          {themeId} theme · {formatDate(letter.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(letter)}
        className="block w-full text-left"
      >
        <EnvelopeThumbnail letter={letter} />
      </button>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-rose-950/65">
        {letter.recipientName && (
          <span className="rounded-full bg-rose-50 px-3 py-1">
            To: {letter.recipientName}
          </span>
        )}

        {letter.isAnonymous ? (
          <span className="rounded-full bg-rose-50 px-3 py-1">
            From: Anonymous
          </span>
        ) : (
          letter.senderName && (
            <span className="rounded-full bg-rose-50 px-3 py-1">
              From: {letter.senderName}
            </span>
          )
        )}
      </div>
    </article>
  );
}

function LetterPopupCard({ letter }) {
  const styleConfig = letter.styleConfig || {};

  const backgroundColor = styleConfig.paper?.backgroundColor || "#fff7ed";
  const textColor = styleConfig.typography?.textColor || "#7f1d1d";
  const bodyFont = styleConfig.typography?.bodyFont || "Playfair Display";

  const themeSymbol =
    styleConfig.theme?.id === "midnight"
      ? "☾"
      : styleConfig.theme?.id === "lavender"
        ? "✦"
        : "♡";

  return (
    <article className="rounded-[2rem] border border-rose-100 bg-white/80 p-5">
      <div
        className="min-h-[32rem] rounded-[1.7rem] border border-rose-100 p-8 md:p-12"
        style={{
          backgroundColor,
          color: textColor,
          fontFamily: `"${bodyFont}", serif`,
        }}
      >
        <div className="mb-10 flex items-center justify-between text-current opacity-80">
          <span className="text-3xl">♡</span>
          <span className="font-script text-4xl">{themeSymbol}</span>
        </div>

        <div className="mb-8 text-sm opacity-80">
          {letter.recipientName && <p>To: {letter.recipientName}</p>}

          {letter.isAnonymous ? (
            <p>From: Anonymous</p>
          ) : (
            letter.senderName && <p>From: {letter.senderName}</p>
          )}
        </div>

        <h2 className="font-serif text-4xl font-bold">
          {letter.title || "Untitled letter"}
        </h2>

        <p className="mt-8 whitespace-pre-line text-xl leading-10">
          {letter.content}
        </p>
      </div>
    </article>
  );
}

function EmptyUnlockedGarden() {
  return (
    <div className="glass-card rounded-[2rem] p-10 text-center shadow-soft">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        <Flower2 size={28} />
      </div>

      <h2 className="font-serif text-3xl font-bold text-burgundy">
        This private garden is empty
      </h2>

      <p className="mx-auto mt-3 max-w-md text-rose-950/70">
        The code is valid, but there are no letters inside this garden yet.
      </p>
    </div>
  );
}