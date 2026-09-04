"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getSession } from "@/lib/api";

type Customer = {
  id?: string;
  customer_name: string;
  customer_code?: string;
};

type Quotation = {
  id?: string;
  customer_name: string;
  rfq_description: string;
  rfq_date: string;
  due_date?: string | null;
  status: string;
  po_status?: string | null;
  po_amount?: number | null;
  bid_security?: number | null;
  remarks?: string | null;
};

const emptyForm = {
  customerName: "",
  rfqDescription: "",
  rfqDate: "",
  dueDate: "",
  status: "Quotation Submitted",
  poStatus: "",
  poAmount: "",
  bidSecurity: "",
  remarks: "",
};

export default function QuotationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
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

      try {
        const [customerData, quotationData] = await Promise.all([
          apiRequest<Customer[]>("/api/customers", { authenticated: true }),
          apiRequest<Quotation[]>("/api/quotations", { authenticated: true }),
        ]);
        setCustomers(customerData);
        setQuotations(quotationData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load quotations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const payload = {
      customer_name: form.customerName,
      rfq_description: form.rfqDescription.trim(),
      rfq_date: form.rfqDate,
      due_date: form.dueDate || null,
      status: form.status,
      po_status: form.poStatus.trim() || null,
      po_amount: form.poAmount ? Number(form.poAmount) : null,
      bid_security: form.bidSecurity ? Number(form.bidSecurity) : null,
      remarks: form.remarks.trim() || null,
    };

    try {
      const quotation = await apiRequest<Quotation>("/api/quotations", {
        method: "POST",
        authenticated: true,
        body: JSON.stringify(payload),
      });
      setQuotations((current) => [quotation, ...current]);
      setForm(emptyForm);
      setMessage("Quotation saved successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">DETech CRM</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Quotations</h1>
          </div>
          <a href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Back to dashboard
          </a>
        </div>

        {customers.length === 0 ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Add a customer before creating a quotation.
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Add quotation</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Customer</label>
                <select value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required disabled={customers.length === 0} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option value="">Select an existing customer</option>
                  {customers.map((customer, index) => <option key={customer.id ?? `${customer.customer_name}-${index}`} value={customer.customer_name}>{customer.customer_name}{customer.customer_code ? ` (${customer.customer_code})` : ""}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">RFQ description</label>
                <textarea value={form.rfqDescription} onChange={(e) => setForm({ ...form, rfqDescription: e.target.value })} rows={3} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">RFQ date</label>
                <input type="date" value={form.rfqDate} onChange={(e) => setForm({ ...form, rfqDate: e.target.value })} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Due date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option>Quotation Submitted</option><option>Submitted</option><option>In progress</option><option>No availability, not Quoted</option><option>Won</option><option>Lost</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">P.O. status</label>
                <input value={form.poStatus} onChange={(e) => setForm({ ...form, poStatus: e.target.value })} placeholder="e.g. Order Received" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">P.O. amount</label>
                <input type="number" min="0" step="0.01" value={form.poAmount} onChange={(e) => setForm({ ...form, poAmount: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Bid security</label>
                <input type="number" min="0" step="0.01" value={form.bidSecurity} onChange={(e) => setForm({ ...form, bidSecurity: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>

            {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
            {message ? <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p> : null}
            <button type="submit" disabled={submitting || customers.length === 0} className="mt-6 w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Saving..." : "Save quotation"}</button>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Recent quotations</h2>
            {quotations.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No quotations created yet.</p> : <div className="space-y-3">{quotations.map((quotation, index) => <article key={quotation.id ?? `${quotation.customer_name}-${quotation.rfq_date}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-900 dark:text-white">{quotation.customer_name}</p><span className="rounded bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">{quotation.status}</span></div><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{quotation.rfq_description}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">RFQ {quotation.rfq_date}{quotation.due_date ? ` · Due ${quotation.due_date}` : ""}</p></article>)}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
