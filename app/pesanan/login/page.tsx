"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PesananLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pesanan/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!res.ok) {
        setError("Password salah. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/pesanan/orders");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-5">
      <div className="trk-card p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-10 h-10 rounded-lg bg-[#FFE500] text-black grid place-items-center trk-display text-[16px]">
            T
          </span>
          <div>
            <span className="block trk-display text-[14px] tracking-tight text-white">
              MENARA
            </span>
            <span className="block trk-stencil text-[9px] text-[#9aa0aa] mt-[2px]">
              Panel Pesanan
            </span>
          </div>
        </div>

        <h1 className="trk-display text-[28px] text-white mb-2">
          Login<span className="text-[#FFE500]">.</span>
        </h1>
        <p className="text-[13px] text-[#6b7280] mb-6">
          Masukkan password untuk mengakses panel pesanan.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block">
            <span className="trk-stencil text-[10px] text-[#9aa0aa]">
              Password
            </span>
            <input
              required
              type="password"
              autoComplete="off"
              name="menara-pesanan-pass"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoFocus
              className="trk-field w-full mt-2 px-4 py-3.5 text-[16px]"
            />
          </label>

          {error && (
            <p className="mt-3 text-[13px] rounded-xl border border-[rgba(255,59,47,.45)] bg-[rgba(255,59,47,.1)] text-[#ff8b83] px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="trk-btn-accent w-full mt-5 py-3.5 text-[15px] disabled:opacity-50"
          >
            {loading ? "Memverifikasi…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
