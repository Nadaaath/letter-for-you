import { envelopeOptions } from "../data/envelopeOptions";
import { iconOptions } from "../data/iconOptions";

export default function EnvelopeThumbnail({ letter }) {
  const styleConfig = letter?.styleConfig || {};

  const selectedEnvelope =
    envelopeOptions.find(
      (envelope) => envelope.id === styleConfig.envelope?.style
    ) || envelopeOptions[0];

  const selectedIcons = styleConfig.decorations?.icons || [];

  const iconSymbols = selectedIcons
    .map((id) => iconOptions.find((icon) => icon.id === id)?.symbol)
    .filter(Boolean);

  const recipient = letter?.recipientName || "Someone";

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/80 to-rose-50/70">
      <div className="absolute inset-0 rounded-[2rem] border border-rose-100" />

      <div className="absolute left-1/2 top-1/2 h-32 w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-md shadow-xl">
        <div
          className="absolute inset-0 rounded-md"
          style={{ backgroundColor: selectedEnvelope.color }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: selectedEnvelope.color,
            clipPath: "polygon(0 0, 50% 58%, 100% 0)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: selectedEnvelope.flapColor,
            clipPath: "polygon(0 0, 50% 50%, 0 100%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: selectedEnvelope.flapColor,
            clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: selectedEnvelope.color,
            clipPath: "polygon(0 100%, 50% 50%, 100% 100%)",
          }}
        />

        {selectedEnvelope.seal !== "none" && (
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-burgundy text-white shadow-md">
            {selectedEnvelope.seal === "heart"
              ? "♡"
              : selectedEnvelope.seal === "star"
                ? "☆"
                : selectedEnvelope.seal === "wax"
                  ? "●"
                  : "✦"}
          </div>
        )}

        <div className="absolute right-5 top-4 flex gap-1 text-sm text-white/80">
          {(iconSymbols.length > 0 ? iconSymbols : ["♡"])
            .slice(0, 3)
            .map((symbol, index) => (
              <span key={`${symbol}-${index}`}>{symbol}</span>
            ))}
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-script text-2xl text-white/90">
          To: {recipient}
        </div>
      </div>
    </div>
  );
}