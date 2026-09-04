"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getSession, saveSession } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [codeCount, setCodeCount] = useState<number | null>(null);
  const [dataError, setDataError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const session = getSession();
      const sessionUser = session?.user ?? null;

      if (!sessionUser) {
        router.push("/login");
        return;
      }

      setUserEmail(typeof sessionUser.email === "string" ? sessionUser.email : null);
      try {
        const [customers, codes] = await Promise.all([
          apiRequest<unknown[]>("/api/customers", { authenticated: true }),
          apiRequest<unknown[]>("/api/customer-codes", { authenticated: true }),
        ]);
        setCustomerCount(customers.length);
        setCodeCount(codes.length);
      } catch (dataLoadError) {
        setDataError(dataLoadError instanceof Error ? dataLoadError.message : "Unable to load dashboard counts.");
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    saveSession(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
              DETech CRM
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {userEmail}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Customers</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {customerCount ?? "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Customer codes</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {codeCount ?? "—"}
            </p>
          </div>
        </div>

        {dataError ? (
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Counts unavailable: {dataError}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href="/customer-codes"
            className="rounded-xl bg-sky-600 p-5 text-white transition hover:bg-sky-700"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Manage</p>
            <h2 className="mt-2 text-2xl font-bold">Customer codes</h2>
          </a>

          <a
            href="/customers"
            className="rounded-xl bg-slate-900 p-5 text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Manage</p>
            <h2 className="mt-2 text-2xl font-bold">Customers</h2>
          </a>

          <a
            href="/quotations"
            className="rounded-xl bg-emerald-600 p-5 text-white transition hover:bg-emerald-700"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Track</p>
            <h2 className="mt-2 text-2xl font-bold">Quotations</h2>
          </a>

          <a
            href="/quotation-hub"
            className="rounded-xl bg-emerald-600 p-5 text-white transition hover:bg-emerald-700"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Visualize</p>
            <h2 className="mt-2 text-2xl font-bold">Quotation Hub</h2>
          </a>
        </div>
      </div>
    </main>
  );
}
