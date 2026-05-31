import { flowerOptions } from "../data/flowerOptions";
import { iconOptions } from "../data/iconOptions";

export default function DecorationPicker({
  selectedFlowers,
  selectedIcons,
  onToggleFlower,
  onToggleIcon,
}) {
  return (
    <div className="glass-card rounded-[2rem] p-6 shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-burgundy">
        Add decorations
      </h2>

      <p className="mt-2 text-sm text-rose-950/65">
        Choose flowers, stars, hearts, or icons to decorate the letter.
      </p>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-burgundy">
          Flowers
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {flowerOptions.map((flower) => {
            const selected = selectedFlowers.includes(flower.id);

            return (
              <button
                key={flower.id}
                type="button"
                onClick={() => onToggleFlower(flower.id)}
                className={`rounded-2xl border p-3 text-center transition ${
                  selected
                    ? "border-burgundy bg-rose-50"
                    : "border-rose-100 bg-white/70 hover:bg-rose-50"
                }`}
                title={flower.name}
              >
                <div className="text-3xl">{flower.emoji}</div>
                <p className="mt-1 text-[11px] font-semibold text-burgundy">
                  {flower.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-burgundy">
          Icons
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {iconOptions.map((icon) => {
            const selected = selectedIcons.includes(icon.id);

            return (
              <button
                key={icon.id}
                type="button"
                onClick={() => onToggleIcon(icon.id)}
                className={`rounded-2xl border p-3 text-center transition ${
                  selected
                    ? "border-burgundy bg-rose-50"
                    : "border-rose-100 bg-white/70 hover:bg-rose-50"
                }`}
                title={icon.name}
              >
                <div className="text-3xl">{icon.symbol}</div>
                <p className="mt-1 text-[11px] font-semibold text-burgundy">
                  {icon.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}