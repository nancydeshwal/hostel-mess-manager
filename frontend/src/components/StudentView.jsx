import { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import HostelSelect from "./HostelSelect.jsx";
import StudentSelect from "./StudentSelect.jsx";
import MealCard from "./MealCard.jsx";
import ComplaintForm from "./ComplaintForm.jsx";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function StudentView() {
  const [hostelId, setHostelId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [menu, setMenu] = useState({});
  const [skipState, setSkipState] = useState({});
  const [loading, setLoading] = useState(false);
  const date = todayISO();

  const loadMenu = useCallback(() => {
    if (!hostelId) return;
    setLoading(true);
    api
      .getMenu(hostelId, date)
      .then((entries) => {
        const byMeal = {};
        entries.forEach((e) => (byMeal[e.mealType] = e.items));
        setMenu(byMeal);
      })
      .finally(() => setLoading(false));
  }, [hostelId, date]);

  const loadSkipStatus = useCallback(() => {
    if (!studentId) return;
    MEALS.forEach((meal) => {
      api.getSkipStatus(studentId, date, meal).then((res) => {
        setSkipState((prev) => ({ ...prev, [meal]: !!res.skipped }));
      });
    });
  }, [studentId, date]);

  useEffect(loadMenu, [loadMenu]);
  useEffect(loadSkipStatus, [loadSkipStatus]);

  async function handleToggle(mealType, skipped) {
    if (!studentId || !hostelId) return;
    setSkipState((prev) => ({ ...prev, [mealType]: skipped })); // optimistic
    try {
      await api.toggleSkip({ studentId, hostelId, date, mealType, skipped });
    } catch {
      setSkipState((prev) => ({ ...prev, [mealType]: !skipped })); // revert on failure
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-steel-500 mb-1">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-4xl text-steel-100">Today's Mess Menu</h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <HostelSelect value={hostelId} onChange={setHostelId} />
          {hostelId && <StudentSelect hostelId={hostelId} value={studentId} onChange={setStudentId} />}
        </div>
      </section>

      {loading && <p className="text-sm text-steel-500">Loading menu…</p>}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEALS.map((meal) => (
          <MealCard
            key={meal}
            mealType={meal}
            items={menu[meal]}
            skipped={!!skipState[meal]}
            onToggleSkip={handleToggle}
            disabled={!studentId}
          />
        ))}
      </section>

      <section className="max-w-xl">
        <ComplaintForm hostelId={hostelId} studentId={studentId} date={date} />
      </section>
    </div>
  );
}
