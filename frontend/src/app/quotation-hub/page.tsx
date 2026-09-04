"use client";

import { useEffect, useState } from "react";
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
};

const demoCustomers: Customer[] = [
  "AEMCL", "GCU-Lahore", "I2C Pakistan", "Shadab Textile Mills", "OMS Private Limited",
  "Ripple Solution", "OLMRTS", "CENUM Hospital", "Northwind Steel", "Meridian Foods",
  "Atlas Engineering", "Crescent Bank", "Vertex Systems", "Summit Healthcare",
  "Pioneer Textiles", "Bluebird Logistics", "Harbor Energy", "Nexus Education",
  "Eastline Traders", "Silverline Pharma", "Cobalt Manufacturing", "Urban Grid",
  "Evergreen Supplies", "Crown Packaging", "Mosaic Retail", "Prime Distribution",
].map((name, index) => ({
  customer_name: name,
  customer_code: `CU${String(index + 1).padStart(4, "0")}`,
}));

const demoStatuses = ["Quotation Submitted", "In progress", "Won", "Submitted", "Lost", "Quotation Submitted"];
const demoDescriptions = [
  "RFQ for network equipment and accessories",
  "RFQ for workstations and display units",
  "RFQ for printer supplies and toner",
  "RFQ for storage, memory and laptop parts",
  "RFQ for security and surveillance equipment",
];

const demoQuotations: Quotation[] = Array.from({ length: 30 }, (_, index) => {
  const customer = demoCustomers[index % demoCustomers.length];
  const month = String((index % 6) + 1).padStart(2, "0");
  const day = String((index % 24) + 1).padStart(2, "0");
  const dueDay = String(((index + 7) % 27) + 1).padStart(2, "0");
  return {
    id: `demo-${index}`,
    customer_name: customer.customer_name,
    rfq_description: demoDescriptions[index % demoDescriptions.length],
    rfq_date: `2026-${month}-${day}`,
    due_date: `2026-${month}-${dueDay}`,
    status: demoStatuses[index % demoStatuses.length],
    po_status: index % 3 === 0 ? "Order Received" : null,
    po_amount: index % 3 === 0 ? 48000 + index * 7350 : null,
    bid_security: index % 4 === 0 ? 2500 + index * 100 : null,
  };
});

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const statusGroups = ["Quotation Submitted", "In progress", "Won", "Lost"];

function statusTone(status: string) {
  if (status === "Won") return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
  if (status === "Lost") return "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300";
  if (status === "In progress") return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300";
  return "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300";
}

