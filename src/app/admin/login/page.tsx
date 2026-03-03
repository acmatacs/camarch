"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.replace(from);
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-body text-sm text-charcoal/70 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="admin@camarch.com"
          className="w-full px-4 py-2.5 rounded-lg border border-charcoal/20 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-jungle/40 focus:border-jungle transition"
        />
      </div>

      <div>
        <label className="block font-body text-sm text-charcoal/70 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="w-full px-4 py-2.5 rounded-lg border border-charcoal/20 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-jungle/40 focus:border-jungle transition"
        />
      </div>

      {error && (
        <p className="text-red-600 font-body text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-jungle text-white font-body font-medium py-2.5 rounded-lg hover:bg-jungle/90 transition disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal to-charcoal/80 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-charcoal px-8 py-6 text-center">
          <span className="font-heading text-gold text-2xl tracking-wide">CamArch</span>
          <p className="font-body text-sandstone/50 text-xs mt-1 uppercase tracking-widest">Admin Portal</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h1 className="font-heading text-charcoal text-xl mb-6">Sign In</h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
