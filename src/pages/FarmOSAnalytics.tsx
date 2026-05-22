import { useState, useEffect } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { LoadingSpinner } from "../components/common";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  hasAccess: boolean;
  flash: (type: "success" | "error", msg: string) => void;
}

interface AnalyticsData {
  kpis: {
    totalRevenue6m: number;
    totalExpenses6m: number;
    netProfit6m: number;
    avgYieldAchievement: string;
  };
  charts: {
    revenueVsExpenses: any[];
    labourDistribution: any[];
    expenseCategories: any[];
    cropYieldComparison: any[];
    labourEfficiency: any[];
  };
}

interface PredictionData {
  seasonalOutlook: string;
  nextMonthActions: Array<{
    action: string;
    reasoning: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
  cropRecommendations: Array<{
    crop: string;
    recommendation: string;
    notes?: string;
    timing: string;
    expectedYieldPerHa?: string;
  }>;
  financialForecast?: {
    expectedRevenue: number;
    expectedExpenses: number;
    keyRisks: string[];
    opportunities: string[];
  };
  labourPlan?: {
    estimatedManDays: number;
    peakWeeks: string;
    keyTasks: string[];
  };
}

// Custom theme colors for charts
const THEME_COLORS = ["#2d6a4f", "#ff9f1c", "#118ab2", "#e63946", "#06d6a0", "#ffb703", "#52796f", "#8b5cf6"];

export default function FarmOSAnalytics({ hasAccess, flash }: Props) {
  const [analytics,        setAnalytics]        = useState<AnalyticsData | null>(null);
  const [loading,          setLoading]          = useState(false);
  const [predictions,      setPredictions]      = useState<PredictionData | null>(null);
  const [genPredictions,   setGenPredictions]   = useState(false);
  const [exportYear,       setExportYear]       = useState(new Date().getFullYear());
  const [exportMonth,      setExportMonth]      = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!hasAccess) return;
    const load = async () => {
      try {
        setLoading(true);
        const r = await api.get("/farm-os/analytics");
        if (r.data.success) setAnalytics(r.data.data);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };
    load();
  }, [hasAccess]);

  const handleExportCSV = async (type: string) => {
    try {
      const start = `${exportYear}-${String(exportMonth).padStart(2, "0")}-01`;
      const end = new Date(exportYear, exportMonth, 0).toISOString().split("T")[0];
      const r = await api.get(
        `/farm-os/export/csv?type=${type}&startDate=${start}&endDate=${end}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([r.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `farm-${type}-${start}-to-${end}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      flash("error", "Export failed");
    }
  };

  const handleExportReport = async () => {
    try {
      const r = await api.get(
        `/farm-os/export/report?year=${exportYear}&month=${exportMonth}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([r.data], { type: "text/html" }));
      window.open(url, "_blank");
    } catch {
      flash("error", "Report export failed");
    }
  };

  const handleGeneratePredictions = async () => {
    try {
      setGenPredictions(true);
      const r = await api.post("/farm-os/analytics/predict");
      if (r.data.success) {
        setPredictions(r.data.data.predictions);
        flash("success", "Seasonal predictions generated");
      }
    } catch (err: any) {
      flash("error", err.response?.data?.message ?? "Failed to generate predictions");
    } finally {
      setGenPredictions(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* ── HEADER & EXPORT CONTROLS ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
            <i className="fas fa-chart-line text-[#2d6a4f]"></i> Analytics & Forecasts
          </h2>
          <p className="text-[13px] text-[#52796f] mt-1">
            Performance trends, seasonal intelligence, and data exports
          </p>
        </div>
        <button
          onClick={handleGeneratePredictions}
          disabled={genPredictions}
          className="bg-[var(--farm-info)] text-white px-6 py-3 rounded-[60px] font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {genPredictions ? <><i className="fas fa-spinner fa-spin"></i> Analysing...</> : <><i className="fas fa-magic"></i> Seasonal Predictions</>}
        </button>
      </div>

      <div className="farm-glass-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[12px] font-bold text-[#52796f] uppercase tracking-wider mb-2">Export Month</label>
              <select value={exportMonth} onChange={(e) => setExportMonth(Number(e.target.value))} className="w-full sm:w-auto rounded-xl border border-[#dad7cd] bg-white px-4 py-2.5 text-sm font-medium text-[#081c15] focus:outline-none focus:border-[#2d6a4f]">
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#52796f] uppercase tracking-wider mb-2">Export Year</label>
              <select value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))} className="w-full sm:w-auto rounded-xl border border-[#dad7cd] bg-white px-4 py-2.5 text-sm font-medium text-[#081c15] focus:outline-none focus:border-[#2d6a4f]">
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["expenses", "revenue", "labour", "inventory", "crop-plans"].map((t) => (
              <button key={t} onClick={() => handleExportCSV(t)} className="bg-white/50 border border-[#dad7cd] text-[#2d6a4f] px-4 py-2.5 rounded-[60px] font-semibold text-[13px] hover:bg-white shadow-sm transition-all capitalize">
                <i className="fas fa-file-csv mr-1.5"></i> {t.replace("-", " ")}
              </button>
            ))}
            <button onClick={handleExportReport} className="bg-[var(--farm-primary)] text-white px-5 py-2.5 rounded-[60px] font-semibold text-[13px] hover:bg-[var(--farm-primary-light)] shadow-md transition-all">
              <i className="fas fa-file-pdf mr-1.5"></i> Monthly Report
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="farm-glass-card py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* ── ANALYTICS KPI & CHARTS ── */}
      {analytics && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Revenue (6mo)", value: `$${analytics.kpis.totalRevenue6m.toFixed(2)}`, icon: "fa-arrow-up", color: "text-[#06d6a0]", border: "border-[#06d6a0]" },
              { label: "Expenses (6mo)", value: `$${analytics.kpis.totalExpenses6m.toFixed(2)}`, icon: "fa-arrow-down", color: "text-[#e63946]", border: "border-[#e63946]" },
              { label: "Net Profit (6mo)", value: `${analytics.kpis.netProfit6m >= 0 ? "+" : ""}$${analytics.kpis.netProfit6m.toFixed(2)}`, icon: "fa-wallet", color: analytics.kpis.netProfit6m >= 0 ? "text-[#118ab2]" : "text-[#ff9f1c]", border: analytics.kpis.netProfit6m >= 0 ? "border-[#118ab2]" : "border-[#ff9f1c]" },
              { label: "Avg Yield Achievement", value: analytics.kpis.avgYieldAchievement, icon: "fa-seedling", color: "text-[#8b5cf6]", border: "border-[#8b5cf6]" },
            ].map((item) => (
              <div key={item.label} className={`farm-glass-card p-5 border-t-[4px] ${item.border} text-center relative overflow-hidden`}>
                <i className={`fas ${item.icon} ${item.color} opacity-10 text-5xl absolute -bottom-2 -right-2`}></i>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#52796f] mb-2">{item.label}</div>
                <div className={`text-[24px] font-extrabold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Revenue vs Expenses line chart */}
          {analytics.charts.revenueVsExpenses?.length > 0 && (
            <div className="farm-glass-card p-6 flex flex-col">
              <h3 className="font-bold text-[#081c15] mb-5 flex items-center gap-2"><i className="fas fa-chart-area text-[#2d6a4f]"></i> Revenue vs Expenses (6 Months)</h3>
              <div className="h-[300px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.charts.revenueVsExpenses} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dad7cd" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} tickFormatter={(v) => `$${v}`} dx={-10} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} formatter={(v: any) => `$${parseFloat(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    <Line type="monotone" dataKey="revenue" stroke="#06d6a0" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#e63946" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#118ab2" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, strokeWidth: 2}} name="Net Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 4-Chart Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Labour Distribution */}
            {analytics.charts.labourDistribution?.length > 0 && (
              <div className="farm-glass-card p-6 flex flex-col">
                <h3 className="font-bold text-[#081c15] mb-5 flex items-center gap-2"><i className="fas fa-chart-pie text-[#2d6a4f]"></i> Labour Distribution (90 days)</h3>
                <div className="h-[280px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.charts.labourDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} label={({ name, percent }) => `${(name as string).replace("_", " ")} ${((percent as number) * 100).toFixed(0)}%`} labelLine={false}>
                        {analytics.charts.labourDistribution.map((_, i: number) => (
                          <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `$${parseFloat(v).toFixed(2)}`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Expense Categories */}
            {analytics.charts.expenseCategories?.length > 0 && (
              <div className="farm-glass-card p-6 flex flex-col">
                <h3 className="font-bold text-[#081c15] mb-5 flex items-center gap-2"><i className="fas fa-chart-bar text-[#e63946]"></i> Top Expenses (6 months)</h3>
                <div className="h-[280px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.expenseCategories} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dad7cd" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{fill: '#52796f', fontSize: 11}} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#081c15', fontSize: 11, fontWeight: 'bold'}} width={90} tickFormatter={(v) => (v as string).replace("_", " ")} />
                      <Tooltip formatter={(v: any) => `$${parseFloat(v).toFixed(2)}`} cursor={{fill: 'rgba(230, 57, 70, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="value" fill="#e63946" name="Amount" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Crop Yield Comparison */}
            {analytics.charts.cropYieldComparison?.length > 0 && (
              <div className="farm-glass-card p-6 flex flex-col">
                <h3 className="font-bold text-[#081c15] mb-5 flex items-center gap-2"><i className="fas fa-seedling text-[#2d6a4f]"></i> Expected vs Actual Yield (kg)</h3>
                <div className="h-[280px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.cropYieldComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dad7cd" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} tickFormatter={(v) => `${v}kg`} dx={-10} />
                      <Tooltip formatter={(v: any) => `${parseFloat(v).toFixed(0)} kg`} cursor={{fill: 'rgba(45, 106, 79, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Legend wrapperStyle={{paddingTop: '20px'}} />
                      <Bar dataKey="expected" fill="#e8f5e9" stroke="#2d6a4f" strokeWidth={1} name="Expected" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#2d6a4f" name="Actual" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Labour Efficiency */}
            {analytics.charts.labourEfficiency?.length > 0 && (
              <div className="farm-glass-card p-6 flex flex-col">
                <h3 className="font-bold text-[#081c15] mb-5 flex items-center gap-2"><i className="fas fa-users-cog text-[#118ab2]"></i> Labour Cost per Hectare</h3>
                <div className="h-[280px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.labourEfficiency}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dad7cd" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#52796f', fontSize: 12}} tickFormatter={(v) => `$${v}`} dx={-10} />
                      <Tooltip formatter={(v: any, n?: string | number) => n === "cost_per_ha" ? `$${parseFloat(v).toFixed(2)}/ha` : `${v}`} cursor={{fill: 'rgba(17, 138, 178, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="cost_per_ha" fill="#118ab2" name="Cost/ha" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* ── SEASONAL PREDICTIONS ── */}
      {genPredictions && (
        <div className="farm-glass-card p-6 border-l-[5px] border-[var(--farm-info)] flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#e0f7fa] flex items-center justify-center">
            <i className="fas fa-cog fa-spin text-2xl text-[#118ab2]"></i>
          </div>
          <div>
            <h3 className="font-bold text-[#081c15] text-[16px]">Analysing 12 months of farm data...</h3>
            <p className="text-[#52796f] text-sm mt-1">Generating AI-driven seasonal forecasts. This takes about 15 seconds.</p>
          </div>
        </div>
      )}

      {predictions && !genPredictions && (
        <div className="space-y-6 pt-4 border-t border-black/10">
          <h3 className="text-2xl font-bold text-[#081c15] flex items-center gap-3">
            <i className="fas fa-magic text-[#118ab2]"></i> Seasonal Intelligence
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Outlook & Financial Forecast (Left Column) */}
            <div className="space-y-6">
              <div className="farm-glass-card p-6 border-l-[5px] border-[#06d6a0]">
                <h4 className="font-bold text-[#081c15] mb-3 flex items-center gap-2"><i className="fas fa-cloud-sun text-[#06d6a0]"></i> Seasonal Outlook</h4>
                <p className="text-[14px] text-[#2d3e40] leading-relaxed bg-[#e8f5e9]/50 p-4 rounded-xl border border-[#c8e6c9]">
                  {predictions.seasonalOutlook}
                </p>
              </div>

              {predictions.financialForecast && (
                <div className="farm-glass-card p-6">
                  <h4 className="font-bold text-[#081c15] mb-4 flex items-center gap-2"><i className="fas fa-wallet text-[#ffb703]"></i> Financial Forecast</h4>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] border border-[#2d6a4f]/20 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-[#2d6a4f]">${(predictions.financialForecast.expectedRevenue ?? 0).toFixed(2)}</div>
                      <div className="text-[11px] font-bold text-[#2d6a4f] uppercase tracking-wider mt-1">Est. Revenue</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#ffebee] to-[#ffcdd2] border border-[#e63946]/20 rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold text-[#e63946]">${(predictions.financialForecast.expectedExpenses ?? 0).toFixed(2)}</div>
                      <div className="text-[11px] font-bold text-[#e63946] uppercase tracking-wider mt-1">Est. Expenses</div>
                    </div>
                  </div>
                  
                  {predictions.financialForecast.keyRisks?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[11px] font-bold text-[#e63946] uppercase tracking-wider mb-2 flex items-center gap-1"><i className="fas fa-exclamation-triangle"></i> Key Risks</div>
                      <ul className="space-y-1">
                        {predictions.financialForecast.keyRisks.map((r: string, i: number) => (
                          <li key={i} className="text-[13px] text-[#2d3e40] flex items-start gap-2">
                            <span className="text-[#e63946] mt-0.5">•</span> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {predictions.financialForecast.opportunities?.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-[#06d6a0] uppercase tracking-wider mb-2 flex items-center gap-1"><i className="fas fa-check-circle"></i> Opportunities</div>
                      <ul className="space-y-1">
                        {predictions.financialForecast.opportunities.map((o: string, i: number) => (
                          <li key={i} className="text-[13px] text-[#2d3e40] flex items-start gap-2">
                            <span className="text-[#06d6a0] mt-0.5">•</span> <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions & Labour (Middle Column) */}
            <div className="space-y-6">
              {predictions.nextMonthActions?.length > 0 && (
                <div className="farm-glass-card p-6">
                  <h4 className="font-bold text-[#081c15] mb-4 flex items-center gap-2"><i className="fas fa-clipboard-list text-[#ff9f1c]"></i> Next Month Priorities</h4>
                  <div className="space-y-3">
                    {predictions.nextMonthActions.map((a: any, i: number) => {
                      const isHigh = a.priority === "high";
                      const isMedium = a.priority === "medium";
                      
                      return (
                        <div key={i} className={`p-4 rounded-xl border transition-colors ${
                          isHigh ? "bg-[#ffebee]/50 border-[#ffcdd2]" : 
                          isMedium ? "bg-[#fff3e0]/50 border-[#ffe0b2]" : 
                          "bg-[#f8f9fa] border-[#dad7cd]"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              isHigh ? "bg-[#e63946] text-white" : 
                              isMedium ? "bg-[#ff9f1c] text-white" : 
                              "bg-[#dad7cd] text-[#2d3e40]"
                            }`}>
                              {a.priority}
                            </span>
                            <span className="text-[10px] font-bold text-[#52796f] uppercase tracking-wider ml-auto">{a.category}</span>
                          </div>
                          <div className="text-[14px] font-bold text-[#081c15] mb-1">{a.action}</div>
                          <div className="text-[12px] text-[#52796f]">{a.reasoning}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {predictions.labourPlan && (
                <div className="farm-glass-card p-6">
                  <h4 className="font-bold text-[#081c15] mb-4 flex items-center gap-2"><i className="fas fa-users-cog text-[#118ab2]"></i> Labour Plan</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#e0f7fa] rounded-xl p-3 text-center border border-[#b2ebf2]">
                      <div className="text-xl font-extrabold text-[#118ab2]">{predictions.labourPlan.estimatedManDays}</div>
                      <div className="text-[11px] font-bold text-[#118ab2] uppercase tracking-wider mt-1">Est. Man-Days</div>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#dad7cd] flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-[#52796f] uppercase tracking-wider mb-1">Peak Period</div>
                      <div className="text-[13px] font-bold text-[#081c15]">{predictions.labourPlan.peakWeeks}</div>
                    </div>
                  </div>
                  {predictions.labourPlan.keyTasks?.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-[#52796f] uppercase tracking-wider mb-2">Key Tasks</div>
                      <div className="flex flex-wrap gap-2">
                        {predictions.labourPlan.keyTasks.map((t: string, i: number) => (
                          <span key={i} className="bg-white border border-[#dad7cd] text-[#2d3e40] text-[12px] px-3 py-1 rounded-full shadow-sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Crop Recommendations (Right Column) */}
            {predictions.cropRecommendations?.length > 0 && (
              <div className="farm-glass-card p-6">
                <h4 className="font-bold text-[#081c15] mb-4 flex items-center gap-2"><i className="fas fa-seedling text-[#2d6a4f]"></i> Crop Recommendations</h4>
                <div className="space-y-3">
                  {predictions.cropRecommendations.map((c: any, i: number) => (
                    <div key={i} className="bg-gradient-to-br from-white to-[#f8f9fa] border border-[#dad7cd] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[16px] text-[#081c15]">{c.crop}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          c.recommendation === "plant" ? "bg-[#e8f5e9] text-[#2d6a4f]" :
                          c.recommendation === "harvest_soon" ? "bg-[#fff3e0] text-[#ff9f1c]" :
                          c.recommendation === "fertilise" ? "bg-[#e0f7fa] text-[#118ab2]" :
                          "bg-[#ffebee] text-[#e63946]"
                        }`}>
                          {c.recommendation?.replace("_", " ")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <i className="far fa-calendar text-[#52796f]"></i>
                        <span className="text-[13px] font-bold text-[#2d6a4f]">{c.timing}</span>
                      </div>
                      
                      {c.notes && <p className="text-[12px] text-[#52796f] leading-relaxed mb-3">{c.notes}</p>}
                      
                      {c.expectedYieldPerHa && (
                        <div className="pt-3 border-t border-black/5 text-right">
                          <span className="text-[11px] font-bold text-[#52796f] uppercase tracking-wider mr-2">Exp. Yield:</span>
                          <span className="text-[14px] font-bold text-[#06d6a0] bg-[#06d6a0]/10 px-2 py-0.5 rounded-md">{c.expectedYieldPerHa}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}