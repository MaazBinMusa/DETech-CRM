"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!sessionUser) {
        router.push("/login");
        return;
      }

      setUserEmail(sessionUser.email ?? null);
      setLoading(false);
    };

    getSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">0</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Customer codes</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">0</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
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
        </div>
      </div>
    </main>
  );
}
