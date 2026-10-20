import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flower2, Loader2, Plus, Search, Copy } from "lucide-react";
import {
  createVault,
  deleteVault,
  generateVaultCode,
  getVaultById,
} from "../services/lettersApi";
import {
  forgetGarden,
  getManagedGardenIds,
  getManagementLink,
  saveGardenKey,
} from "../../../lib/storage";
import VaultCard from "../components/VaultCard";
import CodeGeneratedBox from "../components/CodeGeneratedBox";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [vaults, setVaults] = useState([]);
  const [search, setSearch] = useState("");
  const [newVaultName, setNewVaultName] = useState("");
  const [newVaultDescription, setNewVaultDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedFor, setGeneratedFor] = useState("");
  const [newManagementLink, setNewManagementLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadVaults() {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        getManagedGardenIds().map((id) => getVaultById(id))
      );
      setVaults(results.filter((r) => r.status === "fulfilled").map((r) => r.value));
      if (results.some((r) => r.status === "rejected")) {
        setError("Some saved gardens could not be loaded. Their links may be outdated.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateVault(event) {
    event.preventDefault();
    if (!newVaultName.trim()) return setError("Please enter a garden name.");
    try {
      setCreating(true);
      setError("");
      const { vault, managementToken } = await createVault({
        name: newVaultName.trim(),
        description: newVaultDescription.trim() || null,
      });
      // Critical: store credential before navigating or loading the garden.
      saveGardenKey(vault.id, managementToken);
      const link = getManagementLink(vault.id);
      setNewManagementLink(link || "");
      setVaults((items) => [vault, ...items]);
      setNewVaultName("");
      setNewVaultDescription("");
      // Stay on this page so the user can copy the management link immediately.
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not create garden");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteVault(vaultId) {
    if (!window.confirm("Delete this private garden and all its letters permanently?")) return;
    try {
      await deleteVault(vaultId);
      forgetGarden(vaultId);
      setVaults((items) => items.filter((vault) => vault.id !== vaultId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete private garden");
    }
  }

  async function handleGenerateCode(vaultId) {
    try {
      setGeneratedCode("");
      const response = await generateVaultCode(vaultId);
      setGeneratedCode(response.accessCode);
      setGeneratedFor(response.vault.name);
      setVaults((items) => items.map((v) => v.id === vaultId ? response.vault : v));
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate code");
    }
  }

  useEffect(() => { loadVaults(); }, []);
  const filtered = vaults.filter((vault) => (`${vault.name} ${vault.description || ""}`)
    .toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm"><Flower2 size={16} /> Writer space</p>
          <h1 className="font-serif text-5xl font-bold text-burgundy">Your private gardens</h1>
          <p className="mt-3 max-w-2xl text-rose-950/70">Create a garden without an account. Save your private management link to return from another device.</p>
        </div>
        <Link to="/unlock" className="rounded-full border border-rose-200 bg-white/70 px-6 py-3 font-semibold text-burgundy">Open a garden with a code</Link>
      </div>

      {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</div>}
      {newManagementLink && (
        <div className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-serif text-2xl font-bold text-burgundy">Save your private management link</h2>
          <p className="my-2 text-sm text-rose-950/75">Anyone with this link can edit or delete your garden. Never send it to the recipient. Losing it and your browser data may mean losing management access.</p>
          <button type="button" onClick={() => navigator.clipboard.writeText(newManagementLink)} className="mt-2 inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 font-semibold text-white"><Copy size={16} /> Copy private link</button>
        </div>
      )}
      {generatedCode && <div className="mb-8"><p className="mb-2 font-semibold text-burgundy">Reader code for {generatedFor}</p><CodeGeneratedBox code={generatedCode} /></div>}

      <form onSubmit={handleCreateVault} className="glass-card mb-8 rounded-[2rem] p-6 shadow-soft">
        <h2 className="font-serif text-2xl font-bold text-burgundy">Create a private garden</h2>
        <p className="mt-2 text-sm text-rose-950/65">No login required. Only you should keep the management link.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.3fr_auto]">
          <input value={newVaultName} onChange={(e) => setNewVaultName(e.target.value)} placeholder="For Sara, For Mom, Birthday letters..." required maxLength={80} className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy" />
          <input value={newVaultDescription} onChange={(e) => setNewVaultDescription(e.target.value)} placeholder="Optional description" maxLength={300} className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy" />
          <button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-burgundy px-6 py-3 font-semibold text-white disabled:opacity-60">
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create
          </button>
        </div>
      </form>

      <div className="relative mb-8"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your saved gardens..." className="w-full rounded-2xl border border-rose-100 bg-white/75 py-4 pl-12 pr-4 text-burgundy" />
      </div>
      {loading ? <p className="text-rose-950/70">Loading saved gardens...</p> : filtered.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vault) => <VaultCard key={vault.id} vault={vault} onDelete={handleDeleteVault} onGenerateCode={handleGenerateCode} />)}
        </div>
      ) : (
        <div className="glass-card rounded-[2rem] p-10 text-center shadow-soft">
          <Flower2 className="mx-auto text-burgundy" size={30} />
          <h2 className="mt-3 font-serif text-3xl font-bold text-burgundy">{vaults.length ? "No matching gardens" : "No gardens saved on this device yet"}</h2>
          <p className="mt-2 text-rose-950/70">Create your first garden above, or open a private management link saved from another device.</p>
        </div>
      )}
    </section>
  );
}
