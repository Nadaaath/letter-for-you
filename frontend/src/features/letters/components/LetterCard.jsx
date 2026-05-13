import { Calendar, LockKeyhole, Sparkles, Trash2 } from "lucide-react";
import { formatDate } from "../../../lib/formatDate";

export default function LetterCard({ letter, onDelete }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-rose-100 bg-white/75 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-white">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-100/70 blur-2xl transition group-hover:bg-rose-200/80" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-burgundy">
              <Sparkles size={13} />
              {letter.theme || "rose"} theme
            </div>

            <h2 className="font-serif text-2xl font-bold text-burgundy">
              {letter.title}
            </h2>
          </div>

          <button
            onClick={() => onDelete(letter.id)}
            className="rounded-full p-2 text-rose-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            title="Delete letter"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-rose-950/70">
          {letter.content}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rose-100 pt-4 text-sm text-rose-900/70">
          <span className="flex items-center gap-2">
            <Calendar size={15} />
            {formatDate(letter.createdAt)}
          </span>

          {letter.hasAccessCode ? (
            <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <LockKeyhole size={13} />
              Code generated
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              No code yet
            </span>
          )}
        </div>
      </div>
    </article>
  );
}