import { useState } from "react";
import { api } from "../api.js";

const CATEGORIES = ["quality", "quantity", "hygiene", "taste", "service", "other"];
const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

export default function ComplaintForm({ hostelId, studentId, date }) {
  const [mealType, setMealType] = useState("lunch");
  const [rating, setRating] = useState(3);
  const [category, setCategory] = useState("quality");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done | error

  async function submit(e) {
    e.preventDefault();
    if (!studentId || !hostelId) return;
    setStatus("saving");
    try {
      await api.createComplaint({
        studentId,
        hostelId,
        date,
        mealType,
        rating,
        category,
        comment,
      });
      setStatus("done");
      setComment("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-steel-800 bg-steel-900 p-5 flex flex-col gap-4">
      <h3 className="font-display text-xl tracking-wide text-steel-100">Leave feedback</h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-steel-400">
          Meal
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100"
          >
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-steel-400">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-steel-400">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`focus-ring w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                n <= rating ? "bg-mango-500 text-steel-950" : "bg-steel-800 text-steel-400"
              }`}
              aria-label={`${n} star`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs text-steel-400">
        Comments (optional)
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="What happened?"
          className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100 resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving" || !studentId}
        className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide bg-mango-500 text-steel-950 hover:bg-mango-400 disabled:opacity-40"
      >
        {status === "saving" ? "Sending…" : status === "done" ? "Sent ✓" : "Submit feedback"}
      </button>
      {status === "error" && (
        <p className="text-xs text-chili-500">Couldn't submit — try again.</p>
      )}
    </form>
  );
}
