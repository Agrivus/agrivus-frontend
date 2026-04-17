import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subscription {
  status: "trial" | "active" | "expired" | "cancelled";
  trial_ends_at: string;
  current_period_end: string | null;
  plan_name: string | null;
  billing_cycle: string | null;
  price_usd: string | null;
}

interface Plan {
  id: string;
  name: string;
  billing_cycle: "monthly" | "annual";
  price_usd: string;
}

interface LogEntry {
  id: string;
  log_date: string;
  activity_type: string;
  crop: string | null;
  field_area: string | null;
  description: string | null;
  weather: string | null;
  notes: string | null;
  inputs: any[];
  yields: any[];
}

const ACTIVITY_TYPES = [
  { value: "planting",     label: "🌱 Planting",     color: "bg-green-100 text-green-800"  },
  { value: "spraying",     label: "💧 Spraying",     color: "bg-blue-100 text-blue-800"    },
  { value: "harvesting",   label: "🌾 Harvesting",   color: "bg-yellow-100 text-yellow-800"},
  { value: "feeding",      label: "🐄 Feeding",      color: "bg-orange-100 text-orange-800"},
  { value: "irrigation",   label: "💦 Irrigation",   color: "bg-cyan-100 text-cyan-800"    },
  { value: "pruning",      label: "✂️ Pruning",      color: "bg-purple-100 text-purple-800"},
  { value: "fertilising",  label: "🧪 Fertilising",  color: "bg-lime-100 text-lime-800"    },
  { value: "weeding",      label: "🌿 Weeding",      color: "bg-teal-100 text-teal-800"    },
  { value: "inspection",   label: "🔍 Inspection",   color: "bg-gray-100 text-gray-800"    },
  { value: "other",        label: "📝 Other",        color: "bg-gray-100 text-gray-700"    },
];

const WEATHER_OPTIONS = ["Sunny", "Cloudy", "Rainy", "Windy", "Hot", "Cold", "Humid"];
const INPUT_TYPES     = ["seed", "fertiliser", "chemical", "labour", "equipment", "water", "other"];
const UNITS           = ["kg", "litres", "crates", "bags", "tonnes", "boxes", "hours", "units"];

function activityColor(type: string) {
  return ACTIVITY_TYPES.find((a) => a.value === type)?.color ?? "bg-gray-100 text-gray-700";
}
function activityLabel(type: string) {
  return ACTIVITY_TYPES.find((a) => a.value === type)?.label ?? type;
}

const emptyInput = { input_type: "seed", name: "", quantity: "", unit: "", cost_usd: "", supplier: "" };
const emptyYield = { crop: "", quantity: "", unit: "kg", quality: "", notes: "" };

const emptyForm = {
  log_date:      new Date().toISOString().split("T")[0],
  activity_type: "planting",
  crop:          "",
  field_area:    "",
  description:   "",
  weather:       "",
  notes:         "",
  inputs:        [] as typeof emptyInput[],
  yields:        [] as typeof emptyYield[],
};

// ─────────────────────────────────────────────────────────────────────────────

