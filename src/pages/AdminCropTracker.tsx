import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Card, LoadingSpinner } from "../components/common";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Farmer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface CropEntry {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_email: string;
  farmer_phone: string;
  crop_category: string;
  quantity: string | null;
  unit: string | null;
  harvest_date: string | null;
  notes: string | null;
  status: "upcoming" | "harvesting" | "harvested" | "cancelled";
  created_at: string;
  updated_at: string;
}

const UNITS   = ["kg", "crates", "bags", "tonnes", "boxes", "bunches", "litres", "units"];
const STATUSES: { value: CropEntry["status"]; label: string; color: string }[] = [
  { value: "upcoming",   label: "Upcoming",   color: "bg-blue-100 text-blue-800"   },
  { value: "harvesting", label: "Harvesting", color: "bg-yellow-100 text-yellow-800" },
  { value: "harvested",  label: "Harvested",  color: "bg-green-100 text-green-800"  },
  { value: "cancelled",  label: "Cancelled",  color: "bg-red-100 text-red-800"    },
];

const STATUS_COLOR: Record<string, string> = {
  upcoming:   "bg-blue-100 text-blue-800",
  harvesting: "bg-yellow-100 text-yellow-800",
  harvested:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
};

function isHarvestingSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const days = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return days >= 0 && days <= 7;
}

function isOverdue(dateStr: string | null, status: string): boolean {
  if (!dateStr || status === "harvested" || status === "cancelled") return false;
  return new Date(dateStr) < new Date();
}

// ── Empty form ────────────────────────────────────────────────────────────────

