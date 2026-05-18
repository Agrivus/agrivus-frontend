import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Farm {
  id: string;
  name: string;
  location: string | null;
  total_area_ha: string | null;
  water_sources: string | null;
  notes: string | null;
  field_count: number;
  worker_count: number;
  active_crops: number;
  livestock_groups: number;
}

interface Field {
  id: string;
  name: string;
  area_ha: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  current_use: string | null;
  current_crop_type: string | null;
  status: string;
  notes: string | null;
}

interface Worker {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  daily_wage_usd: string | null;
  is_active: boolean;
  total_wages_paid: string | null;
  total_days_worked: string | null;
}

interface CropPlan {
  id: string;
  crop_type: string;
  variety: string | null;
  field_name: string | null;
  planned_area_ha: string | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  status: string;
  expected_yield_kg: string | null;
  activity_count: number;
}

interface LivestockGroup {
  id: string;
  species: string;
  breed: string | null;
  count: number;
  purpose: string | null;
  field_name: string | null;
  total_cost: string | null;
  activity_count: number;
}

interface InventoryItem {
  id: string;
  item_type: string;
  name: string;
  quantity: string;
  unit: string | null;
  unit_cost_usd: string | null;
  reorder_level: string | null;
  expiry_date: string | null;
  low_stock: boolean;
  expiring_soon: boolean;
}

interface LabourSummary {
  total_entries: number;
  workers_active: number;
  total_hours: string;
  total_wages: string;
  total_area: string;
}

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  content: string;
  generated_at: string;
}

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount_usd: string;
  field_name: string | null;
  crop_type: string | null;
  supplier: string | null;
  receipt_ref: string | null;
  notes: string | null;
}

interface Revenue {
  id: string;
  revenue_date: string;
  category: string;
  description: string;
  amount_usd: string;
  quantity: string | null;
  unit: string | null;
  unit_price_usd: string | null;
  buyer_name: string | null;
  field_name: string | null;
  crop_type: string | null;
}

interface Profitability {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: string;
    isProfit: boolean;
  };
  expenses: any;
  revenue: any;
  byCrop: any[];
  expenseCategories: any[];
  trend: any[];
}

interface MarketPrice {
  id: string;
  commodity: string;
  region: string | null;
  price_usd: string;
  unit: string;
  price_date: string;
  demand_level: string | null;
  source: string | null;
  is_ai_generated: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "fields", label: "Fields", icon: "🌍" },
  { key: "crops", label: "Crop Plans", icon: "🌱" },
  { key: "livestock", label: "Livestock", icon: "🐄" },
  { key: "labour", label: "Labour", icon: "👷" },
  { key: "inventory", label: "Inventory", icon: "📦" },
  { key: "calendar", label: "Calendar", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📈" },
  { key: "insights", label: "AI Insights", icon: "🤖" },
  { key: "finance", label: "Finance", icon: "💰" },
  { key: "market",  label: "Market",  icon: "📡" },
  { key: "analytics", label: "Analytics", icon: "📉" },
] as const;

type Section = (typeof NAV)[number]["key"];

const CROP_STATUS_COLOR: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  harvested: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const SPECIES_EMOJI: Record<string, string> = {
  cattle: "🐄",
  goat: "🐐",
  sheep: "🐑",
  poultry: "🐔",
  pig: "🐷",
  fish: "🐟",
  bees: "🐝",
  other: "🐾",
};

const INSIGHT_BORDER: Record<string, string> = {
  labour: "border-blue-400",
  crops: "border-green-400",
  livestock: "border-yellow-400",
  inventory: "border-orange-400",
  financial: "border-purple-400",
  risk: "border-red-400",
  general: "border-gray-300",
};

const pageBgCls =
  "min-h-screen bg-gradient-to-br from-[#fdfaf4] via-white to-[#e8f3e9] text-gray-900";
const panelCls =
  "bg-white/80 backdrop-blur border border-secondary-green/10 shadow-card";
const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-secondary-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-green";
const btnOutlineCls =
  "inline-flex items-center justify-center gap-2 rounded-full border border-secondary-green/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-secondary-green transition hover:border-secondary-green hover:bg-white";
const btnGhostOnDarkCls =
  "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:text-white hover:bg-white/10";
const inputCls =
  "w-full rounded-xl border border-secondary-green/20 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-secondary-green/50";