export default function FarmLog() {
  const [subLoading, setSubLoading]   = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [access, setAccess]           = useState<"trial" | "active" | "expired" | "cancelled" | "none">("none");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [plans, setPlans]             = useState<Plan[]>([]);
  const [logs, setLogs]               = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [form, setForm]               = useState({ ...emptyForm });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<"logs" | "reports">("logs");
  const [weeklyReport, setWeeklyReport] = useState<any>(null);

  // ── Load subscription ───────────────────────────────────────────────────────

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, []);

  const loadSubscription = async () => {
    try {
      setSubLoading(true);
      const res = await api.get("/farm-log/subscription");
      if (res.data.success) {
        setSubscription(res.data.data.subscription);
        setAccess(res.data.data.access);
        setTrialDaysLeft(res.data.data.trialDaysLeft);
      }
    } catch (err) { console.error(err); }
    finally { setSubLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const res = await api.get("/farm-log/plans");
      if (res.data.success) setPlans(res.data.data.plans);
    } catch (err) { console.error(err); }
  };

  const loadLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get("/farm-log/logs", { params: { limit: 30 } });
      if (res.data.success) setLogs(res.data.data.logs);
    } catch (err) { console.error(err); }
    finally { setLogsLoading(false); }
  }, []);

  const loadWeeklyReport = useCallback(async () => {
    try {
      const res = await api.get("/farm-log/reports/weekly");
      if (res.data.success) setWeeklyReport(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (access === "trial" || access === "active") {
      loadLogs();
    }
  }, [access, loadLogs]);

  useEffect(() => {
    if (activeTab === "reports" && (access === "trial" || access === "active")) {
      loadWeeklyReport();
    }
  }, [activeTab, access, loadWeeklyReport]);

  // ── Subscribe with wallet ───────────────────────────────────────────────────

  const handleWalletSubscribe = async (planId: string) => {
    try {
      setSaving(true);
      const res = await api.post("/farm-log/subscribe/wallet", { planId });
      if (res.data.success) {
        flash("success", res.data.message);
        loadSubscription();
      }
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Payment failed");
    } finally { setSaving(false); }
  };

  const handlePaynowSubscribe = async (planId: string) => {
    try {
      setSaving(true);
      const res = await api.post("/farm-log/subscribe/paynow", { planId, paymentMethod: "ecocash" });
      if (res.data.success && res.data.data?.redirectUrl) {
        window.location.href = res.data.data.redirectUrl;
      }
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Payment initiation failed");
    } finally { setSaving(false); }
  };

  // ── Log CRUD ────────────────────────────────────────────────────────────────

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, log_date: new Date().toISOString().split("T")[0] });
    setModalOpen(true);
  };

  const openEdit = (log: LogEntry) => {
    setEditingId(log.id);
    setForm({
      log_date:      log.log_date.split("T")[0],
      activity_type: log.activity_type,
      crop:          log.crop ?? "",
      field_area:    log.field_area ?? "",
      description:   log.description ?? "",
      weather:       log.weather ?? "",
      notes:         log.notes ?? "",
      inputs:        log.inputs ?? [],
      yields:        log.yields ?? [],
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        log_date:      form.log_date,
        activity_type: form.activity_type,
        crop:          form.crop || null,
        field_area:    form.field_area || null,
        description:   form.description || null,
        weather:       form.weather || null,
        notes:         form.notes || null,
        inputs: form.inputs.filter((i) => i.name.trim()).map((i) => ({
          ...i,
          quantity: i.quantity ? Number(i.quantity) : null,
          cost_usd: i.cost_usd ? Number(i.cost_usd) : null,
        })),
        yields: form.yields.filter((y) => y.crop.trim()).map((y) => ({
          ...y,
          quantity: Number(y.quantity),
        })),
      };

      if (editingId) {
        await api.put(`/farm-log/logs/${editingId}`, payload);
        flash("success", "Log updated");
      } else {
        await api.post("/farm-log/logs", payload);
        flash("success", "Log entry added");
      }

      setModalOpen(false);
      loadLogs();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to save log");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/farm-log/logs/${id}`);
      flash("success", "Log deleted");
      setDeleteConfirmId(null);
      loadLogs();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to delete");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION GATE
  // ─────────────────────────────────────────────────────────────────────────────

  if (subLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (access === "expired" || access === "cancelled" || access === "none") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">📒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm Log</h1>
            <p className="text-gray-600 text-lg">
              {access === "expired"
                ? "Your free trial has ended. Subscribe to continue tracking your farm."
                : "Subscribe to unlock the Farm Log and start tracking your farm activities."}
            </p>
          </div>

          {/* Feature list */}
          <Card className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">What's included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "📅 Daily activity logs",
                "🌱 Input & seed tracking",
                "💰 Cost tracking per activity",
                "🌾 Yield & harvest recording",
                "📊 Weekly performance reports",
                "📱 Mobile-friendly interface",
                "☁️ Works offline (syncs when online)",
                "🔒 Your data, private to you",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {f}
                </div>
              ))}
            </div>
          </Card>

          {/* Plans */}
          {plans.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">No subscription plans available yet. Contact support.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className={`border-2 ${plan.billing_cycle === "annual" ? "border-green-500" : "border-gray-200"}`}>
                  {plan.billing_cycle === "annual" && (
                    <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">Best Value</div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="text-3xl font-bold text-green-600 my-3">
                    ${parseFloat(plan.price_usd).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500">
                      /{plan.billing_cycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.billing_cycle === "annual"
                      ? `$${(parseFloat(plan.price_usd) / 12).toFixed(2)}/month billed annually`
                      : "Billed monthly, cancel anytime"}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleWalletSubscribe(plan.id)}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      Pay from Wallet
                    </button>
                    <button
                      onClick={() => handlePaynowSubscribe(plan.id)}
                      disabled={saving}
                      className="w-full px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      Pay via EcoCash / Paynow
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/dashboard" className="text-green-600 hover:text-green-700 text-sm">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN FARM LOG UI (trial or active)
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📒 Farm Log</h1>
            <p className="text-gray-600 text-sm mt-1">
              {access === "trial"
                ? `Free trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`
                : `${subscription?.plan_name} — active until ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—"}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {access === "trial" && trialDaysLeft <= 7 && (
              <Link to="/farm-log/subscribe" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                Subscribe Now
              </Link>
            )}
            <button onClick={openCreate} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm">
              + New Log
            </button>
            <Link to="/dashboard" className="text-green-600 hover:text-green-700 text-sm font-medium">← Dashboard</Link>
          </div>
        </div>

        {/* Trial banner */}
        {access === "trial" && (
          <div className={`mb-6 px-4 py-3 rounded-lg border text-sm ${trialDaysLeft <= 7 ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
            {trialDaysLeft <= 7
              ? `⚠️ Your free trial ends in ${trialDaysLeft} days. Subscribe to keep access to your farm logs.`
              : `ℹ️ You are on a 30-day free trial. ${trialDaysLeft} days remaining.`}
          </div>
        )}

        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${feedback.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {feedback.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[{ key: "logs", label: "Activity Logs" }, { key: "reports", label: "Reports" }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── LOGS TAB ── */}
        {activeTab === "logs" && (
          <>
            {logsLoading ? (
              <div className="py-16 flex justify-center"><LoadingSpinner /></div>
            ) : logs.length === 0 ? (
              <Card>
                <div className="py-16 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <p className="font-medium text-gray-700">No logs yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start recording your daily farm activities</p>
                  <button onClick={openCreate} className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    Add First Log
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${activityColor(log.activity_type)}`}>
                            {activityLabel(log.activity_type)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(log.log_date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          {log.crop && <span className="text-sm text-gray-600">• {log.crop}</span>}
                          {log.field_area && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{log.field_area}</span>}
                          {log.weather && <span className="text-xs text-gray-400">☁️ {log.weather}</span>}
                        </div>

                        {log.description && <p className="text-sm text-gray-700 mb-2">{log.description}</p>}

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          {log.inputs?.length > 0 && (
                            <span className="flex items-center gap-1">
                              🧪 {log.inputs.length} input{log.inputs.length !== 1 ? "s" : ""}
                              {log.inputs.some((i) => i.cost_usd) && (
                                <span className="text-red-600 font-medium">
                                  — ${log.inputs.reduce((s: number, i: any) => s + (parseFloat(i.cost_usd) || 0), 0).toFixed(2)} cost
                                </span>
                              )}
                            </span>
                          )}
                          {log.yields?.length > 0 && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              🌾 {log.yields.map((y: any) => `${y.quantity} ${y.unit} ${y.crop}`).join(", ")}
                            </span>
                          )}
                          {log.notes && <span title={log.notes}>📝 Note</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEdit(log)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        {deleteConfirmId === log.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(log.id)} className="text-red-600 text-xs font-medium">Confirm</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 text-xs">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(log.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <>
            {!weeklyReport ? (
              <div className="py-16 flex justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{weeklyReport.summary?.total_activities ?? 0}</div>
                      <div className="text-sm text-gray-600">Activities this week</div>
                    </div>
                  </Card>
                  <Card className="bg-red-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">${parseFloat(weeklyReport.summary?.total_cost ?? 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total costs</div>
                    </div>
                  </Card>
                  <Card className="bg-green-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{parseFloat(weeklyReport.summary?.total_yield ?? 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total yield (units)</div>
                    </div>
                  </Card>
                </div>

                {/* By activity type */}
                {weeklyReport.byActivity?.length > 0 && (
                  <Card>
                    <h3 className="font-bold text-gray-900 mb-4">Activity Breakdown</h3>
                    <div className="space-y-2">
                      {weeklyReport.byActivity.map((a: any) => (
                        <div key={a.activity_type} className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${activityColor(a.activity_type)}`}>
                            {activityLabel(a.activity_type)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{a.count}×</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* By day */}
                {weeklyReport.byDay?.length > 0 && (
                  <Card>
                    <h3 className="font-bold text-gray-900 mb-4">Daily Summary ({weeklyReport.startDate} → {weeklyReport.endDate})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Activities</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Cost</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Yield</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weeklyReport.byDay.map((d: any) => (
                            <tr key={d.log_date} className="border-b border-gray-100">
                              <td className="py-2 text-gray-700">{new Date(d.log_date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</td>
                              <td className="py-2 text-right text-gray-700">{d.activities}</td>
                              <td className="py-2 text-right text-red-600">${parseFloat(d.total_cost).toFixed(2)}</td>
                              <td className="py-2 text-right text-green-600">{parseFloat(d.total_yield).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Log Entry" : "New Log Entry"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
              {/* Date + Activity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.log_date} onChange={(e) => setForm((f) => ({ ...f, log_date: e.target.value }))}
                    required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type <span className="text-red-500">*</span></label>
                  <select value={form.activity_type} onChange={(e) => setForm((f) => ({ ...f, activity_type: e.target.value }))}
                    required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                    {ACTIVITY_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Crop + Field */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <input type="text" value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
                    placeholder="e.g. Tomatoes" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field / Area</label>
                  <input type="text" value={form.field_area} onChange={(e) => setForm((f) => ({ ...f, field_area: e.target.value }))}
                    placeholder="e.g. Block A" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              {/* Description + Weather */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="What was done..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
                  <select value={form.weather} onChange={(e) => setForm((f) => ({ ...f, weather: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                    <option value="">Select weather...</option>
                    {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              {/* Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Inputs Used</label>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, inputs: [...f.inputs, { ...emptyInput }] }))}
                    className="text-xs text-green-600 hover:text-green-700 font-medium">+ Add Input</button>
                </div>
                {form.inputs.map((input, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-center">
                    <select value={input.input_type} onChange={(e) => setForm((f) => { const inputs = [...f.inputs]; inputs[idx].input_type = e.target.value; return { ...f, inputs }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500">
                      {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input placeholder="Name *" value={input.name} onChange={(e) => setForm((f) => { const inputs = [...f.inputs]; inputs[idx].name = e.target.value; return { ...f, inputs }; })}
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <input type="number" placeholder="Qty" value={input.quantity} onChange={(e) => setForm((f) => { const inputs = [...f.inputs]; inputs[idx].quantity = e.target.value; return { ...f, inputs }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <input type="number" placeholder="Cost $" value={input.cost_usd} onChange={(e) => setForm((f) => { const inputs = [...f.inputs]; inputs[idx].cost_usd = e.target.value; return { ...f, inputs }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, inputs: f.inputs.filter((_, i) => i !== idx) }))}
                      className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
              </div>

              {/* Yields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Yield / Harvest</label>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, yields: [...f.yields, { ...emptyYield }] }))}
                    className="text-xs text-green-600 hover:text-green-700 font-medium">+ Add Yield</button>
                </div>
                {form.yields.map((y, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 mb-2 items-center">
                    <input placeholder="Crop *" value={y.crop} onChange={(e) => setForm((f) => { const yields = [...f.yields]; yields[idx].crop = e.target.value; return { ...f, yields }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <input type="number" placeholder="Qty *" value={y.quantity} onChange={(e) => setForm((f) => { const yields = [...f.yields]; yields[idx].quantity = e.target.value; return { ...f, yields }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <select value={y.unit} onChange={(e) => setForm((f) => { const yields = [...f.yields]; yields[idx].unit = e.target.value; return { ...f, yields }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500">
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input placeholder="Quality" value={y.quality} onChange={(e) => setForm((f) => { const yields = [...f.yields]; yields[idx].quality = e.target.value; return { ...f, yields }; })}
                      className="col-span-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, yields: f.yields.filter((_, i) => i !== idx) }))}
                      className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Any additional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}