const emptyForm = {
  farmer_id:     "",
  crop_category: "",
  quantity:      "",
  unit:          "",
  harvest_date:  "",
  notes:         "",
  status:        "upcoming" as CropEntry["status"],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminCropTracker() {
  const [entries,    setEntries]    = useState<CropEntry[]>([]);
  const [farmers,    setFarmers]    = useState<Farmer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [feedback,   setFeedback]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [filters, setFilters] = useState({ category: "", farmer_id: "", status: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [farmerSearch, setFarmerSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────────

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
    } catch (err) {
      console.error("Failed to load crop tracker entries:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  const loadFarmers = useCallback(async () => {
    try {
      const res = await api.get("/admin/crop-tracker/farmers", {
        params: farmerSearch ? { search: farmerSearch } : {},
      });
      if (res.data.success) setFarmers(res.data.data.farmers);
    } catch (err) {
      console.error("Failed to load farmers:", err);
    }
  }, [farmerSearch]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get("/admin/crop-tracker/categories");
      if (res.data.success) setCategories(res.data.data.categories);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { loadFarmers(); }, [loadFarmers]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── Feedback helper ─────────────────────────────────────────────────────────

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Open modal ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (entry: CropEntry) => {
    setEditingId(entry.id);
    setForm({
      farmer_id:     entry.farmer_id,
      crop_category: entry.crop_category,
      quantity:      entry.quantity ?? "",
      unit:          entry.unit ?? "",
      harvest_date:  entry.harvest_date ? entry.harvest_date.split("T")[0] : "",
      notes:         entry.notes ?? "",
      status:        entry.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farmer_id || !form.crop_category.trim()) {
      flash("error", "Farmer and crop category are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        farmer_id:     form.farmer_id,
        crop_category: form.crop_category.trim(),
        quantity:      form.quantity ? Number(form.quantity) : null,
        unit:          form.unit || null,
        harvest_date:  form.harvest_date || null,
        notes:         form.notes.trim() || null,
        status:        form.status,
      };

      if (editingId) {
        await api.put(`/admin/crop-tracker/${editingId}`, payload);
        flash("success", "Entry updated successfully.");
      } else {
        await api.post("/admin/crop-tracker", payload);
        flash("success", "Entry added successfully.");
      }

      closeModal();
      loadEntries();
      loadCategories();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/crop-tracker/${id}`);
      flash("success", "Entry deleted.");
      setDeleteConfirmId(null);
      loadEntries();
      loadCategories();
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to delete entry.");
    }
  };

  // ── Quick status update ─────────────────────────────────────────────────────

  const handleQuickStatus = async (id: string, status: CropEntry["status"]) => {
    try {
      await api.put(`/admin/crop-tracker/${id}`, { status });
      loadEntries();
    } catch (err) {
      flash("error", "Failed to update status.");
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const upcoming   = entries.filter((e) => e.status === "upcoming").length;
  const harvesting = entries.filter((e) => e.status === "harvesting").length;
  const soonCount  = entries.filter((e) => isHarvestingSoon(e.harvest_date) && e.status !== "harvested" && e.status !== "cancelled").length;

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
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Entry
          </button>
          <Link to="/admin" className="text-green-600 hover:text-green-700 font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm font-medium ${
          feedback.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
        </Card>
        <Card className="bg-yellow-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{upcoming + harvesting}</div>
            <div className="text-sm text-gray-600">Active Crops</div>
          </div>
        </Card>
        <Card className={soonCount > 0 ? "bg-orange-50" : "bg-gray-50"}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${soonCount > 0 ? "text-orange-600" : "text-gray-400"}`}>
              {soonCount}
            </div>
            <div className="text-sm text-gray-600">Harvesting ≤7 days</div>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(entries.map((e) => e.crop_category)).size}
            </div>
            <div className="text-sm text-gray-600">Crop Categories</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer</label>
            <select
              value={filters.farmer_id}
              onChange={(e) => setFilters((f) => ({ ...f, farmer_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="">All Farmers</option>
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>{f.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilters({ category: "", farmer_id: "", status: "" }); setPagination((p) => ({ ...p, page: 1 })); }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
            >
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
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => {
                  const soon    = isHarvestingSoon(entry.harvest_date);
                  const overdue = isOverdue(entry.harvest_date, entry.status);

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : soon ? "bg-orange-50" : ""}`}
                    >
                      {/* Farmer */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">{entry.farmer_name}</div>
                        <div className="text-xs text-gray-500">{entry.farmer_email}</div>
                      </td>

                      {/* Crop */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {entry.crop_category}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {entry.quantity
                          ? `${parseFloat(entry.quantity).toLocaleString()} ${entry.unit ?? ""}`
                          : <span className="text-gray-400">—</span>}
                      </td>

                      {/* Harvest Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {entry.harvest_date ? (
                          <div>
                            <div className={`text-sm font-medium ${overdue ? "text-red-600" : soon ? "text-orange-600" : "text-gray-900"}`}>
                              {new Date(entry.harvest_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                            {overdue && <div className="text-xs text-red-500">Overdue</div>}
                            {soon && !overdue && <div className="text-xs text-orange-500">≤7 days</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={entry.status}
                          onChange={(e) => handleQuickStatus(entry.id, e.target.value as CropEntry["status"])}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLOR[entry.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 max-w-xs">
                        {entry.notes ? (
                          <p className="text-sm text-gray-600 truncate" title={entry.notes}>{entry.notes}</p>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(entry)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {deleteConfirmId === entry.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:text-red-700 text-xs font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-500 hover:text-gray-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(entry.id)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              Delete
                            </button>
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 text-sm"
              >Previous</button>
              <span className="px-3 py-1 bg-green-600 text-white rounded text-sm">{pagination.page}</span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 text-sm"
              >Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Crop Entry" : "Add Crop Entry"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">

              {/* Farmer */}
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
                  <>
                    <input
                      type="text"
                      placeholder="Search farmer name..."
                      value={farmerSearch}
                      onChange={(e) => setFarmerSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select
                      value={form.farmer_id}
                      onChange={(e) => setForm((f) => ({ ...f, farmer_id: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select farmer...</option>
                      {farmers.map((f) => (
                        <option key={f.id} value={f.id}>{f.full_name} — {f.email}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Crop Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="category-suggestions"
                  value={form.crop_category}
                  onChange={(e) => setForm((f) => ({ ...f, crop_category: e.target.value }))}
                  placeholder="e.g. Tomatoes, Bananas, Maize..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select unit...</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => setForm((f) => ({ ...f, harvest_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Admin and farmer will be notified on this date
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CropEntry["status"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional notes, observations, or reminders..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
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