export default function QuotationHubPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>(demoQuotations);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [error, setError] = useState("");

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
        setCustomers(customerData.length ? customerData : demoCustomers);
        setQuotations(quotationData.length ? quotationData : demoQuotations);
        setDemoMode(quotationData.length === 0);
      } catch (loadError) {
        setCustomers(demoCustomers);
        setQuotations(demoQuotations);
        setDemoMode(true);
        setError(loadError instanceof Error ? loadError.message : "Live data is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#edf3f1] text-slate-700 dark:bg-slate-950 dark:text-slate-200">Loading quotation intelligence...</main>;
  }

  const visibleQuotations = quotations.filter((quotation) =>
    (selectedCustomer === "all" || quotation.customer_name === selectedCustomer) &&
    (selectedStatus === "all" || quotation.status === selectedStatus),
  );
  const customerQuotations = selectedCustomer === "all" ? visibleQuotations : visibleQuotations.filter((quotation) => quotation.customer_name === selectedCustomer);
  const won = visibleQuotations.filter((quotation) => quotation.status === "Won").length;
  const open = visibleQuotations.filter((quotation) => !["Won", "Lost"].includes(quotation.status)).length;
  const pipelineValue = visibleQuotations.reduce((sum, quotation) => sum + (quotation.po_amount || 0), 0);
  const winRate = visibleQuotations.length ? Math.round((won / visibleQuotations.length) * 100) : 0;
  const maxValue = Math.max(...visibleQuotations.map((quotation) => quotation.po_amount || 0), 1);
  const focusCustomer = selectedCustomer === "all" ? "Every customer" : selectedCustomer;

  return (
    <main className="min-h-screen bg-[#edf3f1] px-4 py-6 text-slate-900 dark:bg-[#101918] dark:text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 border-b border-slate-300/70 pb-6 dark:border-slate-700/70 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">DETech / Intelligence</p>
              {demoMode ? <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">Demo tape</span> : null}
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Quotation Hub</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">A live view of demand, deadlines, opportunity value, and customer momentum.</p>
          </div>
          <div className="flex gap-3">
            <a href="/quotations" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Add quotation</a>
            <a href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Dashboard</a>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-900 bg-slate-950 text-white shadow-xl dark:border-emerald-900/60">
          <div className="flex min-w-max animate-[ticker_32s_linear_infinite] items-center gap-10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] [@media(prefers-reduced-motion:reduce)]:animate-none">
            {[0, 1].flatMap((repeat) => [
              <span key={`rfq-${repeat}`} className="text-emerald-300">RFQs tracked <b className="text-white">{visibleQuotations.length}</b></span>,
              <span key={`open-${repeat}`} className="text-sky-300">Open <b className="text-white">{open}</b></span>,
              <span key={`value-${repeat}`} className="text-amber-300">Pipeline <b className="text-white">{money.format(pipelineValue)}</b></span>,
              <span key={`win-${repeat}`} className="text-rose-300">Win rate <b className="text-white">{winRate}%</b></span>,
              <span key={`focus-${repeat}`} className="text-white">Focus <b className="text-emerald-300">{focusCustomer}</b></span>,
            ])}
          </div>
        </div>

        {error ? <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Live data unavailable, so the Hub is showing labeled demo data. {error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["RFQs in view", visibleQuotations.length, "all tracked requests"],
            ["Open opportunities", open, "need attention"],
            ["Won quotations", won, `${winRate}% conversion rate`],
            ["Pipeline value", money.format(pipelineValue), "recorded P.O. value"],
          ].map(([label, value, detail]) => (
            <div key={label} className="border-l-4 border-emerald-500 bg-white px-5 py-4 shadow-sm dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 border-y border-slate-300/70 py-4 dark:border-slate-700/70 sm:flex-row">
          <label className="flex-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Customer
            <select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="all">All customers</option>
              {customers.map((customer, index) => <option key={customer.id ?? `${customer.customer_name}-${index}`} value={customer.customer_name}>{customer.customer_name}{customer.customer_code ? ` / ${customer.customer_code}` : ""}</option>)}
            </select>
          </label>
          <label className="flex-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Status
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="all">All statuses</option>
              {statusGroups.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Customer lens</p><h2 className="mt-1 text-2xl font-black">{focusCustomer}</h2></div>
              <span className="text-right text-xs text-slate-500 dark:text-slate-400">{customerQuotations.length} quotations<br />in current view</span>
            </div>
            <div className="mt-6 space-y-4">
              {customerQuotations.slice(0, 7).map((quotation, index) => <div key={quotation.id ?? `${quotation.customer_name}-${quotation.rfq_date}-${index}`} className="relative flex gap-4 border-l-2 border-emerald-300 pb-2 pl-5 dark:border-emerald-800"><span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold text-slate-950 dark:text-white">{quotation.customer_name}</p><span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusTone(quotation.status)}`}>{quotation.status}</span></div><p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{quotation.rfq_description}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">RFQ {quotation.rfq_date}{quotation.due_date ? ` · Due ${quotation.due_date}` : ""}</p></div></div>)}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Value pulse</p>
            <h2 className="mt-1 text-2xl font-black">Quotation value</h2>
            <div className="mt-7 flex h-48 items-end gap-2 border-b border-l border-slate-200 px-3 pb-0 dark:border-slate-700">
              {visibleQuotations.slice(0, 12).map((quotation, index) => <div key={quotation.id ?? `bar-${index}`} className="group relative flex h-full flex-1 items-end"><div title={quotation.po_amount ? money.format(quotation.po_amount) : "No P.O. amount"} className={`w-full min-w-[8px] rounded-t-sm transition hover:opacity-70 ${quotation.status === "Won" ? "bg-emerald-500" : quotation.status === "Lost" ? "bg-rose-300" : "bg-slate-300 dark:bg-slate-600"}`} style={{ height: `${Math.max(((quotation.po_amount || 0) / maxValue) * 100, 7)}%` }} /></div>)}
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>Older RFQs</span><span>Recent RFQs</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="bg-emerald-50 p-3 dark:bg-emerald-950/30"><span className="block text-xs text-emerald-700 dark:text-emerald-400">Won value</span><b className="mt-1 block text-lg text-emerald-800 dark:text-emerald-300">{money.format(visibleQuotations.filter((q) => q.status === "Won").reduce((sum, q) => sum + (q.po_amount || 0), 0))}</b></div><div className="bg-slate-100 p-3 dark:bg-slate-800"><span className="block text-xs text-slate-500 dark:text-slate-400">Avg. quote</span><b className="mt-1 block text-lg">{money.format(visibleQuotations.length ? pipelineValue / visibleQuotations.length : 0)}</b></div></div>
          </section>
        </div>

        <section>
          <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Pipeline</p><h2 className="mt-1 text-2xl font-black">Where work stands</h2></div><span className="text-xs text-slate-500 dark:text-slate-400">{visibleQuotations.length} records</span></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusGroups.map((status) => <div key={status} className="min-h-44 border-t-4 border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">{status}</h3><span className="text-xs font-bold text-slate-500">{visibleQuotations.filter((q) => q.status === status).length}</span></div><div className="mt-4 space-y-2">{visibleQuotations.filter((q) => q.status === status).slice(0, 3).map((quotation, index) => <div key={quotation.id ?? `${quotation.customer_name}-${index}`} className="border border-slate-200 p-3 dark:border-slate-700"><div className="flex justify-between gap-2"><p className="truncate text-xs font-bold">{quotation.customer_name}</p><span className={`h-2 w-2 shrink-0 rounded-full ${status === "Won" ? "bg-emerald-500" : status === "Lost" ? "bg-rose-400" : "bg-amber-400"}`} /></div><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{quotation.rfq_description}</p></div>)}</div></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
