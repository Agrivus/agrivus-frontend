import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Farmer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  type: "registered" | "unregistered";
}

interface CropEntry {
  id: string;
  farmer_id: string | null;
  unregistered_farmer_id: string | null;
  farmer_name: string;
  farmer_email: string | null;
  farmer_phone: string | null;
  crop_category: string;
  quantity: string | null;
  unit: string | null;
  harvest_date: string | null;
  notes: string | null;
  status: "upcoming" | "harvesting" | "harvested" | "cancelled";
  is_registered: boolean;
  pending_claims: number;
  created_at: string;
}

interface Claim {
  id: string;
  unregistered_name: string;
  unregistered_phone: string | null;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  matched_by: string;
  tracker_entries: number;
  created_at: string;
}

const UNITS = ["kg", "crates", "bags", "tonnes", "boxes", "bunches", "litres", "units"];
const STATUSES = [
  { value: "upcoming",   label: "Upcoming",   color: "bg-blue-100 text-blue-800"    },
  { value: "harvesting", label: "Harvesting", color: "bg-yellow-100 text-yellow-800" },
  { value: "harvested",  label: "Harvested",  color: "bg-green-100 text-green-800"   },
  { value: "cancelled",  label: "Cancelled",  color: "bg-red-100 text-red-800"       },
] as const;

const STATUS_COLOR: Record<string, string> = {
  upcoming:   "bg-blue-100 text-blue-800",
  harvesting: "bg-yellow-100 text-yellow-800",
  harvested:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
};

function isHarvestingSoon(d: string | null) {
  if (!d) return false;
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return days >= 0 && days <= 7;
}
function isOverdue(d: string | null, status: string) {
  if (!d || status === "harvested" || status === "cancelled") return false;
  return new Date(d) < new Date();
}