const inputCompactCls =
  "rounded-xl border border-secondary-green/20 bg-white/80 px-3 py-1.5 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-secondary-green/50";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function FarmOS() {
  // Subscription
  const [subLoading, setSubLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState(false);
  const [subMsg, setSubMsg] = useState("");

  // Data
  const [farm, setFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [livestock, setLivestock] = useState<LivestockGroup[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [labourSummary, setLabourSummary] = useState<LabourSummary | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [plantingNow, setPlantingNow] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  const [expenses,        setExpenses]        = useState<Expense[]>([]);
  const [,                setExpenseSummary]  = useState<any>(null);
  const [revenue,         setRevenue]         = useState<Revenue[]>([]);
  const [,                setRevenueSummary]  = useState<any>(null);
  const [profitability,   setProfitability]   = useState<Profitability | null>(null);
  const [marketPrices,    setMarketPrices]    = useState<MarketPrice[]>([]);
  const [genMarket,       setGenMarket]       = useState(false);
  const [marketInsights,  setMarketInsights]  = useState<any>(null);
  const [finPeriod,       setFinPeriod]       = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // UI
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [genInsights, setGenInsights] = useState(false);

  // Modal
  const [modal, setModal] = useState<{ type: string | null; editing?: any }>(
    { type: null }
  );
  const [form, setForm] = useState<Record<string, any>>({});
  const [analytics,        setAnalytics]        = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [predictions,      setPredictions]      = useState<any>(null);
  const [genPredictions,   setGenPredictions]   = useState(false);
  const [exportYear,       setExportYear]       = useState(new Date().getFullYear());
  const [exportMonth,      setExportMonth]      = useState(new Date().getMonth() + 1);

  // ── Subscription ──────────────────────────────────────────────────────────

  useEffect(() => {
    checkSub();
  }, []);

  const checkSub = async () => {
    try {
      setSubLoading(true);
      const res = await api.get("/farm-os/subscription");
      if (res.data.success) {
        setHasAccess(res.data.data.access === "active");
        setPlans(res.data.data.plans || []);
      }
    } catch {
      setHasAccess(false);
    } finally {
      setSubLoading(false);
    }
  };

  // ── Load data ─────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    if (!hasAccess) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get("/farm-os/farm"),
        api.get("/farm-os/fields"),
        api.get("/farm-os/workers"),
        api.get("/farm-os/crop-plans"),
        api.get("/farm-os/livestock"),
        api.get("/farm-os/inventory"),
        api.get("/farm-os/labour"),
        api.get("/farm-os/insights"),
        api.get("/farm-os/market"),
        api.get("/farm-os/calendar"),
      ]);

      const [
        farmR,
        fieldsR,
        workersR,
        cropsR,
        lsR,
        invR,
        labR,
        insR,
        marketR,
        calR,
      ] = results;

      if (farmR.status === "fulfilled" && farmR.value.data.success)
        setFarm(farmR.value.data.data.farm);
      if (fieldsR.status === "fulfilled" && fieldsR.value.data.success)
        setFields(fieldsR.value.data.data.fields);
      if (workersR.status === "fulfilled" && workersR.value.data.success)
        setWorkers(workersR.value.data.data.workers);
      if (cropsR.status === "fulfilled" && cropsR.value.data.success)
        setCropPlans(cropsR.value.data.data.cropPlans);
      if (lsR.status === "fulfilled" && lsR.value.data.success)
        setLivestock(lsR.value.data.data.groups);
      if (invR.status === "fulfilled" && invR.value.data.success) {
        setInventory(invR.value.data.data.inventory);
        setAlerts(invR.value.data.data.alerts || []);
      }
      if (labR.status === "fulfilled" && labR.value.data.success)
        setLabourSummary(labR.value.data.data.summary);
      if (insR.status === "fulfilled" && insR.value.data.success)
        setInsights(insR.value.data.data.insights);
      if (marketR && marketR.status === "fulfilled" && marketR.value.data.success)
        setMarketPrices(marketR.value.data.data.prices);
      if (calR.status === "fulfilled" && calR.value.data.success) {
        setCalendar(calR.value.data.data.calendar);
        setPlantingNow(calR.value.data.data.plantingNow);
      }
    } finally {
      setLoading(false);
    }
  }, [hasAccess]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (section !== "reports" || !hasAccess) return;
    Promise.allSettled([
      api.get("/farm-os/reports/weekly"),
      api.get("/farm-os/reports/monthly"),
    ]).then(([w, m]) => {
      if (w.status === "fulfilled" && w.value.data.success)
        setWeeklyReport(w.value.data.data);
      if (m.status === "fulfilled" && m.value.data.success)
        setMonthlyReport(m.value.data.data);
    });
  }, [section, hasAccess]);

  useEffect(() => {
    if ((section !== "finance" && section !== "market") || !hasAccess) return;
    const loadFinance = async () => {
      try {
        const start = `${finPeriod.year}-${String(finPeriod.month).padStart(2,"0")}-01`;
        const end   = new Date(finPeriod.year, finPeriod.month, 0).toISOString().split("T")[0];
        const [expR, revR, profR] = await Promise.allSettled([
          api.get("/farm-os/expenses",       { params: { startDate: start, endDate: end } }),
          api.get("/farm-os/revenue",        { params: { startDate: start, endDate: end } }),
          api.get("/farm-os/profitability",  { params: { year: finPeriod.year, month: finPeriod.month } }),
        ]);
        if (expR.status==="fulfilled"&&expR.value.data.success) {
          setExpenses(expR.value.data.data.expenses);
          setExpenseSummary(expR.value.data.data.summary);
        }
        if (revR.status==="fulfilled"&&revR.value.data.success) {
          setRevenue(revR.value.data.data.revenue);
          setRevenueSummary(revR.value.data.data.summary);
        }
        if (profR.status==="fulfilled"&&profR.value.data.success)
          setProfitability(profR.value.data.data);
      } catch { /* non-critical */ }
    };
    loadFinance();
  }, [section, hasAccess, finPeriod]);

  useEffect(() => {
    if (section !== "analytics" || !hasAccess) return;
    const load = async () => {
      try {
        setAnalyticsLoading(true);
        const r = await api.get("/farm-os/analytics");
        if (r.data.success) setAnalytics(r.data.data);
      } catch { /* non-critical */ }
      finally { setAnalyticsLoading(false); }
    };
    load();
  }, [section, hasAccess]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openModal = (type: string, editing?: any) => {
    setModal({ type, editing });
    setForm(editing ? { ...editing } : {});
  };

  const closeModal = () => {
    setModal({ type: null });
    setForm({});
  };

  const navigate = (s: Section) => {
    setSection(s);
    setSidebarOpen(false);
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSubMsg("");
      const r = await api.post("/farm-os/subscribe/wallet", { planId });
      if (r.data.success) {
        setSubMsg("Subscription activated!");
        checkSub();
      }
    } catch (e: any) {
      setSubMsg(e.response?.data?.message ?? "Payment failed");
    } finally {
      setSubscribing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { type, editing } = modal;
    try {
      switch (type) {
        case "farm":
          await api.post("/farm-os/farm", form);
          flash("success", "Farm profile saved");
          loadAll();
          break;
        case "field":
          editing?.id
            ? await api.put(`/farm-os/fields/${editing.id}`, form)
            : await api.post("/farm-os/fields", form);
          flash("success", editing?.id ? "Field updated" : "Field created");
          {
            const fr = await api.get("/farm-os/fields");
            if (fr.data.success) setFields(fr.data.data.fields);
          }
          break;
        case "worker":
          editing?.id
            ? await api.put(`/farm-os/workers/${editing.id}`, form)
            : await api.post("/farm-os/workers", form);
          flash("success", editing?.id ? "Worker updated" : "Worker added");
          {
            const wr = await api.get("/farm-os/workers");
            if (wr.data.success) setWorkers(wr.data.data.workers);
          }
          break;
        case "crop":
          editing?.id
            ? await api.put(`/farm-os/crop-plans/${editing.id}`, form)
            : await api.post("/farm-os/crop-plans", form);
          flash(
            "success",
            editing?.id ? "Crop plan updated" : "Crop plan created"
          );
          {
            const cr = await api.get("/farm-os/crop-plans");
            if (cr.data.success) setCropPlans(cr.data.data.cropPlans);
          }
          break;
        case "crop-activity":
          await api.post("/farm-os/crop-activities", form);
          flash("success", "Activity logged");
          break;
        case "livestock":
          editing?.id
            ? await api.put(`/farm-os/livestock/${editing.id}`, form)
            : await api.post("/farm-os/livestock", form);
          flash("success", editing?.id ? "Updated" : "Livestock group created");
          {
            const lr = await api.get("/farm-os/livestock");
            if (lr.data.success) setLivestock(lr.data.data.groups);
          }
          break;
        case "livestock-activity":
          await api.post("/farm-os/livestock-activities", form);
          flash("success", "Activity logged");
          {
            const lr2 = await api.get("/farm-os/livestock");
            if (lr2.data.success) setLivestock(lr2.data.data.groups);
          }
          break;
        case "labour":
          await api.post("/farm-os/labour", form);
          flash("success", "Labour day logged");
          {
            const labR = await api.get("/farm-os/labour");
            if (labR.data.success) setLabourSummary(labR.data.data.summary);
          }
          break;
        case "inventory":
          editing?.id
            ? await api.put(`/farm-os/inventory/${editing.id}`, form)
            : await api.post("/farm-os/inventory", form);
          flash("success", editing?.id ? "Item updated" : "Item added");
          {
            const ir = await api.get("/farm-os/inventory");
            if (ir.data.success) {
              setInventory(ir.data.data.inventory);
              setAlerts(ir.data.data.alerts || []);
            }
          }
          break;
        case "calendar":
          await api.post("/farm-os/calendar", form);
          flash("success", "Calendar entry added");
          {
            const calR = await api.get("/farm-os/calendar");
            if (calR.data.success) {
              setCalendar(calR.data.data.calendar);
              setPlantingNow(calR.data.data.plantingNow);
            }
          }
          break;
        case "expense":
          editing?.id
            ? await api.put(`/farm-os/expenses/${editing.id}`, form)
            : await api.post("/farm-os/expenses", form);
          flash("success", editing?.id ? "Expense updated" : "Expense recorded");
          // reload finance
          setFinPeriod(p => ({ ...p })); // trigger re-fetch
          break;
        case "revenue-entry":
          editing?.id
            ? await api.put(`/farm-os/revenue/${editing.id}`, form)
            : await api.post("/farm-os/revenue", form);
          flash("success", editing?.id ? "Revenue updated" : "Revenue recorded");
          setFinPeriod(p => ({ ...p }));
          break;
        case "market-price":
          await api.post("/farm-os/market", form);
          flash("success", "Market price added");
          const mpR = await api.get("/farm-os/market");
          if (mpR.data.success) setMarketPrices(mpR.data.data.prices);
          break;
      }
      closeModal();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to save");
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setGenInsights(true);
      const r = await api.post("/farm-os/insights/generate");
      if (r.data.success) {
        setInsights(r.data.data.insights);
        flash("success", "AI insights generated");
      }
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to generate insights");
    } finally {
      setGenInsights(false);
    }
  };

  // ── Gates ─────────────────────────────────────────────────────────────────

  if (subLoading)
    return (
      <div className={`${pageBgCls} flex items-center justify-center`}>
        <LoadingSpinner />
      </div>
    );

  if (!hasAccess)
    return (
      <div className={`${pageBgCls} py-12 px-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🚜</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm OS</h1>
            <p className="text-gray-600 text-lg">
              The complete digital operating system for your farm.
            </p>
          </div>
          <Card className={`${panelCls} mb-6`}>
            <h2 className="font-bold text-gray-900 mb-3">
              Everything in one place
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                "👷 Labour & payroll",
                "🌱 Crop planning",
                "🐄 Livestock management",
                "📦 Inventory & alerts",
                "📊 Weekly/monthly reports",
                "🤖 AI farm insights",
                "🌍 Field management",
                "📅 Cropping calendar",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="text-green-500">✓</span>
                  {f}
                </div>
              ))}
            </div>
          </Card>
          {subMsg && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
                subMsg.includes("activated")
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {subMsg}
            </div>
          )}
          {plans.length === 0 ? (
            <Card className={panelCls}>
              <p className="text-center text-gray-500 py-6">
                No Farm OS plans available. Contact support.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan: any) => (
                <Card
                  key={plan.id}
                  className={`${panelCls} border-2 ${
                    plan.billing_cycle === "annual"
                      ? "border-green-500"
                      : "border-gray-200"
                  }`}
                >
                  {plan.billing_cycle === "annual" && (
                    <div className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">
                      Best Value
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-green-600 my-2">
                    ${parseFloat(plan.price_usd).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500">
                      /{plan.billing_cycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                    className={`w-full mt-2 ${btnPrimaryCls} disabled:opacity-50`}
                  >
                    {subscribing ? "Processing..." : "Pay from Wallet"}
                  </button>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className={`${btnOutlineCls} mx-auto`}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );

  if (!farm && !loading)
    return (
      <div className={`${pageBgCls} py-12 px-4`}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏡</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Set Up Your Farm
            </h1>
            <p className="text-gray-600 mt-1">
              Enter your farm details to get started.
            </p>
          </div>
          <Card className={panelCls}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post("/farm-os/farm", form);
                  loadAll();
                } catch (err: any) {
                  flash("error", err.response?.data?.message ?? "Failed");
                }
              }}
              className="space-y-4"
            >
              <Field label="Farm Name" required>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="e.g. Mukasa Family Farm"
                  className={inputCls}
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={form.location ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="e.g. Mazowe, Mashonaland"
                  className={inputCls}
                />
              </Field>
              <Field label="Total Size (hectares)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.total_area_ha ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      total_area_ha: e.target.value,
                    }))
                  }
                  placeholder="e.g. 50"
                  className={inputCls}
                />
              </Field>
              <Field label="Water Sources">
                <input
                  type="text"
                  value={form.water_sources ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      water_sources: e.target.value,
                    }))
                  }
                  placeholder="e.g. Borehole, River, Dam"
                  className={inputCls}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <button
                type="submit"
                className={`w-full ${btnPrimaryCls}`}
              >
                Save Farm Profile →
              </button>
            </form>
          </Card>
        </div>
      </div>
    );

  // ── Main layout ───────────────────────────────────────────────────────────

  const activeCrops = cropPlans.filter((c) => c.status === "active").length;
  const totalLivestock = livestock.reduce((s, g) => s + g.count, 0);

  const handleExportCSV = async (type: string) => {
    try {
      const start = `${exportYear}-${String(exportMonth).padStart(2,"0")}-01`;
      const end   = new Date(exportYear, exportMonth, 0).toISOString().split("T")[0];
      const r = await api.get(`/farm-os/export/csv?type=${type}&startDate=${start}&endDate=${end}`, { responseType: "blob" });
      const url  = URL.createObjectURL(new Blob([r.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href  = url;
      link.download = `farm-${type}-${start}-to-${end}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { flash("error", "Export failed"); }
  };

  const handleExportReport = async () => {
    try {
      const r = await api.get(`/farm-os/export/report?year=${exportYear}&month=${exportMonth}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([r.data], { type: "text/html" }));
      window.open(url, "_blank");
    } catch { flash("error", "Report export failed"); }
  };

  const analyticsTrendData = Array.isArray(analytics?.trend)
    ? analytics.trend.map((row: any) => ({
        label: row.month ?? row.label ?? row.date ?? row.period ?? "",
        revenue: Number(row.revenue ?? row.total_revenue ?? 0),
        expenses: Number(row.expenses ?? row.total_expenses ?? 0),
        net: Number(row.profit ?? row.netProfit ?? row.net_profit ?? 0),
      }))
    : [];
  const analyticsCropData = Array.isArray(analytics?.byCrop)
    ? analytics.byCrop.map((row: any) => ({
        label: row.crop ?? row.crop_type ?? row.name ?? row.label ?? "Unknown",
        value: Number(row.value ?? row.profit ?? row.revenue ?? row.count ?? 0),
      }))
    : [];
  const analyticsCategoryData = Array.isArray(
    analytics?.byCategory ?? analytics?.categories,
  )
    ? (analytics.byCategory ?? analytics.categories).map((row: any) => ({
        label: row.category ?? row.name ?? row.label ?? "Other",
        value: Number(row.value ?? row.amount ?? row.total ?? row.count ?? 0),
      }))
    : [];
  const predictionData = Array.isArray(
    predictions?.predictions ?? predictions?.forecast ?? predictions?.trend,
  )
    ? (predictions.predictions ?? predictions.forecast ?? predictions.trend).map(
        (row: any) => ({
          label: row.month ?? row.label ?? row.period ?? row.date ?? "",
          value: Number(row.value ?? row.amount ?? row.projection ?? row.total ?? 0),
        }),
      )
    : [];
  const chartColors = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className={`${pageBgCls} relative flex min-h-screen flex-col overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-secondary-green/20 blur-3xl" />
        <div className="absolute top-12 -right-28 h-80 w-80 rounded-full bg-accent-gold/20 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/3 h-80 w-80 rounded-full bg-primary-green/15 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <div className="bg-dark-green/95 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-card backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden text-white p-1"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <div className="font-bold text-lg leading-tight">
                🚜 {farm?.name ?? "Farm OS"}
              </div>
              <div className="text-xs text-green-100/90">
                {farm?.location ?? ""}
                {farm?.total_area_ha
                  ? ` · ${parseFloat(farm.total_area_ha).toLocaleString()} ha`
                  : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => openModal("farm", farm)}
              className={btnGhostOnDarkCls}
            >
              Edit Farm
            </button>
            <Link
              to="/dashboard"
              className={btnGhostOnDarkCls}
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {feedback && (
          <div
            className={`mx-4 mt-3 px-4 py-3 rounded-lg border text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-56 bg-white/80 backdrop-blur border-r border-secondary-green/10 flex flex-col transition-transform duration-200 ease-in-out pt-16 md:pt-0`}
          >
            <nav className="flex-1 py-4 overflow-y-auto">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    section === item.key
                      ? "bg-green-50 text-primary-green border-r-2 border-primary-green"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                  {item.key === "inventory" && alerts.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {alerts.length}
                    </span>
                  )}
                  {item.key === "insights" && insights.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400">
                      {insights.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            {/* Quick log actions at bottom of sidebar */}
            <div className="p-3 border-t border-gray-200 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1 mb-2">
                Quick Log
              </p>
              {[
                {
                  label: "Labour Day",
                  action: () => {
                    navigate("labour");
                    openModal("labour");
                  },
                },
                {
                  label: "Crop Activity",
                  action: () => {
                    navigate("crops");
                    openModal("crop-activity");
                  },
                },
                {
                  label: "Livestock",
                  action: () => {
                    navigate("livestock");
                    openModal("livestock-activity");
                  },
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-green-50 hover:text-primary-green rounded-lg transition-colors"
                >
                  + {a.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Sidebar overlay — mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black bg-opacity-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Farm Overview</h2>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Fields",
                    value: farm?.field_count ?? 0,
                    icon: "🌍",
                    color: "bg-blue-50 text-blue-700",
                    onClick: () => navigate("fields"),
                  },
                  {
                    label: "Active Crops",
                    value: activeCrops,
                    icon: "🌱",
                    color: "bg-green-50 text-green-700",
                    onClick: () => navigate("crops"),
                  },
                  {
                    label: "Livestock",
                    value: totalLivestock,
                    icon: "🐄",
                    color: "bg-yellow-50 text-yellow-700",
                    onClick: () => navigate("livestock"),
                  },
                  {
                    label: "Workers",
                    value: farm?.worker_count ?? 0,
                    icon: "👷",
                    color: "bg-purple-50 text-purple-700",
                    onClick: () => navigate("labour"),
                  },
                ].map((kpi) => (
                  <button
                    key={kpi.label}
                    onClick={kpi.onClick}
                    className="group relative w-full overflow-hidden rounded-2xl border border-secondary-green/10 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${kpi.color} text-xl shadow-sm`}
                    >
                      {kpi.icon}
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {kpi.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {kpi.value}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 transition group-hover:text-gray-600">
                        View
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                ))}
              </div>

              {/* Labour this month */}
              {labourSummary && (
                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">
                      Labour This Month
                    </h3>
                    <button
                      onClick={() => navigate("labour")}
                      className="text-sm font-semibold text-secondary-green hover:text-primary-green"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Man-Days",
                        value: labourSummary.total_entries,
                      },
                      {
                        label: "Hours",
                        value: `${parseFloat(
                          labourSummary.total_hours || "0"
                        ).toFixed(0)}h`,
                      },
                      {
                        label: "Wages Paid",
                        value: `$${parseFloat(
                          labourSummary.total_wages || "0"
                        ).toFixed(2)}`,
                      },
                      {
                        label: "Area (ha)",
                        value: parseFloat(
                          labourSummary.total_area || "0"
                        ).toFixed(1),
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl border border-secondary-green/10 bg-white/70 p-3 text-center shadow-sm"
                      >
                        <div className="text-xl font-bold text-gray-900">
                          {s.value}
                        </div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {modal.type === "expense" && <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category" required>
                    <select value={form.category??""} onChange={e=>setForm(f=>({...f,category:e.target.value}))} required className={inputCls}>
                      <option value="">Select...</option>
                      { ["labour","seeds","fertiliser","chemicals","fuel","equipment","irrigation","transport","veterinary","repairs","rent","other"].map(c=>(<option key={c} value={c}>{c}</option>)) }
                    </select>
                  </Field>
                  <Field label="Date">
                    <input type="date" value={form.expense_date??new Date().toISOString().split("T")[0]} onChange={e=>setForm(f=>({...f,expense_date:e.target.value}))} className={inputCls}/>
                  </Field>
                </div>
                <Field label="Description" required>
                  <input type="text" value={form.description??""} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="e.g. Compound D fertiliser - Block A" className={inputCls}/>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount (USD)" required>
                    <input type="number" min="0" step="0.01" value={form.amount_usd??""} onChange={e=>setForm(f=>({...f,amount_usd:e.target.value}))} required placeholder="e.g. 45.00" className={inputCls}/>
                  </Field>
                  <Field label="Supplier">
                    <input type="text" value={form.supplier??""} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} placeholder="e.g. Agritex" className={inputCls}/>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Field">
                    <select value={form.field_id??""} onChange={e=>setForm(f=>({...f,field_id:e.target.value}))} className={inputCls}>
                      <option value="">None</option>
                      {fields.map(f=>(<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                  </Field>
                  <Field label="Crop Plan">
                    <select value={form.crop_plan_id??""} onChange={e=>setForm(f=>({...f,crop_plan_id:e.target.value}))} className={inputCls}>
                      <option value="">None</option>
                      {cropPlans.map(c=>(<option key={c.id} value={c.id}>{c.crop_type}</option>))}
                    </select>
                  </Field>
                </div>
                <Field label="Receipt Ref">
                  <input type="text" value={form.receipt_ref??""} onChange={e=>setForm(f=>({...f,receipt_ref:e.target.value}))} placeholder="e.g. INV-001" className={inputCls}/>
                </Field>
                <Field label="Notes">
                  <textarea value={form.notes??""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className={inputCls+" resize-none"}/>
                </Field>
              </>}

              {modal.type === "revenue-entry" && <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category" required>
                    <select value={form.category??""} onChange={e=>setForm(f=>({...f,category:e.target.value}))} required className={inputCls}>
                      <option value="">Select...</option>
                      { ["crop_sale","livestock_sale","milk","eggs","wool","honey","contract","grant","other"].map(c=>(<option key={c} value={c}>{c.replace("_"," ")}</option>)) }
                    </select>
                  </Field>
                  <Field label="Date">
                    <input type="date" value={form.revenue_date??new Date().toISOString().split("T")[0]} onChange={e=>setForm(f=>({...f,revenue_date:e.target.value}))} className={inputCls}/>
                  </Field>
                </div>
                <Field label="Description" required>
                  <input type="text" value={form.description??""} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="e.g. Tomato sale - 500kg to Mbare Market" className={inputCls}/>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Total Amount (USD)" required>
                    <input type="number" min="0" step="0.01" value={form.amount_usd??""} onChange={e=>setForm(f=>({...f,amount_usd:e.target.value}))} required className={inputCls}/>
                  </Field>
                  <Field label="Buyer Name">
                    <input type="text" value={form.buyer_name??""} onChange={e=>setForm(f=>({...f,buyer_name:e.target.value}))} placeholder="e.g. Mbare Market" className={inputCls}/>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Quantity">
                    <input type="number" min="0" step="0.1" value={form.quantity??""} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} className={inputCls}/>
                  </Field>
                  <Field label="Unit">
                    <input type="text" value={form.unit??""} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="kg, litres" className={inputCls}/>
                  </Field>
                  <Field label="Unit Price ($)">
                    <input type="number" min="0" step="0.01" value={form.unit_price_usd??""} onChange={e=>setForm(f=>({...f,unit_price_usd:e.target.value}))} className={inputCls}/>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Crop Plan">
                    <select value={form.crop_plan_id??""} onChange={e=>setForm(f=>({...f,crop_plan_id:e.target.value}))} className={inputCls}>
                      <option value="">None</option>
                      {cropPlans.map(c=>(<option key={c.id} value={c.id}>{c.crop_type}</option>))}
                    </select>
                  </Field>
                  <Field label="Field">
                    <select value={form.field_id??""} onChange={e=>setForm(f=>({...f,field_id:e.target.value}))} className={inputCls}>
                      <option value="">None</option>
                      {fields.map(f=>(<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea value={form.notes??""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className={inputCls+" resize-none"}/>
                </Field>
              </>}

              {modal.type === "market-price" && <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Commodity" required>
                    <input type="text" value={form.commodity??""} onChange={e=>setForm(f=>({...f,commodity:e.target.value}))} required placeholder="e.g. Tomatoes" className={inputCls}/>
                  </Field>
                  <Field label="Region">
                    <input type="text" value={form.region??""} onChange={e=>setForm(f=>({...f,region:e.target.value}))} placeholder="e.g. Harare" className={inputCls}/>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Price (USD)" required>
                    <input type="number" min="0" step="0.01" value={form.price_usd??""} onChange={e=>setForm(f=>({...f,price_usd:e.target.value}))} required className={inputCls}/>
                  </Field>
                  <Field label="Unit" required>
                    <input type="text" value={form.unit??""} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} required placeholder="kg, litre" className={inputCls}/>
                  </Field>
                  <Field label="Demand">
                    <select value={form.demand_level??""} onChange={e=>setForm(f=>({...f,demand_level:e.target.value}))} className={inputCls}>
                      <option value="">Unknown</option>
                      { ["low","medium","high","very_high"].map(d=>(<option key={d} value={d}>{d.replace("_"," ")}</option>)) }
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input type="date" value={form.price_date??new Date().toISOString().split("T")[0]} onChange={e=>setForm(f=>({...f,price_date:e.target.value}))} className={inputCls}/>
                  </Field>
                  <Field label="Source">
                    <input type="text" value={form.source??""} onChange={e=>setForm(f=>({...f,source:e.target.value}))} placeholder="e.g. Mbare Market" className={inputCls}/>
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea value={form.notes??""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className={inputCls+" resize-none"}/>
                </Field>
              </>}

              {/* Two-column: Alerts + Planting now */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inventory alerts */}
                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">
                      ⚠️ Inventory Alerts
                    </h3>
                    <button
                      onClick={() => navigate("inventory")}
                      className="text-sm font-semibold text-secondary-green hover:text-primary-green"
                    >
                      View all →
                    </button>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary-green/20 bg-white/60 py-6 text-center text-sm text-gray-500">
                      All stock levels OK ✓
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              {item.item_type}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {item.low_stock && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Low
                              </span>
                            )}
                            {item.expiring_soon && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                Expiring
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Planting now */}
                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">
                      🌱 Planting This Month
                    </h3>
                    <button
                      onClick={() => navigate("calendar")}
                      className="text-sm font-semibold text-secondary-green hover:text-primary-green"
                    >
                      Calendar →
                    </button>
                  </div>
                  {plantingNow.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary-green/20 bg-white/60 py-6 text-center text-sm text-gray-500">
                      No calendar entries for this month
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {plantingNow.map((e: any) => (
                        <span
                          key={e.id}
                          className="rounded-full bg-secondary-green/10 px-3 py-1 text-sm font-semibold text-secondary-green"
                        >
                          {e.crop_type}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Active crops summary */}
              {cropPlans.filter((c) => c.status === "active").length > 0 && (
                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">
                      Active Crop Plans
                    </h3>
                    <button
                      onClick={() => navigate("crops")}
                      className="text-sm font-semibold text-secondary-green hover:text-primary-green"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {cropPlans
                      .filter((c) => c.status === "active")
                      .slice(0, 3)
                      .map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {plan.crop_type}
                            </span>
                            {plan.variety && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({plan.variety})
                              </span>
                            )}
                            {plan.field_name && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {plan.field_name}
                              </span>
                            )}
                          </div>
                          {plan.expected_harvest_date && (
                            <span className="text-sm text-gray-600">
                              Harvest:{" "}
                              {new Date(
                                plan.expected_harvest_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── FIELDS ── */}
          {section === "fields" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Fields & Zones
                </h2>
                <button
                  onClick={() => openModal("field")}
                  className={btnPrimaryCls}
                >
                  + Add Field
                </button>
              </div>
              {fields.length === 0 ? (
                <Card className={panelCls}>
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-3">🌍</div>
                    <p className="font-medium text-gray-700">No fields yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add fields or zones to organise your farm
                    </p>
                    <button
                      onClick={() => openModal("field")}
                      className={`mt-4 ${btnPrimaryCls}`}
                    >
                      Add First Field
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <Card
                      key={field.id}
                      className={`${panelCls} group transition hover:-translate-y-0.5 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {field.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            field.status === "active"
                              ? "bg-secondary-green/10 text-secondary-green font-semibold"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {field.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-600">
                        {field.area_ha && (
                          <div className="flex justify-between">
                            <span>Size</span>
                            <span className="font-medium">
                              {parseFloat(field.area_ha).toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {field.current_use && (
                          <div className="flex justify-between">
                            <span>Use</span>
                            <span className="font-medium capitalize">
                              {field.current_use}
                            </span>
                          </div>
                        )}
                        {field.current_crop_type && (
                          <div className="flex justify-between">
                            <span>Crop</span>
                            <span className="font-medium text-green-700">
                              {field.current_crop_type}
                            </span>
                          </div>
                        )}
                        {field.soil_type && (
                          <div className="flex justify-between">
                            <span>Soil</span>
                            <span className="font-medium">
                              {field.soil_type}
                            </span>
                          </div>
                        )}
                        {field.irrigation_type && (
                          <div className="flex justify-between">
                            <span>Irrigation</span>
                            <span className="font-medium">
                              {field.irrigation_type}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openModal("field", field)}
                        className="mt-3 text-xs font-semibold text-secondary-green hover:text-primary-green"
                      >
                        Edit field →
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CROPS ── */}
          {section === "crops" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crop Plans</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("crop-activity")}
                    className={btnOutlineCls}
                  >
                    + Log Activity
                  </button>
                  <button
                    onClick={() => openModal("crop")}
                    className={btnPrimaryCls}
                  >
                    + New Crop Plan
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "active", "planned", "harvested"].map((s) => {
                  const count =
                    s === "all"
                      ? cropPlans.length
                      : cropPlans.filter((c) => c.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, _cropFilter: s }))}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        (form._cropFilter || "all") === s
                          ? "border-secondary-green bg-secondary-green text-white shadow-sm"
                          : "border-secondary-green/20 bg-white/70 text-gray-600 hover:border-secondary-green/40 hover:bg-white"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>

              {cropPlans.length === 0 ? (
                <Card className={panelCls}>
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-3">🌱</div>
                    <p className="font-medium text-gray-700">No crop plans yet</p>
                    <button
                      onClick={() => openModal("crop")}
                      className={`mt-4 ${btnPrimaryCls}`}
                    >
                      Create First Plan
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {cropPlans
                    .filter(
                      (c) =>
                        (form._cropFilter || "all") === "all" ||
                        c.status === form._cropFilter
                    )
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className={`${panelCls} transition hover:-translate-y-0.5 hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-lg">
                                {plan.crop_type}
                              </span>
                              {plan.variety && (
                                <span className="text-sm text-gray-500">
                                  ({plan.variety})
                                </span>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  CROP_STATUS_COLOR[plan.status]
                                }`}
                              >
                                {plan.status.toUpperCase()}
                              </span>
                              {plan.field_name && (
                                <span className="text-xs bg-secondary-green/10 text-secondary-green px-2 py-0.5 rounded-full font-semibold">
                                  {plan.field_name}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                              {plan.planned_area_ha && (
                                <div>
                                  Area:{" "}
                                  <strong>
                                    {parseFloat(
                                      plan.planned_area_ha
                                    ).toLocaleString()} ha
                                  </strong>
                                </div>
                              )}
                              {plan.planting_date && (
                                <div>
                                  Planted:{" "}
                                  <strong>
                                    {new Date(
                                      plan.planting_date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </strong>
                                </div>
                              )}
                              {plan.expected_harvest_date && (
                                <div>
                                  Harvest:{" "}
                                  <strong>
                                    {new Date(
                                      plan.expected_harvest_date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </strong>
                                </div>
                              )}
                              {plan.expected_yield_kg && (
                                <div>
                                  Expected:{" "}
                                  <strong>
                                    {parseFloat(
                                      plan.expected_yield_kg
                                    ).toLocaleString()} kg
                                  </strong>
                                </div>
                              )}
                            </div>
                            {plan.activity_count > 0 && (
                              <div className="mt-1.5 text-xs text-gray-400">
                                {plan.activity_count} activities logged
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openModal("crop", plan)}
                            className="text-xs font-semibold text-secondary-green hover:text-primary-green shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── LIVESTOCK ── */}
          {section === "livestock" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Livestock</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("livestock-activity")}
                    className={btnOutlineCls}
                  >
                    + Log Activity
                  </button>
                  <button
                    onClick={() => openModal("livestock")}
                    className={btnPrimaryCls}
                  >
                    + Add Group
                  </button>
                </div>
              </div>
              {livestock.length === 0 ? (
                <Card className={panelCls}>
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-3">🐄</div>
                    <p className="font-medium text-gray-700">
                      No livestock recorded
                    </p>
                    <button
                      onClick={() => openModal("livestock")}
                      className={`${btnPrimaryCls} mt-4`}
                    >
                      Add Livestock
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {livestock.map((group) => (
                    <Card key={group.id} className={panelCls}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">
                            {SPECIES_EMOJI[group.species] ?? "🐾"}
                          </span>
                          <div>
                            <div className="font-bold text-gray-900 capitalize">
                              {group.species}
                            </div>
                            {group.breed && (
                              <div className="text-xs text-gray-500">
                                {group.breed}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            {group.count}
                          </div>
                          <div className="text-xs text-gray-500">head</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {group.purpose && (
                          <div className="flex justify-between">
                            <span>Purpose</span>
                            <span className="font-medium capitalize">
                              {group.purpose}
                            </span>
                          </div>
                        )}
                        {group.field_name && (
                          <div className="flex justify-between">
                            <span>Location</span>
                            <span className="font-medium">
                              {group.field_name}
                            </span>
                          </div>
                        )}
                        {group.total_cost && parseFloat(group.total_cost) > 0 && (
                          <div className="flex justify-between">
                            <span>Total costs</span>
                            <span className="font-medium">
                              ${parseFloat(group.total_cost).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {group.activity_count > 0 && (
                          <div className="flex justify-between">
                            <span>Activities</span>
                            <span className="font-medium">
                              {group.activity_count}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openModal("livestock", group)}
                        className="mt-3 text-xs font-semibold text-secondary-green hover:text-primary-green"
                      >
                        Edit group →
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LABOUR ── */}
          {section === "labour" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Labour Tracking
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("worker")}
                    className={btnOutlineCls}
                  >
                    + Add Worker
                  </button>
                  <button
                    onClick={() => openModal("labour")}
                    className={btnPrimaryCls}
                  >
                    + Log Labour Day
                  </button>
                </div>
              </div>

              {labourSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Man-Days (month)",
                      value: labourSummary.total_entries,
                      icon: "👥",
                    },
                    {
                      label: "Total Hours",
                      value: `${parseFloat(
                        labourSummary.total_hours || "0"
                      ).toFixed(0)}h`,
                      icon: "⏱️",
                    },
                    {
                      label: "Wages Paid",
                      value: `$${parseFloat(
                        labourSummary.total_wages || "0"
                      ).toFixed(2)}`,
                      icon: "💰",
                    },
                    {
                      label: "Area Covered (ha)",
                      value: parseFloat(
                        labourSummary.total_area || "0"
                      ).toFixed(2),
                      icon: "🌾",
                    },
                  ].map((s) => (
                    <Card key={s.label} className={`${panelCls} rounded-2xl border-l-4 border-blue-400`}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {s.value}
                        </div>
                        <div className="text-xs text-gray-600">{s.label}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Card className={panelCls}>
                <h3 className="font-bold text-gray-900 mb-4">
                  Workers ({workers.length})
                </h3>
                {workers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No workers added yet.</p>
                    <button
                      onClick={() => openModal("worker")}
                      className="mt-2 font-semibold text-secondary-green hover:text-primary-green text-sm"
                    >
                      + Add Worker
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                          worker.is_active ? "border-secondary-green/10 bg-white/70" : "border-red-200/50 bg-red-50/60"
                        }`}
                      >
                        <div>
                          <span className="font-medium text-gray-900 text-sm">
                            {worker.full_name}
                          </span>
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              worker.role === "manager"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {worker.role}
                          </span>
                          {worker.phone && (
                            <span className="ml-2 text-xs text-gray-400">
                              {worker.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {worker.daily_wage_usd && (
                            <span>
                              ${parseFloat(worker.daily_wage_usd).toFixed(2)}/day
                            </span>
                          )}
                          {worker.total_days_worked && (
                            <span>{worker.total_days_worked} days</span>
                          )}
                          <button
                            onClick={() => openModal("worker", worker)}
                            className="font-semibold text-secondary-green hover:text-primary-green"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {section === "inventory" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                <button
                  onClick={() => openModal("inventory")}
                  className={btnPrimaryCls}
                >
                  + Add Item
                </button>
              </div>
              {alerts.length > 0 && (
                <div className="mb-4 rounded-xl border border-red-200/50 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  ⚠️ {alerts.length} item{alerts.length !== 1 ? "s" : ""} need
                  attention
                </div>
              )}
              {inventory.length === 0 ? (
                <Card className={panelCls}>
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-medium text-gray-700">No inventory items</p>
                    <button
                      onClick={() => openModal("inventory")}
                      className={`${btnPrimaryCls} mt-4`}
                    >
                      Add First Item
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <div className={`${panelCls} rounded-2xl overflow-hidden`}>
                  <table className="w-full">
                    <thead className="border-b border-secondary-green/10 bg-white/50">
                      <tr>
                        {[
                          "Item",
                          "Type",
                          "Stock",
                          "Unit Cost",
                          "Total Value",
                          "Status",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-green/5">
                      {inventory.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition hover:bg-white/60 ${
                            item.low_stock || item.expiring_soon
                              ? "bg-red-50/40"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 text-sm">
                              {item.name}
                            </div>
                            {item.expiry_date && (
                              <div className="text-xs text-gray-400">
                                Exp: {new Date(item.expiry_date).toLocaleDateString("en-GB")}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {item.item_type}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {parseFloat(item.quantity).toLocaleString()} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.unit_cost_usd
                              ? `$${parseFloat(item.unit_cost_usd).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {item.unit_cost_usd
                              ? `$${(
                                  parseFloat(item.quantity) *
                                  parseFloat(item.unit_cost_usd)
                                ).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {item.low_stock && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  Low
                                </span>
                              )}
                              {item.expiring_soon && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                  Expiring
                                </span>
                              )}
                              {!item.low_stock && !item.expiring_soon && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  OK
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openModal("inventory", item)}
                              className="text-xs font-semibold text-secondary-green hover:text-primary-green"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR ── */}
          {section === "calendar" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cropping Calendar
                </h2>
                <button
                  onClick={() => openModal("calendar")}
                  className={btnPrimaryCls}
                >
                  + Add Entry
                </button>
              </div>
              {plantingNow.length > 0 && (
                <Card className={`${panelCls} mb-4 border-l-4 border-secondary-green/60`}>
                  <h3 className="font-bold text-gray-900 mb-2">
                    🌱 Plant This Month
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plantingNow.map((e: any) => (
                      <span
                        key={e.id}
                        className="bg-secondary-green/20 text-gray-900 text-sm px-3 py-1 rounded-full font-medium border border-secondary-green/30"
                      >
                        {e.crop_type}
                        {e.expected_harvest_weeks
                          ? ` (${e.expected_harvest_weeks}wks)`
                          : ""}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
              <div className="overflow-x-auto">
                <div className={`${panelCls} rounded-2xl overflow-hidden`}>
                <table className="w-full">
                  <thead className="border-b border-secondary-green/10 bg-white/50">
                    <tr>
                      {[
                        "Crop",
                        "Region",
                        "Plant (months)",
                        "Harvest (weeks)",
                        "Soil",
                        "Water",
                        "Pests",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-green/5">
                    {calendar.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-gray-500 text-sm"
                        >
                          No calendar entries yet
                        </td>
                      </tr>
                    ) : (
                      calendar.map((e: any) => (
                        <tr key={e.id} className="transition hover:bg-white/60">
                          <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                            {e.crop_type}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {e.region ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {e.recommended_planting_start &&
                            e.recommended_planting_end
                              ? `${e.recommended_planting_start}–${e.recommended_planting_end}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {e.expected_harvest_weeks ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {e.soil_requirements ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {e.water_requirements ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {e.common_pests ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {section === "reports" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              {!weeklyReport && !monthlyReport ? (
                <div className="py-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {monthlyReport && (
                    <Card className={panelCls}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Monthly Summary —{" "}
                        {new Date(
                          monthlyReport.period.year,
                          monthlyReport.period.month - 1
                        ).toLocaleDateString("en-GB", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                          {
                            label: "Man-Days",
                            value: monthlyReport.summary.totalManDays,
                          },
                          {
                            label: "Wages",
                            value: `$${parseFloat(
                              monthlyReport.summary.totalWages || "0"
                            ).toFixed(2)}`,
                          },
                          {
                            label: "Input Costs",
                            value: `$${parseFloat(
                              monthlyReport.summary.totalInputs || "0"
                            ).toFixed(2)}`,
                          },
                          {
                            label: "Total Cost",
                            value: `$${parseFloat(
                              monthlyReport.summary.totalCost || "0"
                            ).toFixed(2)}`,
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2 text-center"
                          >
                            <div className="text-xl font-bold text-gray-900">
                              {s.value}
                            </div>
                            <div className="text-xs text-gray-600">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {monthlyReport.labour.byTask.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                            Labour by Task
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-secondary-green/10">
                                  {[
                                    "Task",
                                    "Man-Days",
                                    "Hours",
                                    "Area (ha)",
                                    "Wages",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className={`py-2 ${h === "Task" ? "text-left" : "text-right"} text-gray-500 font-medium`}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-secondary-green/5">
                                {monthlyReport.labour.byTask.map((row: any) => (
                                  <tr
                                    key={row.task_category}
                                  >
                                    <td className="py-2 capitalize">
                                      {row.task_category.replace("_", " ")}
                                    </td>
                                    <td className="py-2 text-right font-medium">
                                      {row.man_days}
                                    </td>
                                    <td className="py-2 text-right">
                                      {parseFloat(row.total_hours || "0").toFixed(
                                        0
                                      )}
                                    </td>
                                    <td className="py-2 text-right">
                                      {parseFloat(
                                        row.area_covered || "0"
                                      ).toFixed(2)}
                                    </td>
                                    <td className="py-2 text-right text-red-600">
                                      ${parseFloat(
                                        row.total_wages || "0"
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {monthlyReport.inventory.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                            Inputs Consumed
                          </h4>
                          <div className="space-y-1">
                            {monthlyReport.inventory.map((row: any) => (
                              <div
                                key={row.name}
                                className="flex items-center justify-between text-sm py-1 border-b border-secondary-green/5"
                              >
                                <span>
                                  {row.name}{" "}
                                  <span className="text-gray-400 text-xs">
                                    ({row.item_type})
                                  </span>
                                </span>
                                <span className="font-medium">
                                  {parseFloat(row.total_used).toLocaleString()} {row.unit}
                                </span>
                                <span className="text-red-600">
                                  ${parseFloat(row.total_cost || "0").toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                  {weeklyReport && (
                    <Card className={panelCls}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Weekly Summary — {weeklyReport.period.startDate} to{" "}
                        {weeklyReport.period.endDate}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-secondary-green/10 bg-white/70 p-3 text-center">
                          <div className="text-xl font-bold text-blue-700">
                            {weeklyReport.labour?.total_entries ?? 0}
                          </div>
                          <div className="text-xs text-gray-600">
                            Labour Entries
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-3 text-center">
                          <div className="text-xl font-bold text-red-600">
                            ${
                              parseFloat(
                                weeklyReport.labour?.total_wages ?? "0"
                              ).toFixed(2)
                            }
                          </div>
                          <div className="text-xs text-gray-600">Wages Paid</div>
                        </div>
                        <div className="bg-gray-50 rounded p-3 text-center">
                          <div className="text-xl font-bold text-green-700">
                            {weeklyReport.cropActivities?.length ?? 0}
                          </div>
                          <div className="text-xs text-gray-600">
                            Crop Activities
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── AI INSIGHTS ── */}
          {section === "finance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
                <div className="flex gap-2">
                  <button onClick={() => openModal("revenue-entry")} className={btnOutlineCls}>+ Record Revenue</button>
                  <button onClick={() => openModal("expense")} className={btnPrimaryCls}>+ Record Expense</button>
                </div>
              </div>

              {/* Month selector */}
              <div className={`${panelCls} flex items-center gap-3 rounded-2xl px-4 py-3`}>
                <span className="text-sm font-medium text-gray-600">Period:</span>
                <select value={finPeriod.month} onChange={e => setFinPeriod(p => ({ ...p, month: Number(e.target.value) }))} className={inputCompactCls}>
                  { ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                    <option key={i} value={i+1}>{m}</option>
                  )) }
                </select>
                <select value={finPeriod.year} onChange={e => setFinPeriod(p => ({ ...p, year: Number(e.target.value) }))} className={inputCompactCls}>
                  {[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(y=>(<option key={y} value={y}>{y}</option>))}
                </select>
              </div>

              {/* P&L Summary */}
              {profitability && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${panelCls} rounded-2xl border-l-4 border-secondary-green p-4 text-center`}>
                    <div className="text-2xl font-bold text-secondary-green">${profitability.summary.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className={`${panelCls} rounded-2xl border-l-4 border-red-400 p-4 text-center`}>
                    <div className="text-2xl font-bold text-red-600">${profitability.summary.totalExpenses.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Expenses</div>
                  </div>
                  <div className={`${panelCls} rounded-2xl border-l-4 p-4 text-center ${profitability.summary.isProfit ? "border-blue-400" : "border-orange-400"}`}>
                    <div className={`text-2xl font-bold ${profitability.summary.isProfit ? "text-blue-700" : "text-orange-600"}`}>
                      {profitability.summary.isProfit ? "+" : ""}${profitability.summary.netProfit.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Net {profitability.summary.isProfit ? "Profit" : "Loss"}</div>
                  </div>
                  <div className={`${panelCls} rounded-2xl border-l-4 border-accent-gold p-4 text-center`}>
                    <div className="text-2xl font-bold text-amber-600">{profitability.summary.profitMargin}</div>
                    <div className="text-sm text-gray-600">Profit Margin</div>
                  </div>
                </div>
              )}

              {/* Profit by crop */}
              {profitability && profitability.byCrop.length > 0 && (
                <Card className={panelCls}>
                  <h3 className="font-bold text-gray-900 mb-4">Profit by Crop</h3>
                  <div className="space-y-2">
                    {profitability.byCrop.map((c: any) => {
                      const profit = parseFloat(c.profit || "0");
                      const revenue = parseFloat(c.revenue || "0");
                      const expenses = parseFloat(c.expenses || "0");
                      return (
                        <div key={c.crop_plan_id} className="flex items-center justify-between rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2">
                          <div>
                            <span className="font-medium text-gray-900">{c.crop_type}</span>
                            {c.variety && <span className="text-sm text-gray-500 ml-1">({c.variety})</span>}
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-green-600">Rev: ${revenue.toFixed(2)}</span>
                            <span className="text-red-500">Exp: ${expenses.toFixed(2)}</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full ${profit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* 6-month trend */}
              {profitability && profitability.trend.length > 0 && (
                <Card className={panelCls}>
                  <h3 className="font-bold text-gray-900 mb-4">6-Month Trend</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-secondary-green/10">
                          { ["Month","Revenue","Expenses","Net P&L"].map(h=>(<th key={h} className={`py-2 text-gray-500 font-medium ${h==="Month"?"text-left":"text-right"}`}>{h}</th>)) }
                        </tr>
                      </thead>
                      <tbody>
                        {profitability.trend.map((row: any) => {
                          const net = parseFloat(row.profit || "0");
                          return (
                            <tr key={row.month} className="border-b border-secondary-green/5">
                              <td className="py-2 font-medium">{row.month}</td>
                              <td className="py-2 text-right text-green-600">${parseFloat(row.revenue || "0").toFixed(2)}</td>
                              <td className="py-2 text-right text-red-500">${parseFloat(row.expenses || "0").toFixed(2)}</td>
                              <td className={`py-2 text-right font-bold ${net >= 0 ? "text-blue-700" : "text-orange-600"}`}>
                                {net >= 0 ? "+" : ""}${net.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Two columns: recent expenses + revenue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Expenses</h3>
                    <button onClick={() => openModal("expense")} className="text-sm font-semibold text-secondary-green hover:text-primary-green">+ Add</button>
                  </div>
                  {expenses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary-green/20 bg-white/60 py-6 text-center text-sm text-gray-500">
                      No expenses recorded this period
                    </div>
                  ) : expenses.slice(0, 8).map(exp => (
                    <div key={exp.id} className="flex items-center justify-between rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exp.description}</div>
                        <div className="text-xs text-gray-400">
                          {exp.category} · {new Date(exp.expense_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}
                          {exp.crop_type && ` · ${exp.crop_type}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">${parseFloat(exp.amount_usd).toFixed(2)}</span>
                        <button onClick={() => openModal("expense", exp)} className="text-xs font-semibold text-secondary-green">Edit</button>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card className={panelCls}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Revenue</h3>
                    <button onClick={() => openModal("revenue-entry")} className="text-sm font-semibold text-secondary-green hover:text-primary-green">+ Add</button>
                  </div>
                  {revenue.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary-green/20 bg-white/60 py-6 text-center text-sm text-gray-500">
                      No revenue recorded this period
                    </div>
                  ) : revenue.slice(0, 8).map(rev => (
                    <div key={rev.id} className="flex items-center justify-between rounded-lg border border-secondary-green/10 bg-white/70 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{rev.description}</div>
                        <div className="text-xs text-gray-400">
                          {rev.category} · {new Date(rev.revenue_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}
                          {rev.buyer_name && ` · ${rev.buyer_name}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">${parseFloat(rev.amount_usd).toFixed(2)}</span>
                        <button onClick={() => openModal("revenue-entry", rev)} className="text-xs font-semibold text-secondary-green">Edit</button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {section === "market" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Market Intelligence</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Current prices and AI-powered market recommendations</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal("market-price")} className={btnOutlineCls}>+ Add Price</button>
                  <button
                    onClick={async () => {
                      try {
                        setGenMarket(true);
                        const r = await api.post("/farm-os/market/insights");
                        if (r.data.success) {
                          setMarketInsights(r.data.data.insights);
                          const mpR = await api.get("/farm-os/market");
                          if (mpR.data.success) setMarketPrices(mpR.data.data.prices);
                          flash("success", "Market insights generated");
                        }
                      } catch (err: any) {
                        flash("error", err.response?.data?.message ?? "Failed");
                      } finally { setGenMarket(false); }
                    }}
                    disabled={genMarket}
                    className={`${btnPrimaryCls} disabled:opacity-50`}
                  >
                    {genMarket ? "Analysing..." : "📡 Get Market Insights"}
                  </button>
                </div>

            {false && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Operational trends, forecasts, and export tools
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleExportCSV("expenses")}
                      className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium"
                    >
                      Export Expenses CSV
                    </button>
                    <button
                      onClick={() => handleExportCSV("revenue")}
                      className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium"
                    >
                      Export Revenue CSV
                    </button>
                    <button
                      onClick={handleExportReport}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      Export Report
                    </button>
                  </div>
                </div>

                <Card>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Export / forecast year
                      </label>
                      <input
                        type="number"
                        className={inputCls}
                        value={exportYear}
                        onChange={(e) =>
                          setExportYear(
                            Number(e.target.value) || new Date().getFullYear(),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        className={inputCls}
                        value={exportMonth}
                        onChange={(e) =>
                          setExportMonth(Number(e.target.value) || 1)
                        }
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1, 1).toLocaleString(
                                "en-US",
                                { month: "long" },
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex gap-2 flex-wrap">
                      <button
                        onClick={async () => {
                          try {
                            setGenPredictions(true);
                            const r = await api.post("/farm-os/analytics/predict", {
                              year: exportYear,
                              month: exportMonth,
                            });
                            if (r.data.success) setPredictions(r.data.data);
                          } catch (err: any) {
                            flash(
                              "error",
                              err.response?.data?.message ??
                                "Prediction failed",
                            );
                          } finally {
                            setGenPredictions(false);
                          }
                        }}
                        disabled={genPredictions}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {genPredictions ? "Generating..." : "Generate Predictions"}
                      </button>
                      <button
                        onClick={() => handleExportCSV("analytics")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
                      >
                        Export Analytics CSV
                      </button>
                    </div>
                  </div>
                </Card>

                {analyticsLoading ? (
                  <div className="py-16 flex justify-center">
                    <LoadingSpinner />
                  </div>
                ) : analytics ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Revenue",
                          value:
                            analytics.summary?.revenue ??
                            analytics.summary?.totalRevenue ??
                            0,
                          tone: "text-green-700 bg-green-50",
                        },
                        {
                          label: "Expenses",
                          value:
                            analytics.summary?.expenses ??
                            analytics.summary?.totalExpenses ??
                            0,
                          tone: "text-red-700 bg-red-50",
                        },
                        {
                          label: "Profit",
                          value:
                            analytics.summary?.profit ??
                            analytics.summary?.netProfit ??
                            0,
                          tone: "text-blue-700 bg-blue-50",
                        },
                        {
                          label: "Margin",
                          value:
                            analytics.summary?.margin ??
                            analytics.summary?.profitMargin ??
                            "—",
                          tone: "text-purple-700 bg-purple-50",
                        },
                      ].map((item) => (
                        <Card key={item.label} className={item.tone}>
                          <div className="text-center">
                            <div className="text-xl font-bold">
                              {typeof item.value === "number"
                                ? `$${item.value.toFixed(2)}`
                                : item.value}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.label}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <Card>
                        <h3 className="font-bold text-gray-900 mb-4">
                          Financial Trend
                        </h3>
                        {analyticsTrendData.length === 0 ? (
                          <p className="text-sm text-gray-500 py-8 text-center">
                            No trend data available.
                          </p>
                        ) : (
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={analyticsTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke="#16a34a"
                                  strokeWidth={3}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="expenses"
                                  stroke="#ef4444"
                                  strokeWidth={3}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="net"
                                  stroke="#2563eb"
                                  strokeWidth={3}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </Card>

                      <Card>
                        <h3 className="font-bold text-gray-900 mb-4">
                          Profit by Crop
                        </h3>
                        {analyticsCropData.length === 0 ? (
                          <p className="text-sm text-gray-500 py-8 text-center">
                            No crop analytics available.
                          </p>
                        ) : (
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsCropData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#16a34a"
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </Card>

                      <Card>
                        <h3 className="font-bold text-gray-900 mb-4">
                          Category Mix
                        </h3>
                        {analyticsCategoryData.length === 0 ? (
                          <p className="text-sm text-gray-500 py-8 text-center">
                            No category analytics available.
                          </p>
                        ) : (
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsCategoryData}
                                  dataKey="value"
                                  nameKey="label"
                                  innerRadius={45}
                                  outerRadius={90}
                                  paddingAngle={2}
                                >
                                  {analyticsCategoryData.map(
                                    (entry: any, index: number) => (
                                      <Cell
                                        key={`cell-${entry.label}-${index}`}
                                        fill={
                                          chartColors[index % chartColors.length]
                                        }
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </Card>

                      <Card>
                        <h3 className="font-bold text-gray-900 mb-4">Forecast</h3>
                        {predictionData.length === 0 ? (
                          <p className="text-sm text-gray-500 py-8 text-center">
                            Generate predictions to see the forecast here.
                          </p>
                        ) : (
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={predictionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </Card>
                    </div>

                    {predictions && (
                      <Card>
                        <h3 className="font-bold text-gray-900 mb-4">
                          Predictions
                        </h3>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(predictions, null, 2)}
                        </pre>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <p className="text-sm text-gray-500 py-6 text-center">
                      Select Analytics to load data.
                    </p>
                  </Card>
                )}
              </div>
            )}
              </div>

              {/* AI market insights */}
              {marketInsights && (
                <Card className={`${panelCls} mb-6 border-l-4 border-secondary-green/60`}>
                  <h3 className="font-bold text-gray-900 mb-2">Market Overview</h3>
                  <p className="text-sm text-gray-700 mb-4">{marketInsights.marketSummary}</p>
                  {marketInsights.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900">Recommendations</h4>
                      {marketInsights.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="flex items-start justify-between rounded-lg border border-secondary-green/10 bg-white/70 p-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{rec.crop}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                rec.action === "sell_now" ? "bg-green-100 text-green-800" :
                                rec.action === "hold"     ? "bg-yellow-100 text-yellow-800" :
                                rec.action === "plant_more" ? "bg-blue-100 text-blue-800" :
                                "bg-red-100 text-red-700"
                              }`}>{rec.action?.replace("_"," ").toUpperCase()}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                rec.urgency === "high" ? "bg-red-100 text-red-700" :
                                rec.urgency === "medium" ? "bg-orange-100 text-orange-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>{rec.urgency}</span>
                            </div>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                          </div>
                          {rec.estimatedPrice && <span className="text-sm font-bold text-secondary-green shrink-0 ml-3">{rec.estimatedPrice}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Commodity prices table */}
              <Card className={panelCls}>
                <h3 className="font-bold text-gray-900 mb-4">Current Market Prices</h3>
                {marketPrices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-secondary-green/20 bg-white/60 py-12 text-center">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="text-gray-500 text-sm">No market prices yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add prices manually or generate AI market insights</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-secondary-green/10">
                        <tr>{["Commodity","Price","Unit","Demand","Region","Date","Source"].map(h => (
                          <th key={h} className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {marketPrices.map(price => (
                          <tr key={price.id} className="hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{price.commodity}{price.is_ai_generated && <span className="ml-1 text-xs text-purple-500">AI</span>}</td>
                            <td className="py-3 font-bold text-green-700">${parseFloat(price.price_usd).toFixed(2)}</td>
                            <td className="py-3 text-gray-600">per {price.unit}</td>
                            <td className="py-3">
                              {price.demand_level && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  price.demand_level === "very_high" ? "bg-red-100 text-red-700" :
                                  price.demand_level === "high"      ? "bg-orange-100 text-orange-700" :
                                  price.demand_level === "medium"    ? "bg-yellow-100 text-yellow-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>{price.demand_level.replace("_"," ")}</span>
                              )}
                            </td>
                            <td className="py-3 text-gray-600">{price.region ?? "—"}</td>
                            <td className="py-3 text-gray-500">{new Date(price.price_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}</td>
                            <td className="py-3 text-gray-400 text-xs">{price.source ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
          {section === "insights" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    AI Farm Insights
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Powered by Claude AI — analysed from your farm data
                  </p>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={genInsights}
                  className={`${btnPrimaryCls} transition-colors disabled:opacity-50`}
                >
                  {genInsights ? "Analysing..." : "🤖 Generate Insights"}
                </button>
              </div>
              {genInsights && (
                <Card className={`${panelCls} mb-4`}>
                  <div className="flex items-center gap-3 py-4">
                    <LoadingSpinner />
                    <div>
                      <p className="font-medium text-gray-900">
                        Analysing your farm data...
                      </p>
                      <p className="text-sm text-gray-500">
                        This takes about 15 seconds
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {insights.length === 0 && !genInsights ? (
                <Card className={panelCls}>
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-3">🤖</div>
                    <p className="font-medium text-gray-700">No insights yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add farm data then click Generate Insights
                    </p>
                    <button
                      onClick={handleGenerateInsights}
                      className={`${btnPrimaryCls} mt-4`}
                    >
                      Generate First Insights
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`${panelCls} rounded-xl border-l-4 p-5 ${
                        INSIGHT_BORDER[insight.insight_type] ??
                        INSIGHT_BORDER.general
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">
                          {insight.title}
                        </h3>
                        <span className="text-xs text-gray-400 shrink-0 ml-3">
                          {new Date(insight.generated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.content}
                      </p>
                      <span className="mt-2 inline-block text-xs font-medium capitalize text-gray-400">
                        {insight.insight_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL ──────────────────────────────────────────────────────────── */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`${panelCls} rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className="px-6 py-4 border-b border-secondary-green/10 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {(
                  {
                    farm: "Farm Profile",
                    field: modal.editing ? "Edit Field" : "Add Field",
                    worker: modal.editing ? "Edit Worker" : "Add Worker",
                    crop: modal.editing ? "Edit Crop Plan" : "New Crop Plan",
                    "crop-activity": "Log Crop Activity",
                    livestock: modal.editing ? "Edit Livestock" : "Add Livestock",
                    "livestock-activity": "Log Livestock Activity",
                    labour: "Log Labour Day",
                    inventory: modal.editing ? "Edit Item" : "Add Inventory Item",
                    calendar: "Add Calendar Entry",
                  } as Record<string, string>
                )[modal.type!] ?? modal.type}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {modal.type === "farm" && (
                <>
                  <Field label="Farm Name" required>
                    <input
                      type="text"
                      value={form.name ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Location">
                    <input
                      type="text"
                      value={form.location ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      placeholder="e.g. Mazowe"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Total Area (ha)">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.total_area_ha ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          total_area_ha: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Water Sources">
                    <input
                      type="text"
                      value={form.water_sources ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          water_sources: e.target.value,
                        }))
                      }
                      placeholder="e.g. Borehole, Dam"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Notes">
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </>
              )}

              {modal.type === "field" && (
                <>
                  <Field label="Field Name" required>
                    <input
                      type="text"
                      value={form.name ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      placeholder="e.g. Block A"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Area (ha)">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.area_ha ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            area_ha: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Current Use">
                      <select
                        value={form.current_use ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            current_use: e.target.value,
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {[
                          "crop",
                          "livestock",
                          "fallow",
                          "infrastructure",
                          "other",
                        ].map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Soil Type">
                      <input
                        type="text"
                        value={form.soil_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            soil_type: e.target.value,
                          }))
                        }
                        placeholder="e.g. Sandy loam"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Irrigation">
                      <input
                        type="text"
                        value={form.irrigation_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            irrigation_type: e.target.value,
                          }))
                        }
                        placeholder="e.g. Drip"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </>
              )}

              {modal.type === "worker" && (
                <>
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      value={form.full_name ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, full_name: e.target.value }))
                      }
                      required
                      placeholder="e.g. John Moyo"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone">
                      <input
                        type="tel"
                        value={form.phone ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        placeholder="+263..."
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Role">
                      <select
                        value={form.role ?? "worker"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, role: e.target.value }))
                        }
                        className={inputCls}
                      >
                        {["worker", "manager", "owner"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Daily Wage (USD)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.daily_wage_usd ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          daily_wage_usd: e.target.value,
                        }))
                      }
                      placeholder="e.g. 5.00"
                      className={inputCls}
                    />
                  </Field>
                  {modal.editing && (
                    <Field label="Active">
                      <select
                        value={
                          form.is_active !== undefined
                            ? String(form.is_active)
                            : "true"
                        }
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            is_active: e.target.value === "true",
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </Field>
                  )}
                </>
              )}

              {modal.type === "crop" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Crop Type" required>
                      <input
                        type="text"
                        value={form.crop_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            crop_type: e.target.value,
                          }))
                        }
                        required
                        placeholder="e.g. Tomatoes"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Variety">
                      <input
                        type="text"
                        value={form.variety ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            variety: e.target.value,
                          }))
                        }
                        placeholder="e.g. Heinz 1370"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Field">
                      <select
                        value={form.field_id ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            field_id: e.target.value,
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="">No field</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Area (ha)">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.planned_area_ha ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            planned_area_ha: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Planting Date">
                      <input
                        type="date"
                        value={form.planting_date ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            planting_date: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Expected Harvest">
                      <input
                        type="date"
                        value={form.expected_harvest_date ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expected_harvest_date: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expected Yield (kg)">
                      <input
                        type="number"
                        min="0"
                        value={form.expected_yield_kg ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expected_yield_kg: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Season">
                      <input
                        type="text"
                        value={form.season ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, season: e.target.value }))
                        }
                        placeholder="e.g. 2025/26"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  {modal.editing && (
                    <Field label="Status">
                      <select
                        value={form.status ?? "planned"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                        className={inputCls}
                      >
                        {[
                          "planned",
                          "active",
                          "harvested",
                          "failed",
                          "cancelled",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field label="Notes">
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </>
              )}

              {modal.type === "crop-activity" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Activity Type" required>
                      <select
                        value={form.activity_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            activity_type: e.target.value,
                          }))
                        }
                        required
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {[
                          "planting",
                          "fertilising",
                          "spraying",
                          "irrigation",
                          "weeding",
                          "pruning",
                          "harvesting",
                          "inspection",
                          "other",
                        ].map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Date">
                      <input
                        type="date"
                        value={
                          form.activity_date ??
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            activity_date: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Crop Plan">
                      <select
                        value={form.crop_plan_id ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            crop_plan_id: e.target.value,
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="">None</option>
                        {cropPlans.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.crop_type}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Field">
                      <select
                        value={form.field_id ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            field_id: e.target.value,
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="">None</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Area Covered (ha)">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.area_covered_ha ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          area_covered_ha: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={form.description ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="What was done..."
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                  <Field label="Logged By">
                    <select
                      value={form.logged_by ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          logged_by: e.target.value,
                        }))
                      }
                      className={inputCls}
                    >
                      <option value="">Owner / Self</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.full_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              {modal.type === "livestock" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {modal.editing ? (
                      <Field label="Species">
                        <input
                          type="text"
                          value={form.species ?? ""}
                          disabled
                          className={inputCls + " bg-gray-100"}
                        />
                      </Field>
                    ) : (
                      <Field label="Species" required>
                        <select
                          value={form.species ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              species: e.target.value,
                            }))
                          }
                          required
                          className={inputCls}
                        >
                          <option value="">Select...</option>
                          {[
                            "cattle",
                            "goat",
                            "sheep",
                            "poultry",
                            "pig",
                            "fish",
                            "bees",
                            "other",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {SPECIES_EMOJI[s]} {s}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Breed">
                      <input
                        type="text"
                        value={form.breed ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, breed: e.target.value }))
                        }
                        placeholder="e.g. Brahman"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Count" required>
                      <input
                        type="number"
                        min="0"
                        value={form.count ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, count: e.target.value }))
                        }
                        required
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Purpose">
                      <select
                        value={form.purpose ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, purpose: e.target.value }))
                        }
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {[
                          "beef",
                          "dairy",
                          "eggs",
                          "wool",
                          "breeding",
                          "honey",
                          "other",
                        ].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Field / Zone">
                    <select
                      value={form.field_id ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, field_id: e.target.value }))
                      }
                      className={inputCls}
                    >
                      <option value="">None</option>
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Notes">
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </>
              )}

              {modal.type === "livestock-activity" && (
                <>
                  <Field label="Livestock Group" required>
                    <select
                      value={form.livestock_group_id ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          livestock_group_id: e.target.value,
                        }))
                      }
                      required
                      className={inputCls}
                    >
                      <option value="">Select group...</option>
                      {livestock.map((g) => (
                        <option key={g.id} value={g.id}>
                          {SPECIES_EMOJI[g.species]} {g.species} ({g.count} head)
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Activity Type" required>
                      <select
                        value={form.activity_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            activity_type: e.target.value,
                          }))
                        }
                        required
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {[
                          "birth",
                          "death",
                          "vaccination",
                          "feeding",
                          "treatment",
                          "breeding",
                          "sale",
                          "purchase",
                          "weighing",
                          "milking",
                          "other",
                        ].map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Date">
                      <input
                        type="date"
                        value={
                          form.activity_date ??
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            activity_date: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Count Affected">
                      <input
                        type="number"
                        min="0"
                        value={form.count_affected ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            count_affected: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Cost (USD)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.cost_usd ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, cost_usd: e.target.value }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      value={form.description ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                  <Field label="Logged By">
                    <select
                      value={form.logged_by ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, logged_by: e.target.value }))
                      }
                      className={inputCls}
                    >
                      <option value="">Owner / Self</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.full_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              {modal.type === "labour" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Worker">
                      <select
                        value={form.worker_id ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, worker_id: e.target.value }))
                        }
                        className={inputCls}
                      >
                        <option value="">Owner / Self</option>
                        {workers
                          .filter((w) => w.is_active)
                          .map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.full_name}
                              {w.daily_wage_usd
                                ? ` ($${w.daily_wage_usd}/day)`
                                : ""}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Date">
                      <input
                        type="date"
                        value={
                          form.work_date ??
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setForm((f) => ({ ...f, work_date: e.target.value }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Task Category" required>
                      <select
                        value={form.task_category ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            task_category: e.target.value,
                          }))
                        }
                        required
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {[
                          "land_prep",
                          "planting",
                          "weeding",
                          "spraying",
                          "harvesting",
                          "irrigation",
                          "maintenance",
                          "construction",
                          "livestock_care",
                          "other",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Field">
                      <select
                        value={form.field_id ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, field_id: e.target.value }))
                        }
                        className={inputCls}
                      >
                        <option value="">None</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Hours">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={form.hours_worked ?? "8"}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            hours_worked: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Area (ha)">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.area_covered_ha ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            area_covered_ha: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Wage ($)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.wage_usd ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, wage_usd: e.target.value }))
                        }
                        placeholder="Auto"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </Field>
                </>
              )}

              {modal.type === "inventory" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {!modal.editing && (
                      <Field label="Item Type" required>
                        <select
                          value={form.item_type ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              item_type: e.target.value,
                            }))
                          }
                          required
                          className={inputCls}
                        >
                          <option value="">Select...</option>
                          {[
                            "seed",
                            "fertiliser",
                            "chemical",
                            "feed",
                            "fuel",
                            "equipment",
                            "other",
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field label="Item Name" required>
                      <input
                        type="text"
                        value={form.name ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        required
                        placeholder="e.g. Compound D"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Quantity">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.quantity ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            quantity: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Unit">
                      <input
                        type="text"
                        value={form.unit ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, unit: e.target.value }))
                        }
                        placeholder="kg, litres"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Unit Cost ($)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.unit_cost_usd ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            unit_cost_usd: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Reorder Level">
                      <input
                        type="number"
                        min="0"
                        value={form.reorder_level ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            reorder_level: e.target.value,
                          }))
                        }
                        placeholder="Alert below this"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Expiry Date">
                      <input
                        type="date"
                        value={form.expiry_date ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expiry_date: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Supplier">
                    <input
                      type="text"
                      value={form.supplier ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, supplier: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </Field>
                </>
              )}

              {modal.type === "calendar" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Crop Type" required>
                      <input
                        type="text"
                        value={form.crop_type ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            crop_type: e.target.value,
                          }))
                        }
                        required
                        placeholder="e.g. Tomatoes"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Region">
                      <input
                        type="text"
                        value={form.region ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, region: e.target.value }))
                        }
                        placeholder="e.g. Mashonaland"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Plant Start (mo)">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={form.recommended_planting_start ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            recommended_planting_start: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Plant End (mo)">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={form.recommended_planting_end ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            recommended_planting_end: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Harvest (wks)">
                      <input
                        type="number"
                        min="1"
                        value={form.expected_harvest_weeks ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expected_harvest_weeks: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Soil Requirements">
                    <input
                      type="text"
                      value={form.soil_requirements ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          soil_requirements: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Water Requirements">
                    <input
                      type="text"
                      value={form.water_requirements ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          water_requirements: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Common Pests">
                    <input
                      type="text"
                      value={form.common_pests ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          common_pests: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={btnOutlineCls}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimaryCls}
                >
                  {modal.editing ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}