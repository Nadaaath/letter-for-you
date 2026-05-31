import { envelopeOptions } from "../data/envelopeOptions";

export default function EnvelopeSelector({ selectedEnvelopeId, onSelectEnvelope }) {
  return (
    <div className="glass-card rounded-[2rem] p-6 shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-burgundy">
        Choose an envelope
      </h2>

      <p className="mt-2 text-sm text-rose-950/65">
        Pick how the outside of your letter should feel.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {envelopeOptions.map((envelope) => (
          <button
            key={envelope.id}
            type="button"
            onClick={() => onSelectEnvelope(envelope)}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedEnvelopeId === envelope.id
                ? "border-burgundy bg-rose-50"
                : "border-rose-100 bg-white/70 hover:bg-rose-50"
            }`}
          >
            <div className="relative mb-3 h-20 overflow-hidden rounded-xl border border-white/80">
              <div
                className="absolute inset-0"
                style={{ backgroundColor: envelope.color }}
              />
              <div
                className="absolute left-0 right-0 top-0 h-12 origin-top rotate-45"
                style={{ backgroundColor: envelope.flapColor }}
              />
              <div className="absolute bottom-2 right-3 text-xl">
                {envelope.seal === "heart"
                  ? "♡"
                  : envelope.seal === "star"
                    ? "☆"
                    : envelope.seal === "wax"
                      ? "●"
                      : ""}
              </div>
            </div>

            <p className="font-semibold text-burgundy">{envelope.name}</p>
            <p className="text-sm text-rose-950/60">
              {envelope.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}