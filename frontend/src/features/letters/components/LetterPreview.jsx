import { Heart } from "lucide-react";
import { letterThemes } from "../data/letterThemes";
import { envelopeOptions } from "../data/envelopeOptions";
import { flowerOptions } from "../data/flowerOptions";
import { iconOptions } from "../data/iconOptions";

export default function LetterPreview({ letter }) {
  const styleConfig = letter.styleConfig || {};

  const selectedTheme =
    letterThemes.find((theme) => theme.id === styleConfig.theme?.id) ||
    letterThemes[0];

  const selectedEnvelope =
    envelopeOptions.find(
      (envelope) => envelope.id === styleConfig.envelope?.style
    ) || envelopeOptions[0];

  const backgroundColor =
    styleConfig.paper?.backgroundColor || selectedTheme.backgroundColor;

  const textColor = styleConfig.typography?.textColor || selectedTheme.textColor;

  const bodyFont = styleConfig.typography?.bodyFont || "Playfair Display";

  const selectedFlowers = styleConfig.decorations?.flowers || [];
  const selectedIcons = styleConfig.decorations?.icons || [];

  const flowerSymbols = selectedFlowers
    .map((id) => flowerOptions.find((flower) => flower.id === id)?.emoji)
    .filter(Boolean);

  const iconSymbols = selectedIcons
    .map((id) => iconOptions.find((icon) => icon.id === id)?.symbol)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <EnvelopePreview
        envelope={selectedEnvelope}
        recipientName={letter.recipientName}
        flowerSymbols={flowerSymbols}
        iconSymbols={iconSymbols}
      />

      <div className="rounded-[2rem] border border-rose-100 bg-white/75 p-5 shadow-soft">
        <div
          className="relative min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-rose-100 p-8 shadow-inner"
          style={{
            backgroundColor,
            color: textColor,
            fontFamily: `"${bodyFont}", serif`,
          }}
        >
          <DecorativeCorner
            flowerSymbols={flowerSymbols}
            iconSymbols={iconSymbols}
          />

          <div className="relative z-10">
            <div className="mb-6 flex justify-between text-current opacity-80">
              <Heart fill="currentColor" />
              <span className="font-script text-3xl">
                {selectedTheme.symbol}
              </span>
            </div>

            <div className="mb-6 text-sm opacity-80">
              <p>To: {letter.recipientName || "Someone special"}</p>
              <p>
                From:{" "}
                {letter.isAnonymous
                  ? "Anonymous"
                  : letter.senderName || "Someone who cares"}
              </p>
            </div>

            <h2 className="text-3xl font-bold">
              {letter.title || "Your letter title"}
            </h2>

            <p className="mt-6 whitespace-pre-line text-xl leading-9">
              {letter.content ||
                "Your words will appear here as a soft preview..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvelopePreview({ envelope, recipientName, flowerSymbols, iconSymbols }) {
  return (
    <div className="rounded-[2rem] border border-rose-100 bg-white/75 p-5 shadow-soft">
      <p className="mb-4 text-sm font-semibold text-burgundy">
        Envelope preview
      </p>

      <div className="relative mx-auto h-64 max-w-md overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ backgroundColor: envelope.color }}
        />

        <div
          className="absolute left-0 top-0 h-40 w-full origin-top rotate-45 rounded-2xl"
          style={{ backgroundColor: envelope.flapColor }}
        />

        <div className="absolute -top-2 left-10 flex gap-2 text-4xl">
          {flowerSymbols.slice(0, 3).map((symbol, index) => (
            <span key={`${symbol}-${index}`}>{symbol}</span>
          ))}
        </div>

        <div className="absolute right-8 top-8 flex gap-2 text-2xl opacity-80">
          {iconSymbols.slice(0, 3).map((symbol, index) => (
            <span key={`${symbol}-${index}`}>{symbol}</span>
          ))}
        </div>

        <div className="absolute bottom-8 left-10 font-script text-3xl text-black/45">
          To: {recipientName || ""}
        </div>

        {envelope.seal !== "none" && (
          <div className="absolute bottom-16 right-16 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy/80 text-2xl text-white shadow-soft">
            {envelope.seal === "heart"
              ? "♡"
              : envelope.seal === "star"
                ? "☆"
                : envelope.seal === "wax"
                  ? "●"
                  : "✉"}
          </div>
        )}
      </div>
    </div>
  );
}

function DecorativeCorner({ flowerSymbols, iconSymbols }) {
  return (
    <>
      <div className="absolute -right-4 -top-4 flex rotate-12 gap-2 text-4xl opacity-80">
        {flowerSymbols.slice(0, 4).map((symbol, index) => (
          <span key={`${symbol}-${index}`}>{symbol}</span>
        ))}
      </div>

      <div className="absolute bottom-5 right-6 flex gap-2 text-2xl opacity-50">
        {iconSymbols.slice(0, 4).map((symbol, index) => (
          <span key={`${symbol}-${index}`}>{symbol}</span>
        ))}
      </div>
    </>
  );
}