import { useMemo, useState } from "react";

import { envelopeOptions } from "../data/envelopeOptions";
import { flowerOptions } from "../data/flowerOptions";
import { iconOptions } from "../data/iconOptions";

export default function EnvelopeMiniPreview({
  letter,
  size = "normal",
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isSmall = size === "small";
  const styleConfig = letter?.styleConfig || {};

  const selectedEnvelope =
    envelopeOptions.find(
      (envelope) => envelope.id === styleConfig.envelope?.style
    ) || envelopeOptions[0];

  const selectedFlowers = styleConfig.decorations?.flowers || [];
  const selectedIcons = styleConfig.decorations?.icons || [];

  const flowerSymbols = useMemo(
    () =>
      selectedFlowers
        .map((id) => flowerOptions.find((flower) => flower.id === id)?.emoji)
        .filter(Boolean),
    [selectedFlowers]
  );

  const iconSymbols = useMemo(
    () =>
      selectedIcons
        .map((id) => iconOptions.find((icon) => icon.id === id)?.symbol)
        .filter(Boolean),
    [selectedIcons]
  );

  const d = isSmall
    ? {
        stageW: 320,
        stageH: 250,
        envW: 290,
        envH: 150,
        envTop: 84,
        letterW: 225,
        letterH: 145,
        letterOpenTop: 18,
        flapH: 90,
        seal: 34,
      }
    : {
        stageW: 500,
        stageH: 360,
        envW: 420,
        envH: 220,
        envTop: 108,
        letterW: 330,
        letterH: 215,
        letterOpenTop: 18,
        flapH: 132,
        seal: 44,
      };

  const colors = {
    body: selectedEnvelope.color || "#e8b8c8",
    fold: selectedEnvelope.flapColor || "#d9a1b5",
    inner: lightenColor(selectedEnvelope.flapColor || "#d9a1b5", 18),
    paper: styleConfig.paper?.backgroundColor || "#fffef8",
    text: styleConfig.typography?.textColor || "#4a1d1d",
  };

  const recipient = letter?.recipientName || "Someone special";
  const title = letter?.title || "Untitled letter";
  const content = letter?.content || "Your letter is waiting...";

  const sealSymbol =
    selectedEnvelope.seal === "heart"
      ? "♡"
      : selectedEnvelope.seal === "star"
        ? "☆"
        : selectedEnvelope.seal === "wax"
          ? "●"
          : "✦";

  function toggleEnvelope() {
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={toggleEnvelope}
        aria-label={isOpen ? "Close envelope" : "Open envelope"}
        className="relative mx-auto block focus:outline-none"
        style={{
          width: d.stageW,
          height: d.stageH,
        }}
      >
        {/* Background card */}
        <div
          className="absolute inset-0 rounded-[2rem] border border-rose-100/60"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.80), rgba(255,245,247,0.72))",
            boxShadow: "0 10px 40px rgba(120, 70, 90, 0.08)",
          }}
        />

        {/* Open back flap - appears only when opened */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            top: isOpen ? d.envTop - d.flapH + 8 : d.envTop + 18,
            width: d.envW,
            height: d.flapH,
            zIndex: 8,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scaleY(1)" : "scaleY(0.9)",
            backgroundColor: colors.inner,
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
          }}
        />

        {/* Decorative flowers - visible only when open */}
        <div
          className="absolute left-1/2 flex -translate-x-1/2 gap-2 transition-all duration-500"
          style={{
            top: isOpen ? d.letterOpenTop - 26 : d.envTop + 24,
            zIndex: 12,
            opacity: isOpen ? 1 : 0,
            fontSize: isSmall ? 20 : 34,
          }}
        >
          {flowerSymbols.slice(0, 4).map((symbol, index) => (
            <span key={`${symbol}-${index}`}>{symbol}</span>
          ))}
        </div>

        {/* Letter paper */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-md border border-stone-200 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            top: isOpen ? d.letterOpenTop : d.envTop + 36,
            width: d.letterW,
            height: d.letterH,
            zIndex: 15,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateX(-50%)" : "translateX(-50%) translateY(18px)",
            backgroundColor: colors.paper,
            color: colors.text,
            boxShadow: isOpen
              ? "0 16px 44px rgba(110, 70, 90, 0.14)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.06),transparent_34%)] opacity-60" />

          <div
            className="relative text-left"
            style={{
              padding: isSmall ? 14 : 22,
            }}
          >
            <div className="absolute left-2 top-1 text-xs opacity-30">
              {flowerSymbols[0] || "🌸"}
            </div>

            <div className="absolute right-2 top-1 text-xs opacity-30">
              {iconSymbols[0] || "♡"}
            </div>

            <p
              className="font-script text-rose-500"
              style={{
                fontSize: isSmall ? 16 : 20,
              }}
            >
              To: {recipient}
            </p>

            <h3
              className="mt-2 font-serif font-bold"
              style={{
                fontSize: isSmall ? 16 : 22,
              }}
            >
              {title}
            </h3>

            <p
              className="mt-2 line-clamp-3 leading-6"
              style={{
                fontSize: isSmall ? 12 : 14,
              }}
            >
              {content}
            </p>

            {!isSmall && (
              <p className="mt-4 text-right font-script text-xl text-rose-800">
                With love, always ✦
              </p>
            )}
          </div>
        </div>

        {/* Envelope back wall */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-md"
          style={{
            top: d.envTop,
            width: d.envW,
            height: d.envH,
            zIndex: 20,
            backgroundColor: colors.body,
            boxShadow: "0 14px 30px rgba(100, 60, 80, 0.16)",
          }}
        />

        {/* Side folds */}
        <div
          className="absolute"
          style={{
            top: d.envTop,
            left: `calc(50% - ${d.envW / 2}px)`,
            width: d.envW / 2,
            height: d.envH,
            zIndex: 30,
            backgroundColor: colors.fold,
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          }}
        />

        <div
          className="absolute"
          style={{
            top: d.envTop,
            right: `calc(50% - ${d.envW / 2}px)`,
            width: d.envW / 2,
            height: d.envH,
            zIndex: 30,
            backgroundColor: colors.fold,
            clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
          }}
        />

        {/* Bottom front fold */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-b-md"
          style={{
            top: d.envTop,
            width: d.envW,
            height: d.envH,
            zIndex: 35,
            backgroundColor: colors.body,
            clipPath: "polygon(0 100%, 50% 52%, 100% 100%)",
          }}
        />

        {/* Closed front flap */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            top: d.envTop,
            width: d.envW,
            height: d.flapH,
            zIndex: 50,
            opacity: isOpen ? 0 : 1,
            transform: isOpen
              ? "translateY(-22px) scaleY(0.85)"
              : "translateY(0) scaleY(1)",
            backgroundColor: colors.body,
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
          }}
        />

        {/* Seal */}
        {selectedEnvelope.seal !== "none" && (
          <div
            className="absolute left-1/2 flex items-center justify-center rounded-full bg-burgundy text-white transition-all duration-300"
            style={{
              top: d.envTop + d.flapH - d.seal / 2 - 5,
              width: d.seal,
              height: d.seal,
              zIndex: 60,
              opacity: isOpen ? 0 : 1,
              transform: isOpen
                ? "translateX(-50%) scale(0.35)"
                : "translateX(-50%) scale(1)",
              fontSize: isSmall ? 14 : 18,
              boxShadow: "0 8px 16px rgba(90, 20, 20, 0.20)",
            }}
          >
            {sealSymbol}
          </div>
        )}

        {/* Address */}
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-script text-white/80"
          style={{
            top: d.envTop + d.envH - (isSmall ? 42 : 58),
            zIndex: 65,
            fontSize: isSmall ? 18 : 28,
          }}
        >
          To: {recipient}
        </div>

        {/* Icons */}
        <div
          className="absolute flex gap-2 text-white/75"
          style={{
            top: d.envTop + 16,
            right: `calc(50% - ${d.envW / 2}px + 18px)`,
            zIndex: 65,
            fontSize: isSmall ? 13 : 18,
          }}
        >
          {(iconSymbols.length > 0 ? iconSymbols : ["♡", "☆", "☽"])
            .slice(0, 3)
            .map((symbol, index) => (
              <span key={`${symbol}-${index}`}>{symbol}</span>
            ))}
        </div>
      </button>

      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[2px] text-rose-400">
        {isOpen ? "Click to seal envelope" : "Click to open envelope"}
      </p>
    </div>
  );
}

function lightenColor(hex, percent) {
  const cleanHex = hex.replace("#", "");
  const number = parseInt(cleanHex, 16);

  const red = (number >> 16) + percent;
  const green = ((number >> 8) & 0x00ff) + percent;
  const blue = (number & 0x0000ff) + percent;

  const nextRed = Math.max(0, Math.min(255, red));
  const nextGreen = Math.max(0, Math.min(255, green));
  const nextBlue = Math.max(0, Math.min(255, blue));

  return `#${(nextBlue | (nextGreen << 8) | (nextRed << 16))
    .toString(16)
    .padStart(6, "0")}`;
}