import { Link } from "react-router-dom";
import {
  Calendar,
  Flower2,
  KeyRound,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { formatDate } from "../../../lib/formatDate";

export default function VaultCard({ vault, onDelete, onGenerateCode }) {
  const lettersCount = vault._count?.letters ?? 0;

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-rose-100 bg-white/75 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-white">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-100/80 blur-2xl transition group-hover:bg-rose-200" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-burgundy">
              <Flower2 size={13} />
              Private garden
            </div>

            <h2 className="font-serif text-2xl font-bold text-burgundy">
              {vault.name}
            </h2>

            {vault.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-rose-950/65">
                {vault.description}
              </p>
            )}
          </div>

          <button
            onClick={() => onDelete(vault.id)}
            className="rounded-full p-2 text-rose-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            title="Delete private garden"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-rose-900/70 sm:grid-cols-2">
          <span className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2">
            <Calendar size={15} />
            {formatDate(vault.createdAt)}
          </span>

          <span className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2">
            <Flower2 size={15} />
            {lettersCount} letter{lettersCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4">
          {vault.hasAccessCode ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <LockKeyhole size={13} />
              Access code active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              No access code yet
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/vaults/${vault.id}`}
            className="flex-1 rounded-full bg-burgundy px-5 py-3 text-center text-sm font-semibold text-white shadow-soft hover:opacity-90"
          >
            Open garden
          </Link>

          <button
            type="button"
            onClick={() => onGenerateCode(vault.id)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/80 px-5 py-3 text-sm font-semibold text-burgundy hover:bg-rose-50"
          >
            <KeyRound size={16} />
            Generate code
          </button>
        </div>
      </div>
    </article>
  );
}