import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center px-5">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full rounded-[2rem] p-8 shadow-soft"
      >
        <h1 className="font-serif text-4xl font-bold text-burgundy">
          Create your vault
        </h1>

        <p className="mt-2 text-rose-950/70">
          Start writing letters that can only be opened with a code.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
          />

          <input
            name="password"
            type="password"
            placeholder="Password, minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-rose-100 bg-white/80 px-4 py-3 outline-none focus:border-burgundy"
          />
        </div>

        <button className="mt-6 w-full rounded-2xl bg-burgundy py-3 font-semibold text-white shadow-soft">
          Create account
        </button>

        <p className="mt-5 text-center text-sm text-rose-950/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-burgundy">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}