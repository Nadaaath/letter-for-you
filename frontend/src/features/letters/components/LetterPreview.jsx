import { Heart } from "lucide-react";
import { letterThemes } from "../data/letterThemes";

export default function LetterPreview({ letter }) {
  const selectedTheme =
    letterThemes.find((theme) => theme.id === letter.theme) || letterThemes[0];

  return (
    <div className="rounded-[2rem] border border-rose-100 bg-white/75 p-5 shadow-soft">
      <div
        className="min-h-[28rem] rounded-[1.5rem] border border-rose-100 p-8 shadow-inner"
        style={{
          backgroundColor: letter.backgroundColor,
          color: letter.textColor,
          fontFamily: `"${letter.fontFamily}", serif`,
        }}
      >
        <div className="mb-6 flex justify-between text-current opacity-80">
          <Heart fill="currentColor" />
          <span className="font-script text-3xl">{selectedTheme.symbol}</span>
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