import { Copy, KeyRound } from "lucide-react";
import { useState } from "react";

export default function CodeGeneratedBox({ code }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  if (!code) return null;

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-green-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <KeyRound size={18} />
            Your secret access code
          </p>

          <p className="mt-2 font-mono text-2xl font-bold tracking-wider">
            {code}
          </p>

          <p className="mt-2 text-sm">
            Save it now. This code is shown only once.
          </p>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm hover:bg-green-100"
        >
          <span className="inline-flex items-center gap-2">
            <Copy size={15} />
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}