const emptyForm = {
  farmer_id:              "",
  unregistered_farmer_id: "",
  farmer_type:            "registered" as "registered" | "unregistered",
  crop_category:          "",
  quantity:               "",
  unit:                   "",
  harvest_date:           "",
  notes:                  "",
  status:                 "upcoming" as CropEntry["status"],
};

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCropTracker() {
  const [entries,     setEntries]     = useState<CropEntry[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [claims,      setClaims]      = useState<Claim[]>([]);
  const [claimsCount, setClaimsCount] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState<"tracker" | "claims">("tracker");
  const [feedback,    setFeedback]    = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [filters,    setFilters]    = useState({ category: "", farmer_id: "", status: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Farmer search state
  const [farmerSearch,       setFarmerSearch]       = useState("");
  const [farmerResults,      setFarmerResults]      = useState<{ registered: Farmer[]; unregistered: Farmer[]; noMatches: boolean; searchTerm: string }>({ registered: [], unregistered: [], noMatches: false, searchTerm: "" });
  const [farmerSearching,    setFarmerSearching]    = useState(false);
  const [showAddUnregistered, setShowAddUnregistered] = useState(false);
  const [newUnregForm,       setNewUnregForm]       = useState({ full_name: "", phone: "", notes: "" });

  // Modal
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [form,            setForm]            = useState({ ...emptyForm });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Load data ───────────────────────────────────────────────────────────────

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (filters.category)  params.category  = filters.category;
      if (filters.farmer_id) params.farmer_id = filters.farmer_id;
      if (filters.status)    params.status    = filters.status;
      const res = await api.get("/admin/crop-tracker", { params });
      if (res.data.success) {
        setEntries(res.data.data.entries);
        setPagination((p) => ({ ...p, ...res.data.data.pagination }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [pagination.page, filters]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get("/admin/crop-tracker/categories");
      if (res.data.success) setCategories(res.data.data.categories);
    } catch (err) { console.error(err); }
  }, []);

  const loadClaims = useCallback(async () => {
    try {
      const res = await api.get("/admin/crop-tracker/claims");
      if (res.data.success) {
        setClaims(res.data.data.claims);
        setClaimsCount(res.data.data.pagination.total);
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadEntries(); },    [loadEntries]);
  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadClaims(); },     [loadClaims]);

  // ── Farmer search with debounce ─────────────────────────────────────────────

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(async () => {
      if (farmerSearch.length < 2) {
        setFarmerResults({ registered: [], unregistered: [], noMatches: false, searchTerm: "" });
        setShowAddUnregistered(false);
        return;
      }
      try {
        setFarmerSearching(true);
        const res = await api.get("/admin/crop-tracker/farmers", { params: { search: farmerSearch } });
        if (res.data.success) {
          setFarmerResults(res.data.data);
          setShowAddUnregistered(res.data.data.noMatches);
        }
      } catch (err) { console.error(err); }
      finally { setFarmerSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [farmerSearch, modalOpen]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const selectFarmer = (farmer: Farmer) => {
    if (farmer.type === "registered") {
      setForm((f) => ({ ...f, farmer_id: farmer.id, unregistered_farmer_id: "", farmer_type: "registered" }));
    } else {
      setForm((f) => ({ ...f, farmer_id: "", unregistered_farmer_id: farmer.id, farmer_type: "unregistered" }));
    }
    setFarmerSearch(farmer.full_name);
    setFarmerResults({ registered: [], unregistered: [], noMatches: false, searchTerm: "" });
    setShowAddUnregistered(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFarmerSearch("");
    setFarmerResults({ registered: [], unregistered: [], noMatches: false, searchTerm: "" });
    setShowAddUnregistered(false);
    setNewUnregForm({ full_name: "", phone: "", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (entry: CropEntry) => {
    setEditingId(entry.id);
    setForm({
      farmer_id:              entry.farmer_id ?? "",
      unregistered_farmer_id: entry.unregistered_farmer_id ?? "",
      farmer_type:            entry.is_registered ? "registered" : "unregistered",
      crop_category:          entry.crop_category,
      quantity:               entry.quantity ?? "",
      unit:                   entry.unit ?? "",
      harvest_date:           entry.harvest_date ? entry.harvest_date.split("T")[0] : "",
      notes:                  entry.notes ?? "",
      status:                 entry.status,
    });
    setFarmerSearch(entry.farmer_name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFarmerSearch("");
    setShowAddUnregistered(false);
  };

  // ── Create unregistered farmer then auto-select ─────────────────────────────

  const handleCreateUnregistered = async () => {
    if (!newUnregForm.full_name.trim()) {
      flash("error", "Name is required");
      return;
    }
    try {
      setSaving(true);
      const res = await api.post("/admin/crop-tracker/unregistered-farmers", newUnregForm);
      if (res.data.success) {
        const farmer = res.data.data.farmer;
        selectFarmer({ id: farmer.id, full_name: farmer.full_name, email: null, phone: farmer.phone, type: "unregistered" });
        setShowAddUnregistered(false);
        setNewUnregForm({ full_name: "", phone: "", notes: "" });
        flash("success", `Unregistered farmer "${farmer.full_name}" added`);
      }
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to create farmer");
    } finally {
      setSaving(false);
    }
  };

  // ── Save entry ──────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop_category.trim()) { flash("error", "Crop category is required"); return; }
    if (!form.farmer_id && !form.unregistered_farmer_id) { flash("error", "Please select a farmer"); return; }

    try {
      setSaving(true);
      const payload = {
        farmer_id:              form.farmer_id || null,
        unregistered_farmer_id: form.unregistered_farmer_id || null,
        crop_category:          form.crop_category.trim(),
        quantity:               form.quantity ? Number(form.quantity) : null,
        unit:                   form.unit || null,
        harvest_date:           form.harvest_date || null,
        notes:                  form.notes.trim() || null,
        status:                 form.status,
      };

      if (editingId) {
        await api.put(`/admin/crop-tracker/${editingId}`, payload);
        flash("success", "Entry updated");
      } else {
        await api.post("/admin/crop-tracker", payload);
        flash("success", "Entry added");
      }

      closeModal();
      loadEntries();
      loadCategories();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/crop-tracker/${id}`);
      flash("success", "Entry deleted");
      setDeleteConfirmId(null);
      loadEntries();
      loadCategories();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to delete");
    }
  };

  const handleQuickStatus = async (id: string, status: CropEntry["status"]) => {
    try {
      await api.put(`/admin/crop-tracker/${id}`, { status });
      loadEntries();
    } catch { flash("error", "Failed to update status"); }
  };

  // ── Claims ──────────────────────────────────────────────────────────────────

  const handleApproveClaim = async (claimId: string) => {
    try {
      await api.post(`/admin/crop-tracker/claims/${claimId}/approve`);
      flash("success", "Claim approved — tracker entries transferred");
      loadClaims();
      loadEntries();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to approve claim");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const reason = prompt("Rejection reason (optional):");
    try {
      await api.post(`/admin/crop-tracker/claims/${claimId}/reject`, { reason });
      flash("success", "Claim rejected");
      loadClaims();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to reject claim");
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const soonCount = entries.filter((e) => isHarvestingSoon(e.harvest_date) && e.status !== "harvested" && e.status !== "cancelled").length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌾 Crop Tracker</h1>
          <p className="text-gray-600">Track farmer harvests and crop schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            + Add Entry
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
        <Card className="bg-blue-50"><div className="text-center"><div className="text-2xl font-bold text-blue-600">{pagination.total}</div><div className="text-sm text-gray-600">Total Entries</div></div></Card>
        <Card className="bg-yellow-50"><div className="text-center"><div className="text-2xl font-bold text-yellow-600">{entries.filter((e) => e.status === "upcoming" || e.status === "harvesting").length}</div><div className="text-sm text-gray-600">Active Crops</div></div></Card>
        <Card className={soonCount > 0 ? "bg-orange-50" : "bg-gray-50"}><div className="text-center"><div className={`text-2xl font-bold ${soonCount > 0 ? "text-orange-600" : "text-gray-400"}`}>{soonCount}</div><div className="text-sm text-gray-600">Harvest ≤7 days</div></div></Card>
        <Card className={claimsCount > 0 ? "bg-purple-50" : "bg-gray-50"} onClick={() => setActiveTab("claims")}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${claimsCount > 0 ? "text-purple-600" : "text-gray-400"}`}>{claimsCount}</div>
            <div className="text-sm text-gray-600">Pending Claims {claimsCount > 0 && "⚠️"}</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: "tracker", label: "Crop Tracker" },
          { key: "claims",  label: `Profile Claims${claimsCount > 0 ? ` (${claimsCount})` : ""}` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TRACKER TAB ── */}
      {activeTab === "tracker" && (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Category</label>
                <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex items-end">
                <button onClick={() => { setFilters({ category: "", farmer_id: "", status: "" }); setPagination((p) => ({ ...p, page: 1 })); }}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors">
                  Clear Filters
                </button>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card>
            {loading ? (
              <div className="py-16 flex justify-center"><LoadingSpinner /></div>
            ) : entries.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <div className="text-5xl mb-4">🌱</div>
                <p className="font-medium">No crop entries yet</p>
                <p className="text-sm mt-1">Click "+ Add Entry" to start tracking</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Farmer", "Crop", "Quantity", "Harvest Date", "Status", "Notes", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry) => {
                      const soon    = isHarvestingSoon(entry.harvest_date);
                      const overdue = isOverdue(entry.harvest_date, entry.status);
                      return (
                        <tr key={entry.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : soon ? "bg-orange-50" : ""}`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                              {entry.farmer_name}
                              {!entry.is_registered && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">unregistered</span>
                              )}
                              {entry.pending_claims > 0 && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded cursor-pointer" onClick={() => setActiveTab("claims")}>
                                  {entry.pending_claims} claim
                                </span>
                              )}
                            </div>
                            {entry.farmer_phone && <div className="text-xs text-gray-500">{entry.farmer_phone}</div>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{entry.crop_category}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {entry.quantity ? `${parseFloat(entry.quantity).toLocaleString()} ${entry.unit ?? ""}` : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {entry.harvest_date ? (
                              <div>
                                <div className={`text-sm font-medium ${overdue ? "text-red-600" : soon ? "text-orange-600" : "text-gray-900"}`}>
                                  {new Date(entry.harvest_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                                {overdue && <div className="text-xs text-red-500">Overdue</div>}
                                {soon && !overdue && <div className="text-xs text-orange-500">≤7 days</div>}
                              </div>
                            ) : <span className="text-gray-400 text-sm">Not set</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select value={entry.status} onChange={(e) => handleQuickStatus(entry.id, e.target.value as CropEntry["status"])}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLOR[entry.status]}`}>
                              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            {entry.notes ? <p className="text-sm text-gray-600 truncate" title={entry.notes}>{entry.notes}</p> : <span className="text-gray-400 text-sm">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEdit(entry)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                              {deleteConfirmId === entry.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-700 text-xs font-medium">Confirm</button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="text-gray-500 text-xs">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirmId(entry.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">{(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</div>
                <div className="flex gap-2">
                  <button onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 text-sm">Previous</button>
                  <span className="px-3 py-1 bg-green-600 text-white rounded text-sm">{pagination.page}</span>
                  <button onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 text-sm">Next</button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── CLAIMS TAB ── */}
      {activeTab === "claims" && (
        <Card>
          {claims.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-medium">No pending claims</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {claims.map((claim) => (
                <div key={claim.id} className="border border-purple-200 bg-purple-50 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{claim.user_name}</span>
                        <span className="text-xs text-gray-500">wants to claim profile of</span>
                        <span className="text-sm font-bold text-purple-700">{claim.unregistered_name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Registered user</p>
                          <p className="font-medium">{claim.user_email}</p>
                          {claim.user_phone && <p className="text-gray-600">{claim.user_phone}</p>}
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Unregistered profile</p>
                          <p className="font-medium">{claim.unregistered_name}</p>
                          {claim.unregistered_phone && <p className="text-gray-600">{claim.unregistered_phone}</p>}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        <span>Matched by: <strong>{claim.matched_by}</strong></span>
                        <span>•</span>
                        <span>{claim.tracker_entries} crop entries will transfer</span>
                        <span>•</span>
                        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleApproveClaim(claim.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        ✓ Approve
                      </button>
                      <button onClick={() => handleRejectClaim(claim.id)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Crop Entry" : "Add Crop Entry"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">

              {/* Farmer search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farmer <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                    {entries.find((e) => e.id === editingId)?.farmer_name ?? "—"}
                    <span className="text-gray-400 ml-1">(cannot change)</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={farmerSearch}
                      onChange={(e) => { setFarmerSearch(e.target.value); setForm((f) => ({ ...f, farmer_id: "", unregistered_farmer_id: "" })); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    {/* Search results dropdown */}
                    {(farmerResults.registered.length > 0 || farmerResults.unregistered.length > 0 || farmerResults.noMatches) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">

                        {farmerResults.registered.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-50">Registered Farmers</div>
                            {farmerResults.registered.map((f) => (
                              <button key={f.id} type="button" onClick={() => selectFarmer(f)}
                                className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm border-b border-gray-100 last:border-0">
                                <span className="font-medium">{f.full_name}</span>
                                {f.phone && <span className="text-gray-500 ml-2">{f.phone}</span>}
                              </button>
                            ))}
                          </>
                        )}

                        {farmerResults.unregistered.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-50">Unregistered Farmers</div>
                            {farmerResults.unregistered.map((f) => (
                              <button key={f.id} type="button" onClick={() => selectFarmer(f)}
                                className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm border-b border-gray-100 last:border-0">
                                <span className="font-medium">{f.full_name}</span>
                                {f.phone && <span className="text-gray-500 ml-2">{f.phone}</span>}
                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 rounded">unregistered</span>
                              </button>
                            ))}
                          </>
                        )}

                        {farmerResults.noMatches && (
                          <div className="px-3 py-3">
                            <p className="text-sm text-gray-500 mb-2">No farmers found for "{farmerResults.searchTerm}"</p>
                            <button type="button" onClick={() => { setShowAddUnregistered(true); setNewUnregForm((f) => ({ ...f, full_name: farmerResults.searchTerm })); setFarmerResults({ registered: [], unregistered: [], noMatches: false, searchTerm: "" }); }}
                              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                              + Track as unregistered farmer
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {farmerSearching && <div className="absolute right-3 top-2.5 text-gray-400 text-xs">searching...</div>}
                  </div>
                )}

                {/* Selected farmer badge */}
                {!editingId && (form.farmer_id || form.unregistered_farmer_id) && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${form.farmer_type === "registered" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                      ✓ {form.farmer_type === "registered" ? "Registered" : "Unregistered"} farmer selected
                    </span>
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, farmer_id: "", unregistered_farmer_id: "" })); setFarmerSearch(""); }} className="text-xs text-gray-400 hover:text-gray-600">clear</button>
                  </div>
                )}
              </div>

              {/* Add unregistered farmer inline form */}
              {showAddUnregistered && (
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-purple-800">Track unregistered farmer</p>
                  <input type="text" placeholder="Full name *" value={newUnregForm.full_name}
                    onChange={(e) => setNewUnregForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                  <input type="tel" placeholder="Phone number (optional)" value={newUnregForm.phone}
                    onChange={(e) => setNewUnregForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                  <textarea placeholder="Notes (optional)" value={newUnregForm.notes} rows={2}
                    onChange={(e) => setNewUnregForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAddUnregistered(false)} className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
                    <button type="button" onClick={handleCreateUnregistered} disabled={saving} className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      {saving ? "Adding..." : "Add & Select"}
                    </button>
                  </div>
                </div>
              )}

              {/* Crop Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Category <span className="text-red-500">*</span></label>
                <input type="text" list="category-suggestions" value={form.crop_category}
                  onChange={(e) => setForm((f) => ({ ...f, crop_category: e.target.value }))}
                  placeholder="e.g. Tomatoes, Bananas, Maize..."
                  required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                <datalist id="category-suggestions">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" min="0" step="0.01" value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="e.g. 50" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                    <option value="">Select unit...</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
                <input type="date" value={form.harvest_date} onChange={(e) => setForm((f) => ({ ...f, harvest_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                <p className="text-xs text-gray-400 mt-1">Admin and farmer will be notified on this date</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CropEntry["status"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Any additional notes, observations, or reminders..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}