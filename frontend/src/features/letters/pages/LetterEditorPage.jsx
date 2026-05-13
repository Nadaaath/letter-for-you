import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";

import { createLetter, generateLetterCode } from "../services/lettersApi";
import { letterFonts } from "../data/letterThemes";
import LetterPreview from "../components/LetterPreview";
import ThemeSelector from "../components/ThemeSelector";
import CodeGeneratedBox from "../components/CodeGeneratedBox";

const initialLetter = {
  title: "",
  content: "",
  fontFamily: "Playfair Display",
  textColor: "#7f1d1d",
  backgroundColor: "#fff7ed",
  theme: "rose",
  decoration: "flowers",
  isOpenOnce: false,
};

export default function LetterEditorPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialLetter);
  const [saving, setSaving] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function applyTheme(theme) {
    setFormData({
      ...formData,
      theme: theme.id,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      decoration: theme.decoration,
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setGeneratedCode("");

    try {
      setSaving(true);

      const createdLetter = await createLetter(formData);
      const codeResponse = await generateLetterCode(createdLetter.id);

      setGeneratedCode(codeResponse.accessCode);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save letter");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm hover:bg-rose-50"
      >
        <ArrowLeft size={16} />
        Back to my written letters
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
          Create a private letter, style it softly, and receive a secret code to
          share with someone special.
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

          {generatedCode && <div className="mt-5"><CodeGeneratedBox code={generatedCode} /></div>}

          <div className="mt-6 space-y-5">
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
                Letter
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
                Font
              </label>
              <select
                name="fontFamily"
                value={formData.fontFamily}
                onChange={handleChange}
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
                  name="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-white/80 p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-burgundy">
                  Background
                </label>
                <input
                  name="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={handleChange}
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
                  Save and generate code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <ThemeSelector
            selectedThemeId={formData.theme}
            onSelectTheme={applyTheme}
          />

          <LetterPreview letter={formData} />
        </div>
      </form>
    </section>
  );
}