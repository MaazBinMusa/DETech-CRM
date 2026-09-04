"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getSession } from "@/lib/api";

type CustomerCodeRow = {
  id: string;
  industry_code: string;
  customer_code: string;
  combined: string;
  created_at?: string;
};

const emptyForm = {
  industryCode: "",
  customerCode: "",
};

export default function CustomerCodesPage() {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [codes, setCodes] = useState<CustomerCodeRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!getSession()) {
        router.push("/login");
        return;
      }

      setLoadingSession(false);
      await fetchCodes();
    };

    load();
  }, [router]);

  const fetchCodes = async () => {
    try {
      const data = await apiRequest<CustomerCodeRow[]>("/api/customer-codes", { authenticated: true });
      setCodes(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load customer codes.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const industry = form.industryCode.trim();
    const customer = form.customerCode.trim();

    if (!/^[A-Za-z]{2}$/.test(industry)) {
      setError("Industry code must be exactly 2 letters.");
      setSubmitting(false);
      return;
    }

    if (!/^\d{4}$/.test(customer)) {
      setError("Customer code must be exactly 4 digits.");
      setSubmitting(false);
      return;
    }

    const combined = `${industry}${customer}`;

    try {
      await apiRequest<CustomerCodeRow>("/api/customer-codes", {
        method: "POST",
        authenticated: true,
        body: JSON.stringify({ industry_code: industry, customer_code: customer }),
      });
    } catch (insertError) {
      setSubmitting(false);
      setError(insertError instanceof Error ? insertError.message : "Unable to create customer code.");
      return;
    }

    setSubmitting(false);
    setForm(emptyForm);
    setMessage(`Code ${combined} created successfully.`);
    await fetchCodes();
  };

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">DETech CRM</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Customer codes</h1>
          </div>
          <a
            href="/dashboard"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to dashboard
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Add a new code</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Industry code (2 letters)
                </label>
                <input
                  value={form.industryCode}
                  onChange={(e) => setForm({ ...form, industryCode: e.target.value.toUpperCase() })}
                  maxLength={2}
                  placeholder="AB"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Customer index (4 digits)
                </label>
                <input
                  value={form.customerCode}
                  onChange={(e) => setForm({ ...form, customerCode: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  maxLength={4}
                  placeholder="0001"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {error ? (
              <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add customer code"}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Available codes</h2>

            {codes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No customer codes created yet.</p>
            ) : (
              <div className="space-y-3">
                {codes.map((row, index) => (
                  <div
                    key={row.id ?? `${row.combined}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{row.combined}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {row.industry_code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
