import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUS_STYLES = {
  open: "bg-chili-600/20 text-chili-500",
  in_review: "bg-mango-500/20 text-mango-400",
  resolved: "bg-coriander-600/20 text-coriander-400",
};

export default function ComplaintsList({ hostelId }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    if (!hostelId) return;
    api.listComplaints({ hostelId, ...(filter ? { status: filter } : {}) }).then(setComplaints);
  }

  useEffect(load, [hostelId, filter]);

  async function updateStatus(id, status) {
    await api.updateComplaintStatus(id, status);
    load();
  }

  return (
    <div className="rounded-2xl border border-steel-800 bg-steel-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-xl tracking-wide text-steel-100">Recent feedback</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {complaints.length === 0 && (
          <p className="text-sm text-steel-500">No feedback matches this filter.</p>
        )}
        {complaints.map((c) => (
          <div key={c.id} className="rounded-xl bg-steel-800/60 p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-steel-400">
                <span className="uppercase tracking-wide font-medium text-steel-200">
                  {c.mealType}
                </span>
                <span>·</span>
                <span>{c.category}</span>
                <span>·</span>
                <span>{c.date}</span>
              </div>
              <span className="text-mango-400 text-sm font-semibold">{"★".repeat(c.rating)}</span>
            </div>
            {c.comment && <p className="text-sm text-steel-300">{c.comment}</p>}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                {c.status.replace("_", " ")}
              </span>
              <div className="ml-auto flex gap-1">
                {["open", "in_review", "resolved"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(c.id, s)}
                    disabled={c.status === s}
                    className="focus-ring text-[11px] px-2 py-1 rounded-lg bg-steel-700 text-steel-300 hover:bg-steel-600 disabled:opacity-30"
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
