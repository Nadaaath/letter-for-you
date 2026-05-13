import { letterThemes } from "../data/letterThemes";

export default function ThemeSelector({ selectedThemeId, onSelectTheme }) {
  return (
    <div className="glass-card rounded-[2rem] p-6 shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-burgundy">
        Choose a theme
      </h2>

      <p className="mt-2 text-sm text-rose-950/65">
        Pick a visual mood for your letter. You can still customize colors
        afterward.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {letterThemes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelectTheme(theme)}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedThemeId === theme.id
                ? "border-burgundy bg-rose-50"
                : "border-rose-100 bg-white/70 hover:bg-rose-50"
            }`}
          >
            <div
              className="mb-3 flex h-14 items-center justify-center rounded-xl border border-white/70 text-2xl"
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
              }}
            >
              {theme.symbol}
            </div>

            <p className="font-semibold text-burgundy">{theme.name}</p>
            <p className="text-sm text-rose-950/60">{theme.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}