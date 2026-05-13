import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";

import { addLetterToVault } from "../services/lettersApi";
import { letterFonts } from "../data/letterThemes";
import LetterPreview from "../components/LetterPreview";
import ThemeSelector from "../components/ThemeSelector";

const initialLetter = {
  title: "",
  recipientName: "",
  senderName: "",
  isAnonymous: false,
  content: "",

  styleConfig: {
    envelope: {
      style: "classic-cream",
      color: "#e7d7bb",
      seal: "none",
    },
    paper: {
      style: "soft-paper",
      backgroundColor: "#fff7ed",
      borderStyle: "soft",
    },
    typography: {
      titleFont: "Playfair Display",
      bodyFont: "Playfair Display",
      accentFont: "Dancing Script",
      textColor: "#7f1d1d",
    },
    theme: {
      id: "rose",
    },
    decorations: {
      flowers: ["rose"],
      icons: ["heart"],
      accent: "flowers",
    },
  },

  isOpenOnce: false,
};

export default function LetterEditorPage() {
  const navigate = useNavigate();
  const { vaultId } = useParams();

  const [formData, setFormData] = useState(initialLetter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function updateStyleConfig(section, key, value) {
    setFormData({
      ...formData,
      styleConfig: {
        ...formData.styleConfig,
        [section]: {
          ...formData.styleConfig[section],
          [key]: value,
        },
      },
    });
  }

  function applyTheme(theme) {
    setFormData({
      ...formData,
      styleConfig: {
        ...formData.styleConfig,
        theme: {
          id: theme.id,
        },
        paper: {
          ...formData.styleConfig.paper,
          backgroundColor: theme.backgroundColor,
        },
        typography: {
          ...formData.styleConfig.typography,
          textColor: theme.textColor,
        },
        decorations: {
          ...formData.styleConfig.decorations,
          accent: theme.decoration,
        },
      },
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");

    if (!vaultId) {
      setError("No private garden selected.");
      return;
    }

    try {
      setSaving(true);

      await addLetterToVault(vaultId, formData);

      navigate(`/vaults/${vaultId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save letter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8">
      <button
        onClick={() => navigate(`/vaults/${vaultId}`)}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm hover:bg-rose-50"
      >
        <ArrowLeft size={16} />
        Back to private garden
      </button>

      <div className="mb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
          <Sparkles size={16} />
          Letter editor
        </p>

        <h1 className="font-serif text-5xl font-bold text-burgundy">
          Write something beautiful
        </h1>

        <p className="mt-3 max-w-2xl text-rose-950/70">
          Add this letter to the selected private garden. The garden can contain
          multiple letters and be opened with one shared access code.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <h2 className="font-serif text-2xl font-bold text-burgundy">
            Letter details
          </h2>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-burgundy">
                To
              </label>
              <input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Who is this letter for?"
                maxLength={25}
                className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-burgundy">
                From
              </label>
              <input
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                placeholder="Leave blank to post anonymously"
                maxLength={25}
                disabled={formData.isAnonymous}
                className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy disabled:opacity-60"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/70 p-4 text-sm font-semibold text-burgundy">
              <input
                name="isAnonymous"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Post this letter anonymously
            </label>

            <div>
              <label className="mb-2 block text-sm font-semibold text-burgundy">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Open when you miss me..."
                className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-burgundy">
                Your message
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                placeholder="Write your secret letter here..."
                className="w-full resize-none rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 leading-7 outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-burgundy">
                Handwriting / font
              </label>
              <select
                value={formData.styleConfig.typography.bodyFont}
                onChange={(event) =>
                  updateStyleConfig("typography", "bodyFont", event.target.value)
                }
                className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
              >
                {letterFonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-burgundy">
                  Text color
                </label>
                <input
                  type="color"
                  value={formData.styleConfig.typography.textColor}
                  onChange={(event) =>
                    updateStyleConfig(
                      "typography",
                      "textColor",
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-white/80 p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-burgundy">
                  Paper color
                </label>
                <input
                  type="color"
                  value={formData.styleConfig.paper.backgroundColor}
                  onChange={(event) =>
                    updateStyleConfig(
                      "paper",
                      "backgroundColor",
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-white/80 p-2"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/70 p-4 text-sm font-semibold text-burgundy">
              <input
                name="isOpenOnce"
                type="checkbox"
                checked={formData.isOpenOnce}
                onChange={handleChange}
                className="h-4 w-4"
              />
              This letter can be opened only once
            </label>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-burgundy py-3 font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save letter to garden
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <ThemeSelector
            selectedThemeId={formData.styleConfig.theme.id}
            onSelectTheme={applyTheme}
          />

          <LetterPreview letter={formData} />
        </div>
      </form>
    </section>
  );
}