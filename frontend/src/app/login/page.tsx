"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, AuthSession, saveSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest<{ session: AuthSession }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!result.session) throw new Error("Login did not return a session.");
      saveSession(result.session);
    } catch (loginError) {
      setLoading(false);
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
            DETech CRM
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Need an account?{" "}
          <a href="/signup" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign up
          </a>
        </div>
      </div>
    </main>
  );
}
