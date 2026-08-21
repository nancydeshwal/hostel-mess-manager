import { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import HostelSelect from "./HostelSelect.jsx";
import MenuEditCard from "./MenuEditCard.jsx";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MenuManager() {
  const [hostelId, setHostelId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [menuByMeal, setMenuByMeal] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMenu = useCallback(() => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    api
      .getMenu(hostelId, date)
      .then((entries) => {
        const byMeal = {};
        entries.forEach((e) => (byMeal[e.mealType] = e));
        setMenuByMeal(byMeal);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hostelId, date]);

  useEffect(loadMenu, [loadMenu]);

  async function handleSave({ mealType, items, keyIngredients }) {
    await api.upsertMenu({ hostelId, date, mealType, items, keyIngredients });
    await loadMenu();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-steel-500 mb-1">Admin</p>
          <h1 className="font-display text-4xl text-steel-100">Manage Daily Menu</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <HostelSelect value={hostelId} onChange={setHostelId} />
          <div className="flex items-center gap-1 bg-steel-900 border border-steel-800 rounded-lg px-1">
            <button
              type="button"
              onClick={() => setDate((d) => shiftDate(d, -1))}
              aria-label="Previous day"
              className="focus-ring px-2 py-2 text-steel-400 hover:text-steel-100"
            >
              ←
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="focus-ring bg-transparent px-2 py-2 text-sm text-steel-100"
            />
            <button
              type="button"
              onClick={() => setDate((d) => shiftDate(d, 1))}
              aria-label="Next day"
              className="focus-ring px-2 py-2 text-steel-400 hover:text-steel-100"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-chili-500">{error}</p>}
      {loading && <p className="text-sm text-steel-500">Loading menu…</p>}

      {!hostelId ? (
        <p className="text-sm text-steel-500">Pick a hostel to start editing its menu.</p>
      ) : (
        <section className="grid sm:grid-cols-2 gap-5">
          {MEALS.map((meal) => (
            <MenuEditCard key={`${meal}-${date}`} mealType={meal} existing={menuByMeal[meal]} onSave={handleSave} />
          ))}
        </section>
      )}
    </div>
  );
}
