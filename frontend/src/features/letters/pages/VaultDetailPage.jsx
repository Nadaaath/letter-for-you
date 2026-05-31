import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Flower2,
  KeyRound,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteVaultLetter,
  generateVaultCode,
  getVaultById,
} from "../services/lettersApi";
import { formatDate } from "../../../lib/formatDate";
import CodeGeneratedBox from "../components/CodeGeneratedBox";
import EnvelopeThumbnail from "../components/EnvelopeThumbnail";

export default function VaultDetailPage() {
  const { vaultId } = useParams();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [vault, setVault] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState("");

  async function loadVault() {
    try {
      setLoading(true);
      setError("");

      const data = await getVaultById(vaultId);
      setVault(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load private garden");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCode() {
    try {
      setGeneratingCode(true);
      setGeneratedCode("");

      const response = await generateVaultCode(vaultId);

      setGeneratedCode(response.accessCode);
      setVault(response.vault);
    } catch (err) {
      alert(err.response?.data?.message || "Could not generate code");
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleDeleteLetter(letterId) {
    const confirmed = window.confirm("Delete this letter permanently?");

    if (!confirmed) return;

    try {
      await deleteVaultLetter(vaultId, letterId);

      setVault((currentVault) => ({
        ...currentVault,
        letters: currentVault.letters.filter((letter) => letter.id !== letterId),
        _count: {
          ...currentVault._count,
          letters: Math.max((currentVault._count?.letters || 1) - 1, 0),
        },
      }));

      if (selectedLetter?.id === letterId) {
        setSelectedLetter(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete letter");
    }
  }

  useEffect(() => {
    loadVault();
  }, [vaultId]);

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white/70 px-6 py-4 text-burgundy shadow-soft">
          <Loader2 className="animate-spin" size={20} />
          Loading private garden...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-[2rem] bg-red-50 p-8 text-red-700 shadow-soft">
          {error}
        </div>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm hover:bg-rose-50"
        >
          <ArrowLeft size={16} />
          Back to private gardens
        </Link>
      </section>
    );
  }

  if (!vault) return null;

  const letters = vault.letters || [];
  const lettersCount = vault._count?.letters ?? letters.length;

  return (
    <>
      {selectedLetter && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-burgundy/30 px-5 backdrop-blur-sm">
    <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-rose-100 bg-white p-6 shadow-2xl">
      <button
        onClick={() => setSelectedLetter(null)}
        className="absolute right-5 top-5 z-10 rounded-full bg-rose-50 p-2 text-burgundy hover:bg-rose-100"
        aria-label="Close letter preview"
      >
        <X size={20} />
      </button>

      <LetterPopupCard letter={selectedLetter} />
    </div>
  </div>
)}

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm hover:bg-rose-50"
        >
          <ArrowLeft size={16} />
          Back to private gardens
        </Link>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="glass-card rounded-[2rem] p-8 shadow-soft">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
              <Flower2 size={16} />
              Private garden
            </p>

            <h1 className="font-serif text-5xl font-bold text-burgundy">
              {vault.name}
            </h1>

            {vault.description && (
              <p className="mt-3 max-w-2xl text-rose-950/70">
                {vault.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-rose-900/75">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 font-semibold">
                <Calendar size={15} />
                Created {formatDate(vault.createdAt)}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 font-semibold">
                <Flower2 size={15} />
                {lettersCount} letter{lettersCount !== 1 ? "s" : ""}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${
                  vault.hasAccessCode
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <KeyRound size={15} />
                {vault.hasAccessCode ? "Code active" : "No code yet"}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 shadow-soft lg:w-80">
            <h2 className="font-serif text-2xl font-bold text-burgundy">
              Share this garden
            </h2>

            <p className="mt-2 text-sm leading-6 text-rose-950/70">
              Generate one access code for this whole private garden. The
              recipient will see all letters inside it.
            </p>

            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-burgundy px-5 py-3 font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              {generatingCode ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  Generate code
                </>
              )}
            </button>
          </div>
        </div>

        {generatedCode && (
          <div className="mb-8">
            <CodeGeneratedBox code={generatedCode} />
          </div>
        )}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-burgundy">
              Letters inside this garden
            </h2>
            <p className="mt-1 text-rose-950/70">
              Click an envelope to preview it. The content is not shown directly
              on this page.
            </p>
          </div>

          <Link
            to={`/vaults/${vaultId}/letters/new`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90"
          >
            <Plus size={18} />
            Add a letter
          </Link>
        </div>

        {letters.length === 0 ? (
          <EmptyLetters vaultId={vaultId} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {letters.map((letter) => (
              <GardenLetterCard
                key={letter.id}
                letter={letter}
                onDelete={handleDeleteLetter}
                onOpen={setSelectedLetter}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function GardenLetterCard({ letter, onDelete, onOpen }) {
  const styleConfig = letter.styleConfig || {};
  const themeId = styleConfig.theme?.id || "rose";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-rose-100 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-white">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-burgundy">
            {themeId} theme
          </span>

          <h3 className="font-serif text-2xl font-bold leading-tight text-burgundy">
            {letter.title || "Untitled letter"}
          </h3>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete(letter.id);
          }}
          className="rounded-full p-2 text-rose-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          title="Delete letter"
        >
          <Trash2 size={18} />
        </button>
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

        {letter.senderName && !letter.isAnonymous && (
          <span className="rounded-full bg-rose-50 px-3 py-1">
            From: {letter.senderName}
          </span>
        )}

        {letter.isAnonymous && (
          <span className="rounded-full bg-rose-50 px-3 py-1">Anonymous</span>
        )}

        <span className="rounded-full bg-rose-50 px-3 py-1">
          {formatDate(letter.createdAt)}
        </span>
      </div>
    </article>
  );
}

function LetterPopupCard({ letter }) {
  const styleConfig = letter.styleConfig || {};

  const backgroundColor =
    styleConfig.paper?.backgroundColor || "#fff7ed";

  const textColor =
    styleConfig.typography?.textColor || "#7f1d1d";

  const bodyFont =
    styleConfig.typography?.bodyFont || "Playfair Display";

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

function EmptyLetters({ vaultId }) {
  return (
    <div className="glass-card rounded-[2rem] p-10 text-center shadow-soft">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        <Flower2 size={28} />
      </div>

      <h3 className="font-serif text-3xl font-bold text-burgundy">
        This garden has no letters yet
      </h3>

      <p className="mx-auto mt-3 max-w-md text-rose-950/70">
        Add your first letter. Later, every letter in this garden will be opened
        with the same shared code.
      </p>

      <Link
        to={`/vaults/${vaultId}/letters/new`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90"
      >
        <Plus size={18} />
        Add first letter
      </Link>
    </div>
  );
}