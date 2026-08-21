import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import HostelSelect from "./HostelSelect.jsx";
import SkipTrendChart from "./SkipTrendChart.jsx";
import ComplaintCategoryChart from "./ComplaintCategoryChart.jsx";
import GroceryForecastPanel from "./GroceryForecastPanel.jsx";
import ComplaintsList from "./ComplaintsList.jsx";

export default function AdminDashboard() {
  const [hostelId, setHostelId] = useState(null);
  const [skipSummary, setSkipSummary] = useState(null);
  const [complaintSummary, setComplaintSummary] = useState(null);

  useEffect(() => {
    if (!hostelId) return;
    api.getSkipSummary(hostelId, 14).then(setSkipSummary);
    api.getComplaintSummary(hostelId, 30).then(setComplaintSummary);
  }, [hostelId]);

  const totalSkipsToday = skipSummary
    ? Object.values(skipSummary.series).reduce((sum, arr) => sum + (arr[arr.length - 1] || 0), 0)
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-steel-500 mb-1">Admin dashboard</p>
          <h1 className="font-display text-4xl text-steel-100">Waste & Demand Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/menu"
            className="focus-ring text-sm text-mango-400 hover:text-mango-300 font-medium whitespace-nowrap"
          >
            Manage today's menu →
          </Link>
          <HostelSelect value={hostelId} onChange={setHostelId} />
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <SummaryStat
          label="Skips today (all meals)"
          value={totalSkipsToday ?? "—"}
          tone="chili"
        />
        <SummaryStat
          label="Avg. rating (30d)"
          value={complaintSummary?.averageRating ?? "—"}
          tone="mango"
        />
        <SummaryStat
          label="Open complaints"
          value={complaintSummary?.totalComplaints ?? "—"}
          tone="coriander"
        />
      </section>

      <section className="rounded-2xl border border-steel-800 bg-steel-900 p-5">
        <h3 className="font-display text-xl tracking-wide text-steel-100 mb-1">
          Meal-skip pattern — last 14 days
        </h3>
        <p className="text-xs text-steel-500 mb-4">
          Powers the grocery predictor below by revealing attendance trends per meal.
        </p>
        {skipSummary ? (
          <SkipTrendChart labels={skipSummary.labels} series={skipSummary.series} />
        ) : (
          <p className="text-sm text-steel-500">Select a hostel to load the chart.</p>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <GroceryForecastPanel hostelId={hostelId} />

        <div className="rounded-2xl border border-steel-800 bg-steel-900 p-5">
          <h3 className="font-display text-xl tracking-wide text-steel-100 mb-1">
            Complaints by category (30d)
          </h3>
          <p className="text-xs text-steel-500 mb-4">Where the operational hassle is concentrated.</p>
          <ComplaintCategoryChart byCategory={complaintSummary?.byCategory} />
        </div>
      </section>

      <section>
        <ComplaintsList hostelId={hostelId} />
      </section>
    </div>
  );
}

function SummaryStat({ label, value, tone }) {
  const toneClass = { mango: "text-mango-400", coriander: "text-coriander-400", chili: "text-chili-500" }[tone];
  return (
    <div className="rounded-2xl border border-steel-800 bg-steel-900 px-5 py-4">
      <p className="text-[11px] uppercase tracking-wider text-steel-500 mb-1">{label}</p>
      <p className={`font-display text-3xl ${toneClass}`}>{value}</p>
    </div>
  );
}
