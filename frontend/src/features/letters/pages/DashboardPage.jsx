import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flower2, Loader2, Plus, Search } from "lucide-react";

import {
  createVault,
  deleteVault,
  generateVaultCode,
  getVaults,
} from "../services/lettersApi";
import VaultCard from "../components/VaultCard";
import CodeGeneratedBox from "../components/CodeGeneratedBox";

export default function DashboardPage() {
  const [vaults, setVaults] = useState([]);
  const [filteredVaults, setFilteredVaults] = useState([]);
  const [search, setSearch] = useState("");
  const [newVaultName, setNewVaultName] = useState("");
  const [newVaultDescription, setNewVaultDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedFor, setGeneratedFor] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadVaults() {
    try {
      setLoading(true);
      setError("");

      const data = await getVaults();

      setVaults(data);
      setFilteredVaults(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load private gardens");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateVault(event) {
    event.preventDefault();

    if (!newVaultName.trim()) {
      setError("Please enter a name for the private garden.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const createdVault = await createVault({
        name: newVaultName,
        description: newVaultDescription || null,
      });

      const updatedVaults = [createdVault, ...vaults];

      setVaults(updatedVaults);
      setFilteredVaults(updatedVaults);

      setNewVaultName("");
      setNewVaultDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create private garden");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteVault(vaultId) {
    const confirmed = window.confirm(
      "Delete this private garden and all its letters permanently?"
    );

    if (!confirmed) return;

    try {
      await deleteVault(vaultId);

      const updatedVaults = vaults.filter((vault) => vault.id !== vaultId);

      setVaults(updatedVaults);
      setFilteredVaults(updatedVaults);
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete private garden");
    }
  }

  async function handleGenerateCode(vaultId) {
    try {
      setGeneratedCode("");
      setGeneratedFor("");

      const response = await generateVaultCode(vaultId);

      setGeneratedCode(response.accessCode);
      setGeneratedFor(response.vault.name);

      await loadVaults();
    } catch (err) {
      alert(err.response?.data?.message || "Could not generate code");
    }
  }

  useEffect(() => {
    loadVaults();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();

    const result = vaults.filter((vault) => {
      return (
        vault.name.toLowerCase().includes(query) ||
        (vault.description || "").toLowerCase().includes(query)
      );
    });

    setFilteredVaults(result);
  }, [search, vaults]);

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white/70 px-6 py-4 text-burgundy shadow-soft">
          <Loader2 className="animate-spin" size={20} />
          Loading your private gardens...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-burgundy shadow-sm">
            <Flower2 size={16} />
            Writer space
          </p>

          <h1 className="font-serif text-5xl font-bold text-burgundy">
            Your private gardens
          </h1>

          <p className="mt-3 max-w-2xl text-rose-950/70">
            Create one private garden per person or occasion. Each garden can
            contain multiple letters and be opened with one shared access code.
          </p>
        </div>

        <Link
          to="/unlock"
          className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/70 px-6 py-3 font-semibold text-burgundy hover:bg-rose-50"
        >
          Open a garden with a code
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {generatedCode && (
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-burgundy">
            Code generated for: {generatedFor}
          </p>
          <CodeGeneratedBox code={generatedCode} />
        </div>
      )}

      <form
        onSubmit={handleCreateVault}
        className="glass-card mb-8 rounded-[2rem] p-6 shadow-soft"
      >
        <h2 className="font-serif text-2xl font-bold text-burgundy">
          Create a private garden
        </h2>

        <p className="mt-2 text-sm text-rose-950/65">
          A private garden is a collection of letters protected by one access
          code.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.3fr_auto]">
          <input
            value={newVaultName}
            onChange={(event) => setNewVaultName(event.target.value)}
            placeholder="For Sara, For Mom, Birthday letters..."
            className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
          />

          <input
            value={newVaultDescription}
            onChange={(event) => setNewVaultDescription(event.target.value)}
            placeholder="Optional description"
            className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
          />

          <button
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-burgundy px-6 py-3 font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your private gardens..."
            className="w-full rounded-2xl border border-rose-100 bg-white/75 py-3 pl-11 pr-4 text-burgundy outline-none shadow-sm focus:border-burgundy"
          />
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white/75 px-5 py-3 text-sm font-semibold text-burgundy shadow-sm">
          {vaults.length} garden{vaults.length !== 1 ? "s" : ""}
        </div>
      </div>

      {filteredVaults.length === 0 ? (
        <EmptyState hasVaults={vaults.length > 0} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredVaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onDelete={handleDeleteVault}
              onGenerateCode={handleGenerateCode}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ hasVaults }) {
  return (
    <div className="glass-card rounded-[2rem] p-10 text-center shadow-soft">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-burgundy">
        <Flower2 size={28} />
      </div>

      <h2 className="font-serif text-3xl font-bold text-burgundy">
        {hasVaults ? "No matching gardens" : "No private gardens yet"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-rose-950/70">
        {hasVaults
          ? "Try searching with another name or description."
          : "Create a private garden first, then add one or many letters inside it."}
      </p>
    </div>
  );
}