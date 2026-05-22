import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";
import FarmOSAnalytics from "./FarmOSAnalytics";

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

interface SubscriptionPlan {
  id: string;
  name: string;
  price_usd: string;
  billing_cycle: string;
}

interface CalendarEntry {
  id: string;
  crop_type: string;
  region: string | null;
  recommended_planting_start: string | number | null;
  recommended_planting_end: string | number | null;
  expected_harvest_weeks: string | number | null;
  soil_requirements: string | null;
  water_requirements: string | null;
  common_pests: string | null;
}

interface PlantingWindow {
  id: string;
  crop_type: string;
  region: string | null;
  expected_harvest_weeks: string | number | null;
  starts_in_months?: number;
}

interface WeeklyReport {
  period: {
    startDate: string;
    endDate: string;
  };
  labour?: {
    total_entries?: number;
    total_wages?: string | number | null;
  };
  cropActivities?: unknown[];
}

interface MonthlyLabourTaskRow {
  task_category: string;
  man_days: number;
  total_hours: string | number | null;
  area_covered: string | number | null;
  total_wages: string | number | null;
}

interface MonthlyInventoryRow {
  name: string;
  item_type: string;
  total_used: string | number;
  unit: string | null;
  total_cost: string | number | null;
}

interface MonthlyReport {
  period: {
    year: number;
    month: number;
  };
  summary: {
    totalManDays: number;
    totalWages?: string | number | null;
    totalInputs?: string | number | null;
    totalCost?: string | number | null;
  };
  labour: {
    byTask: MonthlyLabourTaskRow[];
  };
  inventory: MonthlyInventoryRow[];
}

interface ProfitabilityCropRow {
  crop_plan_id: string;
  crop_type: string;
  variety: string | null;
  profit: string | number | null;
  revenue: string | number | null;
  expenses: string | number | null;
}

interface ProfitabilityTrendRow {
  month: string;
  revenue: string | number | null;
  expenses: string | number | null;
  profit: string | number | null;
}

interface MarketRecommendation {
  crop: string;
  action: string;
  urgency: string;
  reason: string;
  estimatedPrice?: string | number | null;
}

interface MarketInsights {
  marketSummary: string;
  recommendations?: MarketRecommendation[];
}

interface Profitability {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: string;
    isProfit: boolean;
  };
  expenses: unknown;
  revenue: unknown;
  byCrop: ProfitabilityCropRow[];
  expenseCategories: unknown[];
  trend: ProfitabilityTrendRow[];
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

interface TrackerEntry {
  id: string;
  crop_category: string;
  quantity: string | null;
  unit: string | null;
  harvest_date: string | null;
  notes: string | null;
  status: string;
  created_by_name: string | null;
  days_until_harvest: number | null;
}

type FormValue = string | number | null | undefined;
type FormState = Record<string, FormValue>;

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV = [
  { key: "overview", label: "Dashboard", icon: "fas fa-chart-pie" },
  { key: "fields", label: "Fields", icon: "fas fa-map-marked-alt" },
  { key: "crops", label: "Crops", icon: "fas fa-seedling" },
  { key: "livestock", label: "Livestock", icon: "fas fa-paw" },
  { key: "inventory", label: "Inventory", icon: "fas fa-boxes" },
  { key: "finance", label: "Finance", icon: "fas fa-coins" },
  { key: "labour", label: "Workers", icon: "fas fa-users" },
  { key: "calendar", label: "Calendar", icon: "fas fa-calendar" },
  { key: "reports", label: "Reports", icon: "fas fa-file-alt" },
  { key: "insights", label: "Insights", icon: "fas fa-brain" },
  { key: "market", label: "Market", icon: "fas fa-broadcast-tower" },
  { key: "analytics", label: "Analytics", icon: "fas fa-chart-line" },
] as const;

type Section = (typeof NAV)[number]["key"];

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

const pageBgCls =
  "min-h-screen bg-gradient-to-br from-[#fdfaf4] via-white to-[#e8f3e9] text-gray-900";
const panelCls =
  "bg-white/80 backdrop-blur border border-secondary-green/10 shadow-card";
const btnPrimaryCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-secondary-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-green";
const btnOutlineCls =
  "inline-flex items-center justify-center gap-2 rounded-full border border-secondary-green/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-secondary-green transition hover:border-secondary-green hover:bg-white";
const inputCls =
  "w-full rounded-xl border border-secondary-green/20 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-secondary-green/50";

