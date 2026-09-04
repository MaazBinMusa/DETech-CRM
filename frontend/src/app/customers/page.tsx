"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getSession } from "@/lib/api";

type CustomerCodeRow = {
  id: string;
  combined: string;
};

type CustomerRow = {
  id: string;
  customer_name: string;
  contact_name: string;
  industry: string;
  customer_code: string;
  email: string;
  phone: string;
  notes: string;
};

const emptyForm = {
  customerName: "",
  contactName: "",
  industry: "",
  customerCode: "",
  email: "",
  phone: "",
  notes: "",
};

export default function CustomersPage() {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [codes, setCodes] = useState<CustomerCodeRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
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
      await fetchCustomers();
    };

    load();
  }, [router]);

  const fetchCodes = async () => {
    try {
      const data = await apiRequest<CustomerCodeRow[]>("/api/customer-codes", { authenticated: true });
      setCodes(data);
    } catch (codesError) {
      setError(codesError instanceof Error ? codesError.message : "Unable to load customer codes.");
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await apiRequest<CustomerRow[]>("/api/customers", { authenticated: true });
      setCustomers(data);
    } catch (customerError) {
      setError(customerError instanceof Error ? customerError.message : "Unable to load customers.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (!form.customerCode) {
      setError("Please select a customer code.");
      setSubmitting(false);
      return;
    }

    const payload = {
      customer_name: form.customerName.trim(),
      contact_name: form.contactName.trim(),
      industry: form.industry.trim(),
      customer_code: form.customerCode,
      email: form.email.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    };

    try {
      await apiRequest<CustomerRow>("/api/customers", {
        method: "POST",
        authenticated: true,
        body: JSON.stringify(payload),
      });
    } catch (insertError) {
      setSubmitting(false);
      setError(insertError instanceof Error ? insertError.message : "Unable to save the customer.");
      return;
    }

    setSubmitting(false);
    setForm(emptyForm);
    setMessage("Customer created successfully.");
    await fetchCustomers();
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
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">DETech CRM</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Customers</h1>
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
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Add a customer</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Customer name
                </label>
                <input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Contact name
                </label>
                <input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Industry
                </label>
                <input
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Customer code
                </label>
                {codes.length === 0 ? (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    No customer codes are available yet. Create one first from the customer codes page.
                  </div>
                ) : (
                  <select
                    value={form.customerCode}
                    onChange={(e) => setForm({ ...form, customerCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  >
                    <option value="">Select a valid code</option>
                    {codes.map((code) => (
                      <option key={code.id} value={code.combined}>
                        {code.combined}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={4}
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
              {submitting ? "Saving..." : "Add customer"}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Saved customers</h2>

            {customers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No customers created yet.</p>
            ) : (
              <div className="space-y-3">
                {customers.map((customer, index) => (
                  <div key={customer.id ?? `${customer.customer_code}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{customer.customer_name}</p>
                      <span className="rounded bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                        {customer.customer_code}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.contact_name || "No contact name"}</p>
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
