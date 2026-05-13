import { Heart } from "lucide-react";
import { letterThemes } from "../data/letterThemes";

export default function LetterPreview({ letter }) {
  const styleConfig = letter.styleConfig || {};

  const selectedTheme =
    letterThemes.find((theme) => theme.id === styleConfig.theme?.id) ||
    letterThemes[0];

  const backgroundColor =
    styleConfig.paper?.backgroundColor || selectedTheme.backgroundColor;

  const textColor =
    styleConfig.typography?.textColor || selectedTheme.textColor;

  const bodyFont =
    styleConfig.typography?.bodyFont || "Playfair Display";

  return (
    <div className="rounded-[2rem] border border-rose-100 bg-white/75 p-5 shadow-soft">
      <div
        className="min-h-[28rem] rounded-[1.5rem] border border-rose-100 p-8 shadow-inner"
        style={{
          backgroundColor,
          color: textColor,
          fontFamily: `"${bodyFont}", serif`,
        }}
      >
        <div className="mb-6 flex justify-between text-current opacity-80">
          <Heart fill="currentColor" />
          <span className="font-script text-3xl">{selectedTheme.symbol}</span>
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
          {letter.content || "Your words will appear here as a soft preview..."}
        </p>
      </div>
    </div>
  );
}