const [trackerEntries, setTrackerEntries] = useState<TrackerEntry[]>([]);
const [trackerUpcoming, setTrackerUpcoming] = useState<TrackerEntry[]>([]);
const [trackerOverdue, setTrackerOverdue] = useState<TrackerEntry[]>([]);

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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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
  const [labourSummary, setLabourSummary] = useState<LabourSummary | null>(
    null,
  );
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [plantingNow, setPlantingNow] = useState<PlantingWindow[]>([]);
  const [calendarUpcoming, setCalendarUpcoming] = useState<any[]>([]);
  const [cropPlanAlerts, setCropPlanAlerts] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null,
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [, setExpenseSummary] = useState<Record<string, unknown> | null>(null);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [, setRevenueSummary] = useState<Record<string, unknown> | null>(null);
  const [profitability, setProfitability] = useState<Profitability | null>(
    null,
  );
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [genMarket, setGenMarket] = useState(false);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(
    null,
  );
  const [finPeriod, setFinPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // UI
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [genInsights, setGenInsights] = useState(false);

  // Modal
  const [modal, setModal] = useState<{
    type: string | null;
    editing?: Record<string, unknown> | null;
  }>({ type: null });
  const [form, setForm] = useState<FormState>({});

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
        api.get("/farm-os/tracker"),
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
        trackerR,
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
      if (
        marketR &&
        marketR.status === "fulfilled" &&
        marketR.value.data.success
      )
        setMarketPrices(marketR.value.data.data.prices);
      if (calR.status === "fulfilled" && calR.value.data.success) {
        setCalendar(calR.value.data.data.calendar);
        setPlantingNow(calR.value.data.data.plantingNow);
        setCalendarUpcoming(calR.value.data.data.upcoming ?? []);
        setCropPlanAlerts(calR.value.data.data.cropPlanAlerts ?? []);
      }
      if (trackerR.status === "fulfilled" && trackerR.value.data.success) {
        setTrackerEntries(trackerR.value.data.data.entries);
        setTrackerUpcoming(trackerR.value.data.data.upcoming);
        setTrackerOverdue(trackerR.value.data.data.overdue);
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
        const start = `${finPeriod.year}-${String(finPeriod.month).padStart(2, "0")}-01`;
        const end = new Date(finPeriod.year, finPeriod.month, 0)
          .toISOString()
          .split("T")[0];
        const [expR, revR, profR] = await Promise.allSettled([
          api.get("/farm-os/expenses", {
            params: { startDate: start, endDate: end },
          }),
          api.get("/farm-os/revenue", {
            params: { startDate: start, endDate: end },
          }),
          api.get("/farm-os/profitability", {
            params: { year: finPeriod.year, month: finPeriod.month },
          }),
        ]);
        if (expR.status === "fulfilled" && expR.value.data.success) {
          setExpenses(expR.value.data.data.expenses);
          setExpenseSummary(expR.value.data.data.summary);
        }
        if (revR.status === "fulfilled" && revR.value.data.success) {
          setRevenue(revR.value.data.data.revenue);
          setRevenueSummary(revR.value.data.data.summary);
        }
        if (profR.status === "fulfilled" && profR.value.data.success)
          setProfitability(profR.value.data.data);
      } catch {
        /* non-critical */
      }
    };
    loadFinance();
  }, [section, hasAccess, finPeriod]);

  // useEffect(() => {
  //   if (section !== "analytics" || !hasAccess) return;
  //   const load = async () => {
  //     try {
  //       setAnalyticsLoading(true);
  //       const r = await api.get("/farm-os/analytics");
  //       if (r.data.success) setAnalytics(r.data.data);
  //     } catch { /* non-critical */ }
  //     finally { setAnalyticsLoading(false); }
  //   };
  //   load();
  // }, [section, hasAccess]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === "object") {
      const message = (error as ApiError).response?.data?.message;
      if (typeof message === "string" && message.trim()) return message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const normalizeFormData = (data: Record<string, unknown>): FormState =>
    Object.entries(data).reduce<FormState>((acc, [key, value]) => {
      if (typeof value === "string" || typeof value === "number") {
        acc[key] = value;
        return acc;
      }
      if (typeof value === "boolean") {
        acc[key] = value ? "true" : "false";
        return acc;
      }
      if (value === null || value === undefined) {
        acc[key] = value;
        return acc;
      }
      acc[key] = String(value);
      return acc;
    }, {});

  const toNumber = (value: string | number | null | undefined) =>
    typeof value === "number" ? value : parseFloat(String(value ?? 0));

  const openModal = (type: string, editing?: unknown) => {
    const editingRecord =
      editing && typeof editing === "object"
        ? (editing as Record<string, unknown>)
        : undefined;
    setModal({ type, editing: editingRecord ?? null });
    setForm(editingRecord ? normalizeFormData(editingRecord) : {});
  };

  const closeModal = () => {
    setModal({ type: null });
    setForm({});
  };

  const navigate = (s: Section) => {
    setSection(s);
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
    } catch (err: unknown) {
      setSubMsg(getApiErrorMessage(err, "Payment failed"));
    } finally {
      setSubscribing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { type, editing } = modal;
    const editingId = typeof editing?.id === "string" ? editing.id : undefined;
    try {
      switch (type) {
        case "farm":
          await api.post("/farm-os/farm", form);
          flash("success", "Farm profile saved");
          loadAll();
          break;
        case "field":
          if (editingId) {
            await api.put(`/farm-os/fields/${editingId}`, form);
          } else {
            await api.post("/farm-os/fields", form);
          }
          flash("success", editingId ? "Field updated" : "Field created");
          {
            const fr = await api.get("/farm-os/fields");
            if (fr.data.success) setFields(fr.data.data.fields);
          }
          break;
        case "worker":
          {
            const workerPayload = {
              ...form,
              is_active:
                form.is_active === undefined
                  ? true
                  : String(form.is_active) === "true",
            };
            if (editingId) {
              await api.put(`/farm-os/workers/${editingId}`, workerPayload);
            } else {
              await api.post("/farm-os/workers", workerPayload);
            }
            flash("success", editingId ? "Worker updated" : "Worker added");
          }
          {
            const wr = await api.get("/farm-os/workers");
            if (wr.data.success) setWorkers(wr.data.data.workers);
          }
          break;
        case "crop":
          if (editingId) {
            await api.put(`/farm-os/crop-plans/${editingId}`, form);
          } else {
            await api.post("/farm-os/crop-plans", form);
          }
          flash(
            "success",
            editingId ? "Crop plan updated" : "Crop plan created",
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
          if (editingId) {
            await api.put(`/farm-os/livestock/${editingId}`, form);
          } else {
            await api.post("/farm-os/livestock", form);
          }
          flash("success", editingId ? "Updated" : "Livestock group created");
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
          if (editingId) {
            await api.put(`/farm-os/inventory/${editingId}`, form);
          } else {
            await api.post("/farm-os/inventory", form);
          }
          flash("success", editingId ? "Item updated" : "Item added");
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
          if (editingId) {
            await api.put(`/farm-os/expenses/${editingId}`, form);
          } else {
            await api.post("/farm-os/expenses", form);
          }
          flash("success", editingId ? "Expense updated" : "Expense recorded");
          // reload finance
          setFinPeriod((p) => ({ ...p })); // trigger re-fetch
          break;
        case "revenue-entry":
          if (editingId) {
            await api.put(`/farm-os/revenue/${editingId}`, form);
          } else {
            await api.post("/farm-os/revenue", form);
          }
          flash("success", editingId ? "Revenue updated" : "Revenue recorded");
          setFinPeriod((p) => ({ ...p }));
          break;
        case "market-price": {
          await api.post("/farm-os/market", form);
          flash("success", "Market price added");
          const mpR = await api.get("/farm-os/market");
          if (mpR.data.success) setMarketPrices(mpR.data.data.prices);
          break;
        }
      }
      closeModal();
    } catch (err: unknown) {
      flash("error", getApiErrorMessage(err, "Failed to save"));
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
    } catch (err: unknown) {
      flash("error", getApiErrorMessage(err, "Failed to generate insights"));
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
              {plans.map((plan: SubscriptionPlan) => (
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
            <Link to="/dashboard" className={`${btnOutlineCls} mx-auto`}>
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
                } catch (err: unknown) {
                  flash("error", getApiErrorMessage(err, "Failed"));
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
              <button type="submit" className={`w-full ${btnPrimaryCls}`}>
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

  return (
    <div className="farm-os-body">
      <div className="farm-bg-animation"></div>

      <div className="max-w-[1600px] mx-auto p-5 relative z-10">
        {/* Header with Farmer Profile */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-4 md:px-7 md:py-4 mb-6 flex justify-between items-center flex-wrap gap-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-white/50">
          <div className="flex items-center gap-4">
            <div
              className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-sm animate-[pulse_2s_infinite]"
              style={{
                background:
                  "linear-gradient(135deg, var(--farm-primary), var(--farm-primary-light))",
              }}
            >
              <img src="logo.png" alt="" />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--farm-primary), var(--farm-secondary))",
                }}
              >
                AGRIVUS FARM OS
              </h1>
              <p
                className="text-[12px] font-medium"
                style={{ color: "var(--farm-gray)" }}
              >
                {farm?.name ?? "Intelligent Farm Operating System"} •{" "}
                {farm?.location ?? "Premium Edition"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-5 px-3 py-2 rounded-[60px] text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
            style={{
              background:
                "linear-gradient(135deg, var(--farm-primary-dark), var(--farm-primary))",
            }}
            onClick={() => openModal("farm", farm)}
          >
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-xl font-bold border-[3px] border-white/50"
              style={{
                background:
                  "linear-gradient(135deg, var(--farm-secondary), var(--farm-accent))",
              }}
            >
              {farm?.name ? farm.name.charAt(0).toUpperCase() : "TS"}
            </div>
            <div className="pr-2">
              <h3 className="text-[15px] font-semibold leading-tight">
                {farm?.name ?? "Farmer"}
              </h3>
              <p className="text-[11px] opacity-80 leading-tight">
                Master Farmer
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1"
              style={{ background: "var(--farm-secondary)" }}
            >
              <i className="fas fa-crown"></i> Premium
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-6 px-5 py-3 rounded-2xl border text-sm font-medium shadow-sm flex items-center gap-3 ${
              feedback.type === "success"
                ? "bg-[#e8f5e9] border-[#c8e6c9] text-[#1b4332]"
                : "bg-[#ffebee] border-[#ffcdd2] text-[#c62828]"
            }`}
          >
            <i
              className={`fas ${feedback.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`}
            ></i>
            {feedback.msg}
          </div>
        )}

        {/* Navigation */}
        <div className="farm-nav-container bg-white/95 backdrop-blur-xl rounded-[40px] p-2 mb-6 flex gap-2 overflow-x-auto shadow-sm border border-white/50">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-[40px] border-none font-semibold text-[14px] whitespace-nowrap transition-all duration-300 ${
                section === item.key
                  ? "text-white shadow-md"
                  : "bg-transparent text-[#52796f] hover:bg-[#f8f9fa] hover:text-[#2d6a4f]"
              }`}
              style={
                section === item.key
                  ? {
                      background:
                        "linear-gradient(135deg, var(--farm-primary), var(--farm-primary-light))",
                    }
                  : {}
              }
            >
              <i className={item.icon}></i>
              {item.label}
              {item.key === "inventory" && alerts.length > 0 && (
                <span className="ml-1 bg-[#e63946] text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area (Tabs will go inside here in the next steps) */}
        <div className="min-h-[60vh]">
          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div
                  className="farm-glass-card p-5 relative overflow-hidden cursor-pointer group"
                  onClick={() => navigate("fields")}
                >
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-[100%]"></div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--farm-primary-light), var(--farm-primary-glow))",
                    }}
                  >
                    <i className="fas fa-map-marked-alt text-white text-2xl"></i>
                  </div>
                  <div className="text-[32px] font-extrabold text-[#081c15] leading-tight">
                    {farm?.total_area_ha
                      ? parseFloat(farm.total_area_ha).toLocaleString()
                      : "0"}
                  </div>
                  <div className="text-[13px] text-[#52796f] mt-1">
                    Total Hectares
                  </div>
                  <div className="text-[11px] mt-2 font-medium text-[#06d6a0]">
                    <i className="fas fa-arrow-up"></i> {fields.length}{" "}
                    Configured Fields
                  </div>
                </div>

                <div
                  className="farm-glass-card p-5 relative overflow-hidden cursor-pointer group"
                  onClick={() => navigate("crops")}
                >
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-[100%]"></div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--farm-primary-light), var(--farm-primary-glow))",
                    }}
                  >
                    <i className="fas fa-seedling text-white text-2xl"></i>
                  </div>
                  <div className="text-[32px] font-extrabold text-[#081c15] leading-tight">
                    {activeCrops}
                  </div>
                  <div className="text-[13px] text-[#52796f] mt-1">
                    Active Crops
                  </div>
                  <div className="text-[11px] mt-2 font-medium text-[#06d6a0]">
                    <i className="fas fa-arrow-up"></i> Tracked this season
                  </div>
                </div>

                <div
                  className="farm-glass-card p-5 relative overflow-hidden cursor-pointer group"
                  onClick={() => navigate("livestock")}
                >
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-[100%]"></div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--farm-primary-light), var(--farm-primary-glow))",
                    }}
                  >
                    <i className="fas fa-paw text-white text-2xl"></i>
                  </div>
                  <div className="text-[32px] font-extrabold text-[#081c15] leading-tight">
                    {totalLivestock}
                  </div>
                  <div className="text-[13px] text-[#52796f] mt-1">
                    Total Livestock
                  </div>
                  <div className="text-[11px] mt-2 font-medium text-[#06d6a0]">
                    <i className="fas fa-arrow-up"></i> Across{" "}
                    {livestock.length} groups
                  </div>
                </div>

                <div
                  className="farm-glass-card p-5 relative overflow-hidden cursor-pointer group"
                  onClick={() => navigate("labour")}
                >
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-[100%]"></div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--farm-primary-light), var(--farm-primary-glow))",
                    }}
                  >
                    <i className="fas fa-users text-white text-2xl"></i>
                  </div>
                  <div className="text-[32px] font-extrabold text-[#081c15] leading-tight">
                    {farm?.worker_count ?? 0}
                  </div>
                  <div className="text-[13px] text-[#52796f] mt-1">
                    Active Workers
                  </div>
                  <div className="text-[11px] mt-2 font-medium text-[#06d6a0]">
                    <i className="fas fa-arrow-up"></i> Managing operations
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="rounded-[32px] p-7 text-white relative overflow-hidden shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--farm-primary-dark), var(--farm-primary))",
                }}
              >
                <div className="absolute -bottom-5 -right-5 text-[120px] opacity-10 pointer-events-none">
                  🌾
                </div>
                <h3 className="text-[20px] mb-5 flex items-center gap-2.5 font-bold">
                  <i className="fas fa-bolt text-[#ffb703]"></i> Quick Log — One
                  Tap Recording
                </h3>
                <div className="flex gap-3 flex-wrap relative z-10">
                  <button
                    onClick={() => {
                      navigate("crops");
                      openModal("crop-activity");
                    }}
                    className="bg-white/15 backdrop-blur-md border border-white/30 px-6 py-3 rounded-[60px] font-semibold text-[14px] flex items-center gap-2.5 text-white hover:bg-white/30 hover:scale-105 transition-all"
                  >
                    <i className="fas fa-seedling"></i> Crop Activity
                  </button>
                  <button
                    onClick={() => {
                      navigate("livestock");
                      openModal("livestock-activity");
                    }}
                    className="bg-white/15 backdrop-blur-md border border-white/30 px-6 py-3 rounded-[60px] font-semibold text-[14px] flex items-center gap-2.5 text-white hover:bg-white/30 hover:scale-105 transition-all"
                  >
                    <i className="fas fa-paw"></i> Livestock Log
                  </button>
                  <button
                    onClick={() => {
                      navigate("labour");
                      openModal("labour");
                    }}
                    className="bg-white/15 backdrop-blur-md border border-white/30 px-6 py-3 rounded-[60px] font-semibold text-[14px] flex items-center gap-2.5 text-white hover:bg-white/30 hover:scale-105 transition-all"
                  >
                    <i className="fas fa-user-clock"></i> Log Labour Day
                  </button>
                  <button
                    onClick={() => {
                      navigate("finance");
                      openModal("revenue-entry");
                    }}
                    className="bg-[#ff9f1c] border border-transparent px-6 py-3 rounded-[60px] font-semibold text-[14px] flex items-center gap-2.5 text-white hover:bg-[#e85d04] hover:scale-105 transition-all shadow-md"
                  >
                    <i className="fas fa-coins"></i> Record Revenue
                  </button>
                </div>
              </div>

              {/* Two Column Grid: Map & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Farm Map Overlay */}
                <div className="farm-glass-card p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
                    <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                      <i className="fas fa-map text-[#2d6a4f]"></i> Digital Map
                      Overview
                    </h3>
                    <span
                      className="text-[#2d6a4f] text-[13px] cursor-pointer font-medium hover:underline"
                      onClick={() => navigate("fields")}
                    >
                      🗺️ View Fields →
                    </span>
                  </div>
                  <div
                    className="w-full h-[280px] rounded-2xl relative overflow-hidden cursor-pointer group flex-1"
                    style={{
                      background: "linear-gradient(135deg, #2d6a4f, #1b4332)",
                    }}
                  >
                    {fields.slice(0, 3).map((field, idx) => (
                      <div
                        key={field.id}
                        className="absolute bg-white px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[#2d6a4f] shadow-md transition-transform hover:scale-105 z-10"
                        style={{
                          top: `${20 + idx * 25}%`,
                          left: `${20 + idx * 15}%`,
                        }}
                      >
                        {field.current_crop_type ? "🌱" : "📍"} {field.name}
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-medium">
                        No fields mapped yet
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20"
                      onClick={() => navigate("fields")}
                    >
                      <i className="fas fa-search-plus text-white text-5xl drop-shadow-lg"></i>
                    </div>
                  </div>
                </div>

                {/* Alerts / Planting Timeline */}
                <div className="farm-glass-card p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
                    <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                      <i className="fas fa-bell text-[#ff9f1c]"></i> Action
                      Items & Alerts
                    </h3>
                    <span
                      className="text-[#2d6a4f] text-[13px] cursor-pointer font-medium hover:underline"
                      onClick={() => navigate("inventory")}
                    >
                      View All →
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {alerts.length === 0 && plantingNow.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-[#52796f] text-sm py-10 opacity-70">
                        <i className="fas fa-check-circle text-4xl mb-3 text-[#06d6a0]"></i>
                        All caught up! No urgent alerts.
                      </div>
                    )}

                    {alerts.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-[#2d6a4f]/5 transition-colors border border-transparent hover:border-[#dad7cd]"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                          style={{
                            background: item.low_stock
                              ? "var(--farm-danger)"
                              : "var(--farm-warning)",
                          }}
                        >
                          <i
                            className={`fas ${item.low_stock ? "fa-box-open" : "fa-hourglass-half"}`}
                          ></i>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#52796f] font-medium mb-1 uppercase tracking-wider">
                            {item.low_stock
                              ? "Low Stock Alert"
                              : "Expiring Soon"}
                          </div>
                          <div className="text-[14px] font-bold text-[#081c15]">
                            {item.name}
                          </div>
                          <div className="text-[12px] text-[#52796f]">
                            Current Level: {item.quantity} {item.unit}
                          </div>
                        </div>
                      </div>
                    ))}

                    {plantingNow.slice(0, 2).map((e: PlantingWindow) => (
                      <div
                        key={e.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-[#2d6a4f]/5 transition-colors border border-transparent hover:border-[#dad7cd]"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--farm-success), var(--farm-primary-glow))",
                          }}
                        >
                          <i className="fas fa-calendar-check"></i>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#52796f] font-medium mb-1 uppercase tracking-wider">
                            Planting Window Open
                          </div>
                          <div className="text-[14px] font-bold text-[#081c15]">
                            Plant {e.crop_type}
                          </div>
                          <div className="text-[12px] text-[#52796f]">
                            Recommended for {e.region ?? "your region"}
                          </div>
                        </div>
                      </div>
                    ))}

                    {trackerOverdue.slice(0, 2).map((entry: TrackerEntry) => (
                      <div
                        key={entry.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-[#2d6a4f]/5 transition-colors border border-transparent hover:border-[#dad7cd]"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                          style={{ background: "var(--farm-danger)" }}
                        >
                          <i className="fas fa-calendar-times"></i>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#52796f] font-medium mb-1 uppercase tracking-wider">
                            Harvest Overdue
                          </div>
                          <div className="text-[14px] font-bold text-[#081c15]">
                            {entry.crop_category}
                          </div>
                          <div className="text-[12px] text-[#52796f]">
                            Was due {Math.abs(entry.days_until_harvest!)} days
                            ago
                            {entry.quantity &&
                              ` · ${entry.quantity} ${entry.unit ?? ""}`}
                          </div>
                        </div>
                      </div>
                    ))}
                    {trackerUpcoming.slice(0, 2).map((entry: TrackerEntry) => (
                      <div
                        key={entry.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-[#2d6a4f]/5 transition-colors border border-transparent hover:border-[#dad7cd]"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                          style={{ background: "var(--farm-warning)" }}
                        >
                          <i className="fas fa-calendar-check"></i>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#52796f] font-medium mb-1 uppercase tracking-wider">
                            Harvest Due Soon
                          </div>
                          <div className="text-[14px] font-bold text-[#081c15]">
                            {entry.crop_category}
                          </div>
                          <div className="text-[12px] text-[#52796f]">
                            {entry.days_until_harvest === 0
                              ? "Due today"
                              : `In ${entry.days_until_harvest} days`}
                            {entry.quantity &&
                              ` · ${entry.quantity} ${entry.unit ?? ""}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Three Column Grid: Active Crops */}
              <div className="farm-glass-card p-6">
                <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
                  <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                    <i className="fas fa-leaf text-[#2d6a4f]"></i> Active Crops
                    Status
                  </h3>
                  <span
                    className="text-[#2d6a4f] text-[13px] cursor-pointer font-medium hover:underline"
                    onClick={() => navigate("crops")}
                  >
                    🌾 Manage All →
                  </span>
                </div>

                {activeCrops === 0 ? (
                  <div className="py-10 text-center text-[#52796f] bg-white/50 rounded-xl border border-dashed border-[#dad7cd]">
                    No active crops right now. Start planting!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {cropPlans
                      .filter((c) => c.status === "active")
                      .slice(0, 3)
                      .map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-gradient-to-br from-[#f8f9fa] to-white rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-[#dad7cd] hover:border-[#40916c] cursor-pointer"
                          onClick={() => openModal("crop", plan)}
                        >
                          <div className="text-[42px] mb-3">
                            {plan.crop_type.toLowerCase().includes("maize")
                              ? "🌽"
                              : plan.crop_type.toLowerCase().includes("tomato")
                                ? "🍅"
                                : "🌱"}
                          </div>
                          <div className="font-bold text-[16px] text-[#081c15] mb-1">
                            {plan.crop_type}
                          </div>
                          <div className="text-[13px] text-[#52796f]">
                            {plan.field_name ?? "No field assigned"} •{" "}
                            {plan.planned_area_ha ?? "0"} ha
                          </div>

                          {/* Fake Progress based on dates if available, or static 50% */}
                          <div className="bg-[#dad7cd] rounded-full h-2 mt-4 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#2d6a4f] to-[#40916c]"
                              style={{ width: "50%" }}
                            ></div>
                          </div>
                          <div className="text-[11px] mt-2 text-[#52796f] font-medium">
                            {plan.expected_harvest_date
                              ? `Harvest: ${new Date(plan.expected_harvest_date).toLocaleDateString()}`
                              : "Growing"}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Bottom Two Columns: AI Insights & Workers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Insights */}
                <div className="lg:col-span-2 farm-glass-card p-6">
                  <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
                    <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                      <i className="fas fa-brain text-[#118ab2]"></i> AI-Powered
                      Intelligence
                    </h3>
                    <span className="text-[#52796f] text-[12px] font-medium bg-[#f8f9fa] px-3 py-1 rounded-full border border-[#dad7cd]">
                      🤖 Updated Live
                    </span>
                  </div>

                  <div className="space-y-3">
                    {insights.length === 0 ? (
                      <div className="py-8 text-center text-[#52796f] bg-white/50 rounded-xl border border-dashed border-[#dad7cd]">
                        Generate insights from the AI Insights tab to see them
                        here.
                      </div>
                    ) : (
                      insights.slice(0, 3).map((insight, idx) => {
                        // Apply specific styling based on index/type to mimic HTML
                        const styles = [
                          {
                            bg: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                            border: "var(--farm-primary)",
                            icon: "fa-seedling text-[var(--farm-primary)]",
                          },
                          {
                            bg: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
                            border: "var(--farm-secondary)",
                            icon: "fa-chart-line text-[var(--farm-secondary)]",
                          },
                          {
                            bg: "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
                            border: "var(--farm-info)",
                            icon: "fa-lightbulb text-[var(--farm-info)]",
                          },
                        ];
                        const style = styles[idx % styles.length];

                        return (
                          <div
                            key={insight.id}
                            className="rounded-xl p-4 border-l-[5px] shadow-sm cursor-pointer transition-transform hover:scale-[1.01]"
                            style={{
                              background: style.bg,
                              borderLeftColor: style.border,
                            }}
                            onClick={() => navigate("insights")}
                          >
                            <div className="flex items-center gap-2 text-[#081c15] text-[14px]">
                              <i className={`fas ${style.icon}`}></i>{" "}
                              <strong>{insight.title}</strong>
                            </div>
                            <div className="mt-2 text-[13px] text-[#2d3e40] leading-relaxed">
                              {insight.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Top Workers */}
                <div className="farm-glass-card p-6">
                  <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
                    <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                      <i className="fas fa-users text-[#2d6a4f]"></i> Your Team
                    </h3>
                    <span
                      className="text-[#2d6a4f] text-[13px] cursor-pointer font-medium hover:underline"
                      onClick={() => navigate("labour")}
                    >
                      👥 View All
                    </span>
                  </div>

                  <div className="space-y-3">
                    {workers.length === 0 ? (
                      <div className="py-8 text-center text-[#52796f] bg-white/50 rounded-xl border border-dashed border-[#dad7cd]">
                        No workers added yet.
                      </div>
                    ) : (
                      workers.slice(0, 3).map((worker) => (
                        <div
                          key={worker.id}
                          className="bg-gradient-to-br from-white to-[#f8f9fa] border border-[#dad7cd] rounded-xl p-3 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                          onClick={() => openModal("worker", worker)}
                        >
                          <div
                            className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--farm-primary), var(--farm-primary-light))",
                            }}
                          >
                            {worker.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-[14px] font-bold text-[#081c15]">
                              {worker.full_name}
                            </h4>
                            <p className="text-[12px] text-[#52796f] capitalize">
                              {worker.role} •{" "}
                              {worker.is_active ? "Active" : "Inactive"}
                            </p>
                            <div className="text-[11px] mt-0.5 text-[#ffb703]">
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star-half-alt"></i>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FIELDS ── */}
          {section === "fields" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-map-marked-alt text-[#2d6a4f]"></i>{" "}
                  Fields & Zones
                </h2>
                <button
                  onClick={() => openModal("field")}
                  className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
                >
                  + Add Field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="farm-glass-card py-16 text-center">
                  <i className="fas fa-map-marked-alt text-5xl text-[#dad7cd] mb-4"></i>
                  <p className="font-bold text-[#081c15] text-lg">
                    No fields yet
                  </p>
                  <p className="text-sm text-[#52796f] mt-1">
                    Add fields or zones to organise your farm
                  </p>
                  <button
                    onClick={() => openModal("field")}
                    className="mt-5 bg-[var(--farm-primary)] text-white px-6 py-2.5 rounded-[60px] font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform"
                  >
                    Add First Field
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="farm-glass-card p-5 group cursor-pointer hover:-translate-y-1"
                      onClick={() => openModal("field", field)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-[18px] text-[#081c15]">
                          {field.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            field.status === "active"
                              ? "bg-[#e8f5e9] text-[#2d6a4f]"
                              : "bg-[#f8f9fa] text-[#52796f]"
                          }`}
                        >
                          {field.status}
                        </span>
                      </div>
                      <div className="space-y-2.5 text-[13px] text-[#2d3e40]">
                        {field.area_ha && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Size</span>
                            <span className="font-bold">
                              {parseFloat(field.area_ha).toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {field.current_use && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Use</span>
                            <span className="font-bold capitalize">
                              {field.current_use}
                            </span>
                          </div>
                        )}
                        {field.current_crop_type && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Crop</span>
                            <span className="font-bold text-[#2d6a4f]">
                              {field.current_crop_type}
                            </span>
                          </div>
                        )}
                        {field.soil_type && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Soil</span>
                            <span className="font-bold">{field.soil_type}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-[#2d6a4f] text-[12px] font-bold group-hover:underline flex items-center justify-between">
                        Edit field{" "}
                        <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CROPS ── */}
          {section === "crops" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-seedling text-[#2d6a4f]"></i> Crop Plans
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("crop-activity")}
                    className="bg-white/50 border border-[#dad7cd] text-[#2d6a4f] px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-white shadow-sm transition-all"
                  >
                    + Log Activity
                  </button>
                  <button
                    onClick={() => openModal("crop")}
                    className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
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
                      className={`px-4 py-2 rounded-[60px] text-[13px] font-bold transition-all ${
                        (form._cropFilter || "all") === s
                          ? "bg-[var(--farm-primary)] text-white shadow-md"
                          : "bg-white/60 text-[#52796f] border border-[#dad7cd] hover:bg-white"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>

              {cropPlans.length === 0 ? (
                <div className="farm-glass-card py-16 text-center">
                  <i className="fas fa-seedling text-5xl text-[#dad7cd] mb-4"></i>
                  <p className="font-bold text-[#081c15] text-lg">
                    No crop plans yet
                  </p>
                  <button
                    onClick={() => openModal("crop")}
                    className="mt-5 bg-[var(--farm-primary)] text-white px-6 py-2.5 rounded-[60px] font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform"
                  >
                    Create First Plan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cropPlans
                    .filter(
                      (c) =>
                        (form._cropFilter || "all") === "all" ||
                        c.status === form._cropFilter,
                    )
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="farm-glass-card p-5 transition-transform hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                        onClick={() => openModal("crop", plan)}
                      >
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-4 mb-4 flex-wrap">
                            <span className="text-[40px] leading-none shrink-0 drop-shadow-sm">
                              {plan.crop_type.toLowerCase().includes("maize")
                                ? "🌽"
                                : plan.crop_type
                                      .toLowerCase()
                                      .includes("tomato")
                                  ? "🍅"
                                  : "🌱"}
                            </span>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-bold text-[18px] text-[#081c15]">
                                  {plan.crop_type}
                                </h3>
                                {plan.variety && (
                                  <span className="text-[13px] text-[#52796f]">
                                    ({plan.variety})
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                                    plan.status === "active"
                                      ? "bg-[#e8f5e9] text-[#2d6a4f]"
                                      : plan.status === "harvested"
                                        ? "bg-[#fff3e0] text-[#ff9f1c]"
                                        : plan.status === "planned"
                                          ? "bg-[#e0f7fa] text-[#118ab2]"
                                          : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {plan.status}
                                </span>
                              </div>
                              <div className="text-[13px] text-[#2d6a4f] font-semibold mt-1 flex items-center gap-1.5">
                                <i className="fas fa-map-marker-alt"></i>{" "}
                                {plan.field_name ?? "Unassigned Field"}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px] text-[#2d3e40] bg-[#f8f9fa]/80 p-3.5 rounded-xl border border-black/5">
                            <div>
                              <div className="text-[#52796f] text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                Area
                              </div>
                              <div className="font-bold text-[#081c15]">
                                {plan.planned_area_ha
                                  ? `${parseFloat(plan.planned_area_ha).toLocaleString()} ha`
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-[#52796f] text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                Planted
                              </div>
                              <div className="font-bold text-[#081c15]">
                                {plan.planting_date
                                  ? new Date(
                                      plan.planting_date,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-[#52796f] text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                Harvest
                              </div>
                              <div className="font-bold text-[#081c15]">
                                {plan.expected_harvest_date
                                  ? new Date(
                                      plan.expected_harvest_date,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-[#52796f] text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                Expected Yield
                              </div>
                              <div className="font-bold text-[#081c15]">
                                {plan.expected_yield_kg
                                  ? `${parseFloat(plan.expected_yield_kg).toLocaleString()} kg`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          {plan.activity_count > 0 && (
                            <div className="mt-3 text-[12px] text-[#52796f] flex items-center gap-1.5 font-medium">
                              <i className="fas fa-history"></i>{" "}
                              {plan.activity_count} activities logged
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 w-full md:w-auto flex justify-end">
                          <button className="bg-white/80 border border-[#dad7cd] w-10 h-10 rounded-full flex items-center justify-center text-[#2d6a4f] hover:bg-[var(--farm-primary)] hover:text-white hover:border-[var(--farm-primary)] transition-all shadow-sm">
                            <i className="fas fa-pen text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── LIVESTOCK ── */}
          {section === "livestock" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-paw text-[#2d6a4f]"></i> Livestock
                  Management
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("livestock-activity")}
                    className="bg-white/50 border border-[#dad7cd] text-[#2d6a4f] px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-white shadow-sm transition-all"
                  >
                    + Log Activity
                  </button>
                  <button
                    onClick={() => openModal("livestock")}
                    className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
                  >
                    + Add Group
                  </button>
                </div>
              </div>

              {livestock.length === 0 ? (
                <div className="farm-glass-card py-16 text-center">
                  <i className="fas fa-paw text-5xl text-[#dad7cd] mb-4"></i>
                  <p className="font-bold text-[#081c15] text-lg">
                    No livestock recorded
                  </p>
                  <button
                    onClick={() => openModal("livestock")}
                    className="mt-5 bg-[var(--farm-primary)] text-white px-6 py-2.5 rounded-[60px] font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform"
                  >
                    Add Livestock
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {livestock.map((group) => (
                    <div
                      key={group.id}
                      className="farm-glass-card p-5 group hover:-translate-y-1 cursor-pointer transition-transform"
                      onClick={() => openModal("livestock", group)}
                    >
                      <div className="flex items-center justify-between mb-5 border-b border-black/5 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-gradient-to-br from-white to-[#f8f9fa] border border-[#dad7cd]">
                            {SPECIES_EMOJI[group.species] ?? "🐾"}
                          </div>
                          <div>
                            <div className="font-bold text-[18px] text-[#081c15] capitalize">
                              {group.species}
                            </div>
                            {group.breed && (
                              <div className="text-[13px] text-[#52796f]">
                                {group.breed}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[28px] font-extrabold text-[#081c15] leading-none">
                            {group.count}
                          </div>
                          <div className="text-[10px] text-[#52796f] font-bold uppercase tracking-wider mt-1">
                            Head
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-[13px] text-[#2d3e40]">
                        {group.purpose && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Purpose</span>
                            <span className="font-bold capitalize">
                              {group.purpose}
                            </span>
                          </div>
                        )}
                        {group.field_name && (
                          <div className="flex justify-between border-b border-black/5 pb-1.5">
                            <span className="text-[#52796f]">Location</span>
                            <span className="font-bold text-[#2d6a4f]">
                              {group.field_name}
                            </span>
                          </div>
                        )}
                        {group.total_cost &&
                          parseFloat(group.total_cost) > 0 && (
                            <div className="flex justify-between border-b border-black/5 pb-1.5">
                              <span className="text-[#52796f]">
                                Total costs
                              </span>
                              <span className="font-bold text-[#e63946]">
                                ${parseFloat(group.total_cost).toFixed(2)}
                              </span>
                            </div>
                          )}
                      </div>
                      <div className="mt-4 text-[#2d6a4f] text-[12px] font-bold group-hover:underline flex items-center justify-between">
                        Edit group{" "}
                        <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LABOUR ── */}
          {section === "labour" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-users-cog text-[#2d6a4f]"></i> Labour
                  Tracking
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("worker")}
                    className="bg-white/50 border border-[#dad7cd] text-[#2d6a4f] px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-white shadow-sm transition-all"
                  >
                    + Add Worker
                  </button>
                  <button
                    onClick={() => openModal("labour")}
                    className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
                  >
                    + Log Labour Day
                  </button>
                </div>
              </div>

              {labourSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      label: "Man-Days (month)",
                      value: labourSummary.total_entries,
                      icon: "fa-clipboard-list",
                      color: "var(--farm-info)",
                    },
                    {
                      label: "Total Hours",
                      value: `${parseFloat(labourSummary.total_hours || "0").toFixed(0)}h`,
                      icon: "fa-clock",
                      color: "var(--farm-primary-light)",
                    },
                    {
                      label: "Wages Paid",
                      value: `$${parseFloat(labourSummary.total_wages || "0").toFixed(2)}`,
                      icon: "fa-money-bill-wave",
                      color: "var(--farm-danger)",
                    },
                    {
                      label: "Area Covered",
                      value: `${parseFloat(labourSummary.total_area || "0").toFixed(2)} ha`,
                      icon: "fa-map-marked-alt",
                      color: "var(--farm-secondary)",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="farm-glass-card p-5 relative overflow-hidden"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-sm"
                        style={{ backgroundColor: s.color }}
                      >
                        <i className={`fas ${s.icon} text-lg`}></i>
                      </div>
                      <div className="text-[28px] font-extrabold text-[#081c15] leading-tight">
                        {s.value}
                      </div>
                      <div className="text-[13px] text-[#52796f] mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="farm-glass-card p-6">
                <div className="flex justify-between items-center mb-5 border-b border-black/5 pb-4">
                  <h3 className="text-[18px] font-bold flex items-center gap-2.5 text-[#081c15]">
                    <i className="fas fa-users text-[#2d6a4f]"></i> Worker
                    Directory ({workers.length})
                  </h3>
                </div>
                {workers.length === 0 ? (
                  <div className="py-10 text-center text-[#52796f] bg-white/50 rounded-xl border border-dashed border-[#dad7cd]">
                    No workers added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className="bg-gradient-to-br from-white to-[#f8f9fa] border border-[#dad7cd] rounded-xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
                        onClick={() => openModal("worker", worker)}
                      >
                        <div
                          className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner"
                          style={{
                            background: worker.is_active
                              ? "linear-gradient(135deg, var(--farm-primary), var(--farm-primary-light))"
                              : "#dad7cd",
                          }}
                        >
                          {worker.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[15px] font-bold text-[#081c15]">
                            {worker.full_name}
                          </h4>
                          <p className="text-[12px] text-[#52796f] capitalize">
                            {worker.role}
                          </p>
                          {worker.phone && (
                            <p className="text-[11px] text-[#52796f] mt-0.5">
                              <i className="fas fa-phone-alt"></i>{" "}
                              {worker.phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {worker.daily_wage_usd && (
                            <div className="text-[13px] font-bold text-[#2d6a4f]">
                              ${parseFloat(worker.daily_wage_usd).toFixed(2)}/d
                            </div>
                          )}
                          {worker.total_days_worked && (
                            <div className="text-[11px] text-[#52796f]">
                              {worker.total_days_worked} days
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {section === "inventory" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-boxes text-[#2d6a4f]"></i> Inventory
                  Levels
                </h2>
                <button
                  onClick={() => openModal("inventory")}
                  className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
                >
                  + Add Item
                </button>
              </div>

              {alerts.length > 0 && (
                <div className="bg-[#fff3e0] border-l-[5px] border-[#ff9f1c] p-4 rounded-xl shadow-sm flex items-center gap-3">
                  <i className="fas fa-exclamation-triangle text-[#e85d04] text-xl"></i>
                  <div className="text-[14px] font-bold text-[#e85d04]">
                    {alerts.length} item{alerts.length !== 1 ? "s" : ""} need
                    attention
                  </div>
                </div>
              )}

              {inventory.length === 0 ? (
                <div className="farm-glass-card py-16 text-center">
                  <i className="fas fa-box-open text-5xl text-[#dad7cd] mb-4"></i>
                  <p className="font-bold text-[#081c15] text-lg">
                    No inventory items
                  </p>
                  <button
                    onClick={() => openModal("inventory")}
                    className="mt-5 bg-[var(--farm-primary)] text-white px-6 py-2.5 rounded-[60px] font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform"
                  >
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="farm-glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8f9fa] border-b border-[#dad7cd]">
                        <tr>
                          {[
                            "Item",
                            "Type",
                            "Stock",
                            "Unit Cost",
                            "Total Value",
                            "Status",
                            "Action",
                          ].map((h) => (
                            <th
                              key={h}
                              className="p-4 text-[12px] font-bold text-[#52796f] uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {inventory.map((item) => (
                          <tr
                            key={item.id}
                            className={`transition-colors hover:bg-black/5 ${item.low_stock || item.expiring_soon ? "bg-[#fff3e0]/30" : ""}`}
                          >
                            <td className="p-4">
                              <div className="font-bold text-[14px] text-[#081c15]">
                                {item.name}
                              </div>
                              {item.expiry_date && (
                                <div className="text-[11px] text-[#52796f] mt-0.5">
                                  Exp:{" "}
                                  {new Date(
                                    item.expiry_date,
                                  ).toLocaleDateString("en-GB")}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-[13px] text-[#2d3e40] capitalize">
                              {item.item_type}
                            </td>
                            <td className="p-4 text-[13px] font-bold text-[#081c15]">
                              {parseFloat(item.quantity).toLocaleString()}{" "}
                              {item.unit}
                            </td>
                            <td className="p-4 text-[13px] text-[#52796f]">
                              {item.unit_cost_usd
                                ? `$${parseFloat(item.unit_cost_usd).toFixed(2)}`
                                : "—"}
                            </td>
                            <td className="p-4 text-[13px] font-bold text-[#2d6a4f]">
                              {item.unit_cost_usd
                                ? `$${(parseFloat(item.quantity) * parseFloat(item.unit_cost_usd)).toFixed(2)}`
                                : "—"}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 flex-wrap">
                                {item.low_stock && (
                                  <span className="text-[10px] bg-[#ffebee] text-[#c62828] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Low
                                  </span>
                                )}
                                {item.expiring_soon && (
                                  <span className="text-[10px] bg-[#fff3e0] text-[#e85d04] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Expiring
                                  </span>
                                )}
                                {!item.low_stock && !item.expiring_soon && (
                                  <span className="text-[10px] bg-[#e8f5e9] text-[#2d6a4f] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    OK
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => openModal("inventory", item)}
                                className="text-[12px] font-bold text-[#2d6a4f] hover:underline bg-[#f8f9fa] border border-[#dad7cd] px-3 py-1.5 rounded-[60px]"
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
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                    <i className="fas fa-calendar-alt text-[#2d6a4f]"></i>{" "}
                    Cropping Calendar
                  </h2>
                  <p className="text-[13px] text-[#52796f] mt-1">
                    Zimbabwe seasonal planting guide — pre-seeded with regional
                    defaults
                  </p>
                </div>
                <button
                  onClick={() => openModal("calendar")}
                  className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all"
                >
                  + Add Custom Entry
                </button>
              </div>

              {plantingNow.length > 0 && (
                <div className="farm-glass-card p-5 border-l-[5px] border-[var(--farm-primary)] bg-green-50/50">
                  <h3 className="font-bold text-[#081c15] mb-3 flex items-center gap-2">
                    <i className="fas fa-seedling text-[var(--farm-primary)]"></i>
                    Plant NOW — Month {new Date().getMonth() + 1}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plantingNow.map((e: any) => (
                      <span
                        key={e.id}
                        className="bg-green-100 text-[#2d6a4f] text-[13px] px-3.5 py-1.5 rounded-[60px] font-bold border border-green-300"
                      >
                        🌱 {e.crop_type}
                        {e.expected_harvest_weeks
                          ? ` · ${e.expected_harvest_weeks}wks`
                          : ""}
                        {e.region && (
                          <span className="font-normal opacity-70 ml-1">
                            ({e.region})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {calendarUpcoming.length > 0 && (
                <div className="farm-glass-card p-5 border-l-[5px] border-[#ffb703] bg-amber-50/50">
                  <h3 className="font-bold text-[#081c15] mb-3 flex items-center gap-2">
                    <i className="fas fa-clock text-[#ffb703]"></i> Coming Up
                    Soon
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {calendarUpcoming.map((e: any) => (
                      <span
                        key={e.id}
                        className="bg-amber-100 text-amber-800 text-[13px] px-3.5 py-1.5 rounded-[60px] font-semibold border border-amber-300"
                      >
                        {e.starts_in_months === 1
                          ? "Next month"
                          : "In 2 months"}
                        : {e.crop_type}
                        {e.region && (
                          <span className="font-normal opacity-70 ml-1">
                            ({e.region})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cropPlanAlerts.length > 0 && (
                <div className="farm-glass-card p-5">
                  <h3 className="font-bold text-[#081c15] mb-4 flex items-center gap-2">
                    <i className="fas fa-tasks text-[#118ab2]"></i> Your Crop
                    Plans vs Calendar
                  </h3>
                  <div className="space-y-2">
                    {cropPlanAlerts.map((alert: any) => (
                      <div
                        key={alert.crop_plan_id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          alert.schedule_status === "on_schedule"
                            ? "bg-green-50 border-green-200"
                            : alert.schedule_status === "off_schedule"
                              ? "bg-red-50 border-red-200"
                              : alert.schedule_status === "no_date_set"
                                ? "bg-amber-50 border-amber-200"
                                : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[14px] text-[#081c15]">
                            {alert.crop_type}
                          </span>
                          <span
                            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              alert.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {alert.status}
                          </span>
                          {alert.planting_date && (
                            <span className="ml-2 text-[12px] text-[#52796f]">
                              Planted:{" "}
                              {new Date(alert.planting_date).toLocaleDateString(
                                "en-GB",
                                { day: "2-digit", month: "short" },
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[12px]">
                          {alert.recommended_window && (
                            <span className="text-[#52796f]">
                              Window: {alert.recommended_window}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              alert.schedule_status === "on_schedule"
                                ? "bg-green-200 text-green-900"
                                : alert.schedule_status === "off_schedule"
                                  ? "bg-red-200 text-red-900"
                                  : alert.schedule_status === "no_date_set"
                                    ? "bg-amber-200 text-amber-900"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {alert.schedule_status === "on_schedule"
                              ? "✓ On schedule"
                              : alert.schedule_status === "off_schedule"
                                ? "⚠ Off schedule"
                                : alert.schedule_status === "no_date_set"
                                  ? "No date set"
                                  : "No calendar data"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin-Assigned Crop Tracker */}
              {trackerEntries.length > 0 && (
                <div className="farm-glass-card overflow-hidden">
                  <div className="p-5 border-b border-[#dad7cd] flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-[#081c15] flex items-center gap-2">
                        <i className="fas fa-clipboard-list text-[#118ab2]"></i>
                        Admin-Assigned Crop Schedule
                      </h3>
                      <p className="text-[12px] text-[#52796f] mt-0.5">
                        Crops tracked by Agrivus team · {trackerEntries.length}{" "}
                        entr{trackerEntries.length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {trackerOverdue.length > 0 && (
                        <span className="text-[11px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                          ⚠ {trackerOverdue.length} overdue
                        </span>
                      )}
                      {trackerUpcoming.length > 0 && (
                        <span className="text-[11px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                          🕐 {trackerUpcoming.length} due soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-black/5">
                    {trackerEntries.map((entry: TrackerEntry) => {
                      const isOverdue =
                        entry.days_until_harvest !== null &&
                        entry.days_until_harvest < 0 &&
                        entry.status !== "harvested";
                      const isDueSoon =
                        entry.days_until_harvest !== null &&
                        entry.days_until_harvest >= 0 &&
                        entry.days_until_harvest <= 30 &&
                        entry.status !== "harvested";
                      const isHarvested = entry.status === "harvested";

                      return (
                        <div
                          key={entry.id}
                          className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                            isOverdue
                              ? "bg-red-50/40"
                              : isDueSoon
                                ? "bg-amber-50/40"
                                : "hover:bg-black/5"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shrink-0 shadow-sm ${
                                isHarvested
                                  ? "bg-gray-400"
                                  : isOverdue
                                    ? "bg-red-500"
                                    : isDueSoon
                                      ? "bg-amber-500"
                                      : "bg-[#2d6a4f]"
                              }`}
                            >
                              {isHarvested
                                ? "✓"
                                : isOverdue
                                  ? "!"
                                  : isDueSoon
                                    ? "⏰"
                                    : "🌱"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[15px] text-[#081c15]">
                                  {entry.crop_category}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    entry.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : entry.status === "pending"
                                        ? "bg-blue-100 text-blue-700"
                                        : entry.status === "harvested"
                                          ? "bg-gray-100 text-gray-600"
                                          : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {entry.status}
                                </span>
                                {isOverdue && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">
                                    {Math.abs(entry.days_until_harvest!)}d
                                    overdue
                                  </span>
                                )}
                              </div>
                              {entry.quantity && (
                                <div className="text-[12px] text-[#52796f] mt-0.5">
                                  {entry.quantity} {entry.unit ?? ""}
                                  {entry.created_by_name && (
                                    <span className="ml-2 opacity-60">
                                      · Assigned by {entry.created_by_name}
                                    </span>
                                  )}
                                </div>
                              )}
                              {entry.notes && (
                                <div className="text-[12px] text-[#52796f] mt-0.5 italic">
                                  {entry.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {entry.harvest_date ? (
                              <div>
                                <div
                                  className={`text-[13px] font-bold ${
                                    isOverdue
                                      ? "text-red-600"
                                      : isDueSoon
                                        ? "text-amber-600"
                                        : "text-[#2d6a4f]"
                                  }`}
                                >
                                  {new Date(
                                    entry.harvest_date,
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-[11px] text-[#52796f] mt-0.5">
                                  {isHarvested
                                    ? "Harvested"
                                    : entry.days_until_harvest === 0
                                      ? "Due today"
                                      : isOverdue
                                        ? `${Math.abs(entry.days_until_harvest!)} days ago`
                                        : `${entry.days_until_harvest} days left`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[12px] text-[#52796f]">
                                No harvest date set
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {trackerEntries.length === 0 && (
                <div className="farm-glass-card p-5 border border-dashed border-[#dad7cd] text-center">
                  <i className="fas fa-clipboard-list text-2xl text-[#dad7cd] mb-2"></i>
                  <p className="text-[13px] text-[#52796f]">
                    No admin-assigned crops yet
                  </p>
                  <p className="text-[11px] text-[#52796f] mt-1 opacity-70">
                    The Agrivus team will assign crop schedules to your account
                    when available
                  </p>
                </div>
              )}

              <div className="farm-glass-card overflow-hidden">
                <div className="p-5 border-b border-[#dad7cd] flex items-center justify-between">
                  <h3 className="font-bold text-[#081c15]">
                    All Crops ({calendar.length})
                  </h3>
                  <span className="text-[12px] text-[#52796f]">
                    Months shown as numbers (1=Jan, 12=Dec)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b border-[#dad7cd]">
                      <tr>
                        {[
                          "Crop",
                          "Region",
                          "Plant Window",
                          "Harvest",
                          "Soil",
                          "Water",
                          "Common Pests",
                        ].map((h) => (
                          <th
                            key={h}
                            className="p-4 text-[11px] font-bold text-[#52796f] uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {calendar.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-10 text-center text-[#52796f] text-sm"
                          >
                            Loading calendar data...
                          </td>
                        </tr>
                      ) : (
                        calendar.map((e: any) => {
                          const isPlantingNow = plantingNow.some(
                            (p) => p.id === e.id,
                          );
                          return (
                            <tr
                              key={e.id}
                              className={`transition-colors hover:bg-black/5 ${isPlantingNow ? "bg-green-50/60" : ""}`}
                            >
                              <td className="p-4 font-bold text-[14px] text-[#081c15]">
                                {isPlantingNow && (
                                  <span className="mr-1.5">🌱</span>
                                )}
                                {e.crop_type}
                              </td>
                              <td className="p-4 text-[13px] text-[#2d3e40]">
                                {e.region ?? "—"}
                              </td>
                              <td className="p-4 text-[13px] font-medium">
                                {e.recommended_planting_start &&
                                e.recommended_planting_end ? (
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${
                                      isPlantingNow
                                        ? "bg-green-100 text-green-800"
                                        : "bg-[#f8f9fa] text-[#52796f]"
                                    }`}
                                  >
                                    {
                                      [
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                      ][e.recommended_planting_start - 1]
                                    }
                                    {" – "}
                                    {
                                      [
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                      ][e.recommended_planting_end - 1]
                                    }
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="p-4 text-[13px] text-[#2d3e40]">
                                {e.expected_harvest_weeks
                                  ? `${e.expected_harvest_weeks} weeks`
                                  : "—"}
                              </td>
                              <td className="p-4 text-[12px] text-[#52796f] max-w-[180px]">
                                <div
                                  className="truncate"
                                  title={e.soil_requirements ?? ""}
                                >
                                  {e.soil_requirements ?? "—"}
                                </div>
                              </td>
                              <td className="p-4 text-[12px] text-[#52796f] max-w-[180px]">
                                <div
                                  className="truncate"
                                  title={e.water_requirements ?? ""}
                                >
                                  {e.water_requirements ?? "—"}
                                </div>
                              </td>
                              <td className="p-4 text-[12px] text-[#52796f] max-w-[200px]">
                                <div
                                  className="truncate"
                                  title={e.common_pests ?? ""}
                                >
                                  {e.common_pests ?? "—"}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {section === "reports" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-file-invoice text-[#2d6a4f]"></i> Farm
                  Reports
                </h2>
              </div>

              {!weeklyReport && !monthlyReport ? (
                <div className="farm-glass-card py-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {monthlyReport && (
                    <div className="farm-glass-card p-6">
                      <h3 className="text-[18px] font-bold text-[#081c15] mb-5 border-b border-black/5 pb-4">
                        Monthly Summary —{" "}
                        {new Date(
                          monthlyReport.period.year,
                          monthlyReport.period.month - 1,
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
                            icon: "fa-user-clock",
                            color: "text-[#118ab2]",
                          },
                          {
                            label: "Wages",
                            value: `$${toNumber(monthlyReport.summary.totalWages).toFixed(2)}`,
                            icon: "fa-money-bill-wave",
                            color: "text-[#e63946]",
                          },
                          {
                            label: "Input Costs",
                            value: `$${toNumber(monthlyReport.summary.totalInputs).toFixed(2)}`,
                            icon: "fa-seedling",
                            color: "text-[#ff9f1c]",
                          },
                          {
                            label: "Total Cost",
                            value: `$${toNumber(monthlyReport.summary.totalCost).toFixed(2)}`,
                            icon: "fa-calculator",
                            color: "text-[#2d6a4f]",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="bg-gradient-to-br from-white to-[#f8f9fa] border border-[#dad7cd] rounded-xl p-4 text-center"
                          >
                            <i
                              className={`fas ${s.icon} ${s.color} text-xl mb-2`}
                            ></i>
                            <div className="text-xl font-bold text-[#081c15]">
                              {s.value}
                            </div>
                            <div className="text-[12px] font-bold uppercase tracking-wider text-[#52796f] mt-1">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {monthlyReport.labour.byTask.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-[#081c15] mb-3 text-sm flex items-center gap-2">
                            <i className="fas fa-tasks text-[#2d6a4f]"></i>{" "}
                            Labour by Task
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-[#dad7cd]">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead className="bg-[#f8f9fa] border-b border-[#dad7cd]">
                                <tr>
                                  {[
                                    "Task",
                                    "Man-Days",
                                    "Hours",
                                    "Area (ha)",
                                    "Wages",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className={`p-3 text-[11px] font-bold text-[#52796f] uppercase tracking-wider ${h !== "Task" ? "text-right" : ""}`}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black/5">
                                {monthlyReport.labour.byTask.map(
                                  (row: MonthlyLabourTaskRow) => (
                                    <tr
                                      key={row.task_category}
                                      className="hover:bg-black/5 transition-colors"
                                    >
                                      <td className="p-3 font-medium text-[#081c15] capitalize">
                                        {row.task_category.replace("_", " ")}
                                      </td>
                                      <td className="p-3 text-right">
                                        {row.man_days}
                                      </td>
                                      <td className="p-3 text-right">
                                        {toNumber(row.total_hours).toFixed(0)}
                                      </td>
                                      <td className="p-3 text-right">
                                        {toNumber(row.area_covered).toFixed(2)}
                                      </td>
                                      <td className="p-3 text-right font-bold text-[#e63946]">
                                        ${toNumber(row.total_wages).toFixed(2)}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {monthlyReport.inventory.length > 0 && (
                        <div>
                          <h4 className="font-bold text-[#081c15] mb-3 text-sm flex items-center gap-2">
                            <i className="fas fa-boxes text-[#ff9f1c]"></i>{" "}
                            Inputs Consumed
                          </h4>
                          <div className="space-y-2">
                            {monthlyReport.inventory.map(
                              (row: MonthlyInventoryRow) => (
                                <div
                                  key={row.name}
                                  className="flex items-center justify-between bg-white border border-[#dad7cd] rounded-lg p-3 text-sm"
                                >
                                  <div>
                                    <span className="font-bold text-[#081c15]">
                                      {row.name}
                                    </span>
                                    <span className="text-[#52796f] text-xs ml-2 capitalize bg-[#f8f9fa] px-2 py-0.5 rounded-full">
                                      {row.item_type}
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="font-bold text-[#2d6a4f]">
                                      {toNumber(
                                        row.total_used,
                                      ).toLocaleString()}{" "}
                                      {row.unit}
                                    </span>
                                    <span className="font-bold text-[#e63946] w-20 text-right">
                                      ${toNumber(row.total_cost).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {weeklyReport && (
                    <div className="farm-glass-card p-6">
                      <h3 className="text-[18px] font-bold text-[#081c15] mb-5 border-b border-black/5 pb-4">
                        Weekly Summary — {weeklyReport.period.startDate} to{" "}
                        {weeklyReport.period.endDate}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] border border-[#118ab2]/20 rounded-xl p-4 text-center">
                          <div className="text-3xl font-extrabold text-[#118ab2]">
                            {weeklyReport.labour?.total_entries ?? 0}
                          </div>
                          <div className="text-[12px] font-bold text-[#118ab2] uppercase tracking-wider mt-1">
                            Labour Entries
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#ffebee] to-[#ffcdd2] border border-[#e63946]/20 rounded-xl p-4 text-center">
                          <div className="text-3xl font-extrabold text-[#e63946]">
                            $
                            {toNumber(weeklyReport.labour?.total_wages).toFixed(
                              2,
                            )}
                          </div>
                          <div className="text-[12px] font-bold text-[#e63946] uppercase tracking-wider mt-1">
                            Wages Paid
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] border border-[#2d6a4f]/20 rounded-xl p-4 text-center">
                          <div className="text-3xl font-extrabold text-[#2d6a4f]">
                            {weeklyReport.cropActivities?.length ?? 0}
                          </div>
                          <div className="text-[12px] font-bold text-[#2d6a4f] uppercase tracking-wider mt-1">
                            Crop Activities
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── FINANCE ── */}
          {section === "finance" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                  <i className="fas fa-coins text-[#ff9f1c]"></i> Financial
                  Management
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("expense")}
                    className="bg-white/50 border border-[#dad7cd] text-[#e63946] px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-white shadow-sm transition-all"
                  >
                    - Record Expense
                  </button>
                  <button
                    onClick={() => openModal("revenue-entry")}
                    className="bg-[#2d6a4f] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[#40916c] shadow-md transition-all"
                  >
                    + Record Revenue
                  </button>
                </div>
              </div>

              {/* Month selector */}
              <div className="farm-glass-card flex items-center gap-3 px-5 py-3 w-fit border-l-[4px] border-[var(--farm-primary)]">
                <i className="fas fa-calendar-alt text-[#2d6a4f]"></i>
                <span className="text-sm font-bold text-[#081c15]">
                  Period:
                </span>
                <select
                  value={finPeriod.month}
                  onChange={(e) =>
                    setFinPeriod((p) => ({
                      ...p,
                      month: Number(e.target.value),
                    }))
                  }
                  className="bg-white border border-[#dad7cd] rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-[#2d6a4f]"
                >
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={finPeriod.year}
                  onChange={(e) =>
                    setFinPeriod((p) => ({
                      ...p,
                      year: Number(e.target.value),
                    }))
                  }
                  className="bg-white border border-[#dad7cd] rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-[#2d6a4f]"
                >
                  {[
                    new Date().getFullYear() - 1,
                    new Date().getFullYear(),
                    new Date().getFullYear() + 1,
                  ].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* P&L Summary */}
              {profitability && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="farm-glass-card p-5 border-t-[4px] border-[#06d6a0] text-center">
                    <div className="text-[#52796f] text-[11px] font-bold uppercase tracking-wider mb-2">
                      Total Revenue
                    </div>
                    <div className="text-[28px] font-extrabold text-[#06d6a0]">
                      ${profitability.summary.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="farm-glass-card p-5 border-t-[4px] border-[#e63946] text-center">
                    <div className="text-[#52796f] text-[11px] font-bold uppercase tracking-wider mb-2">
                      Total Expenses
                    </div>
                    <div className="text-[28px] font-extrabold text-[#e63946]">
                      ${profitability.summary.totalExpenses.toFixed(2)}
                    </div>
                  </div>
                  <div
                    className={`farm-glass-card p-5 border-t-[4px] text-center ${profitability.summary.isProfit ? "border-[#118ab2]" : "border-[#ff9f1c]"}`}
                  >
                    <div className="text-[#52796f] text-[11px] font-bold uppercase tracking-wider mb-2">
                      Net {profitability.summary.isProfit ? "Profit" : "Loss"}
                    </div>
                    <div
                      className={`text-[28px] font-extrabold ${profitability.summary.isProfit ? "text-[#118ab2]" : "text-[#ff9f1c]"}`}
                    >
                      {profitability.summary.isProfit ? "+" : ""}$
                      {profitability.summary.netProfit.toFixed(2)}
                    </div>
                  </div>
                  <div className="farm-glass-card p-5 border-t-[4px] border-[#ffb703] text-center">
                    <div className="text-[#52796f] text-[11px] font-bold uppercase tracking-wider mb-2">
                      Profit Margin
                    </div>
                    <div className="text-[28px] font-extrabold text-[#ffb703]">
                      {profitability.summary.profitMargin}
                    </div>
                  </div>
                </div>
              )}

              {/* Profit by crop */}
              {profitability && profitability.byCrop.length > 0 && (
                <div className="farm-glass-card p-6">
                  <h3 className="font-bold text-[#081c15] mb-4 flex items-center gap-2">
                    <i className="fas fa-chart-pie text-[#2d6a4f]"></i> Profit
                    by Crop
                  </h3>
                  <div className="space-y-3">
                    {profitability.byCrop.map((c: ProfitabilityCropRow) => {
                      const profit = toNumber(c.profit);
                      const revenue = toNumber(c.revenue);
                      const expenses = toNumber(c.expenses);
                      return (
                        <div
                          key={c.crop_plan_id}
                          className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-[#dad7cd] bg-white p-4 transition-transform hover:-translate-y-0.5 shadow-sm"
                        >
                          <div className="mb-2 md:mb-0">
                            <span className="font-bold text-[16px] text-[#081c15]">
                              {c.crop_type}
                            </span>
                            {c.variety && (
                              <span className="text-[13px] text-[#52796f] ml-2">
                                ({c.variety})
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                            <span className="text-[#06d6a0] bg-[#06d6a0]/10 px-3 py-1 rounded-full">
                              <i className="fas fa-arrow-up"></i> $
                              {revenue.toFixed(2)}
                            </span>
                            <span className="text-[#e63946] bg-[#e63946]/10 px-3 py-1 rounded-full">
                              <i className="fas fa-arrow-down"></i> $
                              {expenses.toFixed(2)}
                            </span>
                            <span
                              className={`font-bold px-4 py-1 rounded-full text-white ${profit >= 0 ? "bg-[#118ab2]" : "bg-[#ff9f1c]"}`}
                            >
                              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6-month trend */}
              {profitability && profitability.trend.length > 0 && (
                <div className="farm-glass-card p-6">
                  <h3 className="font-bold text-[#081c15] mb-4 flex items-center gap-2">
                    <i className="fas fa-chart-line text-[#2d6a4f]"></i> 6-Month
                    Trend
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#dad7cd]">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8f9fa] border-b border-[#dad7cd]">
                        <tr>
                          {["Month", "Revenue", "Expenses", "Net P&L"].map(
                            (h) => (
                              <th
                                key={h}
                                className={`p-3 text-[11px] font-bold text-[#52796f] uppercase tracking-wider ${h !== "Month" ? "text-right" : ""}`}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {profitability.trend.map(
                          (row: ProfitabilityTrendRow) => {
                            const net = toNumber(row.profit);
                            return (
                              <tr
                                key={row.month}
                                className="hover:bg-black/5 transition-colors"
                              >
                                <td className="p-3 font-bold text-[#081c15]">
                                  {row.month}
                                </td>
                                <td className="p-3 text-right font-medium text-[#06d6a0]">
                                  ${toNumber(row.revenue).toFixed(2)}
                                </td>
                                <td className="p-3 text-right font-medium text-[#e63946]">
                                  ${toNumber(row.expenses).toFixed(2)}
                                </td>
                                <td
                                  className={`p-3 text-right font-bold ${net >= 0 ? "text-[#118ab2]" : "text-[#ff9f1c]"}`}
                                >
                                  {net >= 0 ? "+" : ""}${net.toFixed(2)}
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Two columns: recent expenses + revenue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="farm-glass-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#081c15] flex items-center gap-2">
                      <i className="fas fa-arrow-down text-[#e63946]"></i>{" "}
                      Recent Expenses
                    </h3>
                    <button
                      onClick={() => openModal("expense")}
                      className="text-xs font-bold text-[#2d6a4f] hover:underline bg-[#f8f9fa] border border-[#dad7cd] px-3 py-1.5 rounded-[60px]"
                    >
                      + Add
                    </button>
                  </div>
                  {expenses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dad7cd] bg-white/50 py-10 text-center text-sm text-[#52796f]">
                      No expenses recorded this period
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.slice(0, 8).map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between bg-white border border-[#dad7cd] rounded-xl p-3 shadow-sm hover:border-[#e63946]/50 transition-colors cursor-pointer"
                          onClick={() => openModal("expense", exp)}
                        >
                          <div>
                            <div className="text-[14px] font-bold text-[#081c15]">
                              {exp.description}
                            </div>
                            <div className="text-[11px] text-[#52796f] mt-0.5">
                              <span className="capitalize">{exp.category}</span>{" "}
                              •{" "}
                              {new Date(exp.expense_date).toLocaleDateString(
                                "en-GB",
                                { day: "2-digit", month: "short" },
                              )}
                              {exp.crop_type && ` • ${exp.crop_type}`}
                            </div>
                          </div>
                          <span className="text-[15px] font-extrabold text-[#e63946]">
                            ${parseFloat(exp.amount_usd).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="farm-glass-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#081c15] flex items-center gap-2">
                      <i className="fas fa-arrow-up text-[#06d6a0]"></i> Recent
                      Revenue
                    </h3>
                    <button
                      onClick={() => openModal("revenue-entry")}
                      className="text-xs font-bold text-[#2d6a4f] hover:underline bg-[#f8f9fa] border border-[#dad7cd] px-3 py-1.5 rounded-[60px]"
                    >
                      + Add
                    </button>
                  </div>
                  {revenue.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dad7cd] bg-white/50 py-10 text-center text-sm text-[#52796f]">
                      No revenue recorded this period
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {revenue.slice(0, 8).map((rev) => (
                        <div
                          key={rev.id}
                          className="flex items-center justify-between bg-white border border-[#dad7cd] rounded-xl p-3 shadow-sm hover:border-[#06d6a0]/50 transition-colors cursor-pointer"
                          onClick={() => openModal("revenue-entry", rev)}
                        >
                          <div>
                            <div className="text-[14px] font-bold text-[#081c15]">
                              {rev.description}
                            </div>
                            <div className="text-[11px] text-[#52796f] mt-0.5">
                              <span className="capitalize">{rev.category}</span>{" "}
                              •{" "}
                              {new Date(rev.revenue_date).toLocaleDateString(
                                "en-GB",
                                { day: "2-digit", month: "short" },
                              )}
                              {rev.buyer_name && ` • ${rev.buyer_name}`}
                            </div>
                          </div>
                          <span className="text-[15px] font-extrabold text-[#06d6a0]">
                            ${parseFloat(rev.amount_usd).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MARKET ── */}
          {section === "market" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                    <i className="fas fa-broadcast-tower text-[#2d6a4f]"></i>{" "}
                    Market Intelligence
                  </h2>
                  <p className="text-[13px] text-[#52796f] mt-1">
                    Current prices and AI-powered market recommendations
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal("market-price")}
                    className="bg-white/50 border border-[#dad7cd] text-[#2d6a4f] px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-white shadow-sm transition-all"
                  >
                    + Add Price
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setGenMarket(true);
                        const r = await api.post("/farm-os/market/insights");
                        if (r.data.success) {
                          setMarketInsights(r.data.data.insights);
                          const mpR = await api.get("/farm-os/market");
                          if (mpR.data.success)
                            setMarketPrices(mpR.data.data.prices);
                          flash("success", "Market insights generated");
                        }
                      } catch (err: unknown) {
                        flash("error", getApiErrorMessage(err, "Failed"));
                      } finally {
                        setGenMarket(false);
                      }
                    }}
                    disabled={genMarket}
                    className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-sm hover:bg-[var(--farm-primary-light)] shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {genMarket ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Analysing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-satellite-dish"></i> Get Market
                        Insights
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI market insights */}
              {marketInsights && (
                <div className="farm-glass-card p-6 border-l-[5px] border-[var(--farm-info)]">
                  <h3 className="font-bold text-[#081c15] mb-2 flex items-center gap-2">
                    <i className="fas fa-robot text-[var(--farm-info)]"></i> AI
                    Market Overview
                  </h3>
                  <p className="text-[14px] text-[#2d3e40] mb-5 bg-[#f8f9fa] p-4 rounded-xl border border-[#dad7cd] leading-relaxed">
                    {marketInsights.marketSummary}
                  </p>

                  {(marketInsights.recommendations ?? []).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[13px] font-bold text-[#52796f] uppercase tracking-wider mb-2">
                        Recommendations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(marketInsights.recommendations ?? []).map(
                          (rec: MarketRecommendation, i: number) => (
                            <div
                              key={i}
                              className="bg-white border border-[#dad7cd] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="font-bold text-[#081c15] text-[16px]">
                                    {rec.crop}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                      rec.action === "sell_now"
                                        ? "bg-[#e8f5e9] text-[#2d6a4f]"
                                        : rec.action === "hold"
                                          ? "bg-[#fff3e0] text-[#ff9f1c]"
                                          : rec.action === "plant_more"
                                            ? "bg-[#e0f7fa] text-[#118ab2]"
                                            : "bg-[#ffebee] text-[#e63946]"
                                    }`}
                                  >
                                    {rec.action?.replace("_", " ")}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                      rec.urgency === "high"
                                        ? "bg-[#e63946] text-white"
                                        : rec.urgency === "medium"
                                          ? "bg-[#ff9f1c] text-white"
                                          : "bg-[#dad7cd] text-[#2d3e40]"
                                    }`}
                                  >
                                    {rec.urgency}
                                  </span>
                                </div>
                                <p className="text-[13px] text-[#52796f] leading-relaxed">
                                  {rec.reason}
                                </p>
                              </div>
                              {rec.estimatedPrice && (
                                <div className="mt-3 pt-3 border-t border-black/5 text-right">
                                  <span className="text-[12px] text-[#52796f] font-medium mr-2">
                                    Est. Price:
                                  </span>
                                  <span className="text-[16px] font-bold text-[#081c15]">
                                    {rec.estimatedPrice}
                                  </span>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Commodity prices table */}
              <div className="farm-glass-card overflow-hidden">
                <div className="p-5 border-b border-[#dad7cd] flex items-center justify-between">
                  <h3 className="font-bold text-[#081c15]">
                    Current Market Prices
                  </h3>
                </div>
                {marketPrices.length === 0 ? (
                  <div className="py-16 text-center">
                    <i className="fas fa-satellite-dish text-5xl text-[#dad7cd] mb-4"></i>
                    <p className="font-bold text-[#081c15] text-lg">
                      No market prices yet
                    </p>
                    <p className="text-sm text-[#52796f] mt-1">
                      Add prices manually or generate AI market insights
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-[#f8f9fa] border-b border-[#dad7cd]">
                        <tr>
                          {[
                            "Commodity",
                            "Price",
                            "Unit",
                            "Demand",
                            "Region",
                            "Date",
                            "Source",
                          ].map((h) => (
                            <th
                              key={h}
                              className="p-4 text-[11px] font-bold text-[#52796f] uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {marketPrices.map((price) => (
                          <tr
                            key={price.id}
                            className="hover:bg-black/5 transition-colors"
                          >
                            <td className="p-4 font-bold text-[#081c15]">
                              {price.commodity}
                              {price.is_ai_generated && (
                                <span className="ml-2 text-[10px] bg-[#e0f7fa] text-[#118ab2] px-2 py-0.5 rounded-full font-bold">
                                  AI
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-extrabold text-[#06d6a0]">
                              ${parseFloat(price.price_usd).toFixed(2)}
                            </td>
                            <td className="p-4 text-[#52796f]">
                              per {price.unit}
                            </td>
                            <td className="p-4">
                              {price.demand_level && (
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    price.demand_level === "very_high"
                                      ? "bg-[#ffebee] text-[#e63946]"
                                      : price.demand_level === "high"
                                        ? "bg-[#fff3e0] text-[#e85d04]"
                                        : price.demand_level === "medium"
                                          ? "bg-[#fffde7] text-[#ffb703]"
                                          : "bg-[#f8f9fa] text-[#52796f]"
                                  }`}
                                >
                                  {price.demand_level.replace("_", " ")}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-[#2d3e40]">
                              {price.region ?? "—"}
                            </td>
                            <td className="p-4 text-[#52796f]">
                              {new Date(price.price_date).toLocaleDateString(
                                "en-GB",
                                { day: "2-digit", month: "short" },
                              )}
                            </td>
                            <td className="p-4 text-[#52796f] text-xs">
                              {price.source ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {section === "analytics" && (
            <FarmOSAnalytics hasAccess={hasAccess} flash={flash} />
          )}

          {/* ── INSIGHTS ── */}
          {section === "insights" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
                    <i className="fas fa-brain text-[#118ab2]"></i> AI Farm
                    Insights
                  </h2>
                  <p className="text-[13px] text-[#52796f] mt-1">
                    Powered by Claude AI — analysed dynamically from your farm
                    data
                  </p>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={genInsights}
                  className="bg-[var(--farm-info)] text-white px-6 py-3 rounded-[60px] font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {genInsights ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Analysing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-robot"></i> Generate Insights
                    </>
                  )}
                </button>
              </div>

              {genInsights && (
                <div className="farm-glass-card p-6 border-l-[5px] border-[var(--farm-info)] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#e0f7fa] flex items-center justify-center">
                    <i className="fas fa-cog fa-spin text-2xl text-[#118ab2]"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#081c15] text-[16px]">
                      Analysing your farm ecosystem...
                    </h3>
                    <p className="text-[#52796f] text-sm mt-1">
                      Reviewing crops, livestock, inventory, and finance data.
                      This takes about 15 seconds.
                    </p>
                  </div>
                </div>
              )}

              {insights.length === 0 && !genInsights ? (
                <div className="farm-glass-card py-20 text-center">
                  <i className="fas fa-robot text-6xl text-[#dad7cd] mb-5"></i>
                  <p className="font-bold text-[#081c15] text-xl">
                    No insights generated yet
                  </p>
                  <p className="text-sm text-[#52796f] mt-2 max-w-md mx-auto">
                    Ensure your farm profile has active data (crops, livestock,
                    expenses), then click Generate Insights to receive AI
                    recommendations.
                  </p>
                  <button
                    onClick={handleGenerateInsights}
                    className="bg-[var(--farm-info)] text-white px-8 py-3 rounded-[60px] font-bold text-sm shadow-md mt-6 hover:-translate-y-0.5 transition-transform"
                  >
                    Generate First Insights
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {insights.map((insight) => {
                    // Match insight categories to custom colors
                    let styleClass =
                      "border-l-[5px] border-[var(--farm-gray)] bg-gradient-to-br from-white to-[#f8f9fa]";
                    let icon = "fa-lightbulb text-[var(--farm-gray)]";

                    const type = insight.insight_type.toLowerCase();
                    if (type.includes("crop") || type.includes("plant")) {
                      styleClass =
                        "border-l-[5px] border-[var(--farm-primary)] bg-gradient-to-br from-[#f8f9fa] to-[#e8f5e9]";
                      icon = "fa-seedling text-[var(--farm-primary)]";
                    } else if (
                      type.includes("finance") ||
                      type.includes("profit") ||
                      type.includes("cost")
                    ) {
                      styleClass =
                        "border-l-[5px] border-[#ffb703] bg-gradient-to-br from-[#f8f9fa] to-[#fffde7]";
                      icon = "fa-coins text-[#ffb703]";
                    } else if (
                      type.includes("risk") ||
                      type.includes("alert") ||
                      type.includes("pest")
                    ) {
                      styleClass =
                        "border-l-[5px] border-[var(--farm-danger)] bg-gradient-to-br from-[#f8f9fa] to-[#ffebee]";
                      icon =
                        "fa-exclamation-triangle text-[var(--farm-danger)]";
                    } else if (
                      type.includes("livestock") ||
                      type.includes("animal")
                    ) {
                      styleClass =
                        "border-l-[5px] border-[var(--farm-warning)] bg-gradient-to-br from-[#f8f9fa] to-[#fff3e0]";
                      icon = "fa-paw text-[var(--farm-warning)]";
                    } else if (
                      type.includes("labour") ||
                      type.includes("worker")
                    ) {
                      styleClass =
                        "border-l-[5px] border-[var(--farm-info)] bg-gradient-to-br from-[#f8f9fa] to-[#e0f7fa]";
                      icon = "fa-users-cog text-[var(--farm-info)]";
                    }

                    return (
                      <div
                        key={insight.id}
                        className={`rounded-2xl p-6 shadow-sm border border-[#dad7cd] hover:-translate-y-1 transition-all ${styleClass}`}
                      >
                        <div className="flex items-start justify-between mb-3 border-b border-black/5 pb-3">
                          <h3 className="font-bold text-[#081c15] text-[16px] pr-4 leading-tight flex items-start gap-2">
                            <i className={`fas ${icon} mt-0.5`}></i>{" "}
                            {insight.title}
                          </h3>
                        </div>
                        <p className="text-[14px] text-[#2d3e40] leading-relaxed">
                          {insight.content}
                        </p>
                        <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center text-[11px] font-bold text-[#52796f] uppercase tracking-wider">
                          <span>{insight.insight_type}</span>
                          <span>
                            {new Date(insight.generated_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL ──────────────────────────────────────────────────────────── */}
        {modal.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className={`${panelCls} rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            >
              <div className="px-6 py-4 border-b border-secondary-green/10 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
                <h2 className="text-lg font-bold text-gray-900">
                  {(
                    {
                      farm: "Farm Profile",
                      field: modal.editing ? "Edit Field" : "Add Field",
                      worker: modal.editing ? "Edit Worker" : "Add Worker",
                      crop: modal.editing ? "Edit Crop Plan" : "New Crop Plan",
                      "crop-activity": "Log Crop Activity",
                      livestock: modal.editing
                        ? "Edit Livestock"
                        : "Add Livestock",
                      "livestock-activity": "Log Livestock Activity",
                      labour: "Log Labour Day",
                      inventory: modal.editing
                        ? "Edit Item"
                        : "Add Inventory Item",
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
                    <Field label="Date of Birth" required>
                      <input
                        type="date"
                        value={form.date_of_birth ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            date_of_birth: e.target.value,
                          }))
                        }
                        required
                        max={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() - 18,
                            ),
                          )
                            .toISOString()
                            .split("T")[0]
                        }
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Worker must be at least 18 years old
                      </p>
                    </Field>
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
                              is_active: e.target.value,
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
                            {SPECIES_EMOJI[g.species]} {g.species} ({g.count}{" "}
                            head)
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
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
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
                            setForm((f) => ({
                              ...f,
                              worker_id: e.target.value,
                            }))
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
                            setForm((f) => ({
                              ...f,
                              work_date: e.target.value,
                            }))
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
                      <Field label="Area Covered">
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.area_value ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                area_value: e.target.value,
                              }))
                            }
                            placeholder="0"
                            className={inputCls + " flex-1 min-w-0"}
                          />
                          <select
                            value={form.area_unit ?? "ha"}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                area_unit: e.target.value,
                              }))
                            }
                            className="border border-secondary-green/20 bg-white/80 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/40 shrink-0"
                          >
                            <option value="ha">ha</option>
                            <option value="sqm">m²</option>
                            <option value="acres">acres</option>
                            <option value="plants">plants</option>
                            <option value="rows">rows</option>
                            <option value="beds">beds</option>
                          </select>
                        </div>
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
                  <button type="submit" className={btnPrimaryCls}>
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
