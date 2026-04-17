import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";

interface Plan {
  id: string;
  name: string;
  billing_cycle: "monthly" | "annual";
  price_usd: string;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
}

interface Subscription {
  id: string;
  farmer_id: string;
  full_name: string;
  email: string;
  status: string;
  plan_name: string | null;
  billing_cycle: string | null;
  price_usd: string | null;
  trial_ends_at: string;
  current_period_end: string | null;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  trial:     "bg-blue-100 text-blue-800",
  active:    "bg-green-100 text-green-800",
  expired:   "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function AdminFarmLogPlans() {
  const [plans,         setPlans]         = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [feedback,      setFeedback]      = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeTab,     setActiveTab]     = useState<"plans" | "subscribers">("plans");
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [form,          setForm]          = useState({ name: "", billing_cycle: "monthly", price_usd: "" });
  const [subFilter,     setSubFilter]     = useState("");

  useEffect(() => { loadPlans(); loadSubscriptions(); }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/farm-log/plans");
      if (res.data.success) setPlans(res.data.data.plans);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadSubscriptions = async () => {
    try {
      const params: any = { limit: 100 };
      if (subFilter) params.status = subFilter;
      const res = await api.get("/admin/farm-log/subscriptions", { params });
      if (res.data.success) setSubscriptions(res.data.data.subscriptions);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadSubscriptions(); }, [subFilter]);

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", billing_cycle: "monthly", price_usd: "" });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setForm({ name: plan.name, billing_cycle: plan.billing_cycle, price_usd: plan.price_usd });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price_usd) { flash("error", "Name and price are required"); return; }

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/admin/farm-log/plans/${editingId}`, { name: form.name, price_usd: Number(form.price_usd) });
        flash("success", "Plan updated");
      } else {
        await api.post("/admin/farm-log/plans", { name: form.name, billing_cycle: form.billing_cycle, price_usd: Number(form.price_usd) });
        flash("success", "Plan created");
      }
      setModalOpen(false);
      loadPlans();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to save plan");
    } finally { setSaving(false); }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      await api.put(`/admin/farm-log/plans/${plan.id}`, { is_active: !plan.is_active });
      loadPlans();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to update plan");
    }
  };

  // Summary stats
  const totalActive    = subscriptions.filter((s) => s.status === "active").length;
  const totalTrial     = subscriptions.filter((s) => s.status === "trial").length;
  const totalExpired   = subscriptions.filter((s) => s.status === "expired").length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "active" && s.billing_cycle === "monthly")
    .reduce((sum, s) => sum + parseFloat(s.price_usd ?? "0"), 0);

  if (loading) return <div className="container mx-auto px-4 py-8"><LoadingSpinner /></div>;

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📒 Farm Log Subscriptions</h1>
          <p className="text-gray-600">Manage subscription plans and view subscribers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            + New Plan
          </button>
          <Link to="/admin" className="text-green-600 hover:text-green-700 font-medium">← Dashboard</Link>
        </div>
      </div>

      {feedback && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${feedback.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {feedback.msg}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50"><div className="text-center"><div className="text-2xl font-bold text-green-600">{totalActive}</div><div className="text-sm text-gray-600">Active Subscribers</div></div></Card>
        <Card className="bg-blue-50"><div className="text-center"><div className="text-2xl font-bold text-blue-600">{totalTrial}</div><div className="text-sm text-gray-600">On Trial</div></div></Card>
        <Card className="bg-red-50"><div className="text-center"><div className="text-2xl font-bold text-red-600">{totalExpired}</div><div className="text-sm text-gray-600">Expired</div></div></Card>
        <Card className="bg-purple-50"><div className="text-center"><div className="text-2xl font-bold text-purple-600">${monthlyRevenue.toFixed(2)}</div><div className="text-sm text-gray-600">Monthly MRR</div></div></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[{ key: "plans", label: "Subscription Plans" }, { key: "subscribers", label: `Subscribers (${subscriptions.length})` }].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PLANS TAB ── */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">📋</div>
              <p>No plans yet. Create one to get started.</p>
            </div>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className={`border-2 ${plan.is_active ? "border-green-200" : "border-gray-200 opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{plan.billing_cycle}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ${parseFloat(plan.price_usd).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/{plan.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Created by {plan.created_by_name}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(plan)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Edit</button>
                  <button onClick={() => toggleActive(plan)} className={`flex-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${plan.is_active ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-green-100 hover:bg-green-200 text-green-700"}`}>
                    {plan.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── SUBSCRIBERS TAB ── */}
      {activeTab === "subscribers" && (
        <>
          <div className="mb-4">
            <select value={subFilter} onChange={(e) => setSubFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
              <option value="">All Statuses</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Card>
            {subscriptions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No subscribers found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Farmer", "Plan", "Status", "Trial Ends / Period End", "Joined"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{sub.full_name}</div>
                          <div className="text-xs text-gray-500">{sub.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {sub.plan_name ? `${sub.plan_name} (${sub.billing_cycle})` : <span className="text-gray-400">—</span>}
                          {sub.price_usd && <div className="text-xs text-gray-500">${parseFloat(sub.price_usd).toFixed(2)}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLOR[sub.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sub.status === "trial"
                            ? new Date(sub.trial_ends_at).toLocaleDateString()
                            : sub.current_period_end
                              ? new Date(sub.current_period_end).toLocaleDateString()
                              : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Plan" : "Create Plan"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Monthly Basic" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                  <select value={form.billing_cycle} onChange={(e) => setForm((f) => ({ ...f, billing_cycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="0.01" value={form.price_usd} onChange={(e) => setForm((f) => ({ ...f, price_usd: e.target.value }))}
                  placeholder="e.g. 9.99" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}