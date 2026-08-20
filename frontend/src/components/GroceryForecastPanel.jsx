import { useEffect, useState } from "react";
import { api } from "../api.js";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

export default function GroceryForecastPanel({ hostelId }) {
  const [mealType, setMealType] = useState("lunch");
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    api
      .predictGrocery(hostelId, mealType, 21)
      .then(setForecast)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hostelId, mealType]);

  return (
    <div className="rounded-2xl border border-steel-800 bg-steel-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl tracking-wide text-steel-100">
            Next-week grocery forecast
          </h3>
          <p className="text-xs text-steel-500">
            Linear regression on 21-day attendance trend (strength − meal skips)
          </p>
        </div>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm"
        >
          {MEALS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-steel-500">Crunching the trend line…</p>}
      {error && <p className="text-sm text-chili-500">{error}</p>}

      {forecast && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Avg. predicted attendance / day"
              value={forecast.averagePredictedAttendanceNext7Days}
            />
            <Stat
              label="Trend"
              value={
                forecast.trendSlope > 0
                  ? `+${forecast.trendSlope}/day`
                  : `${forecast.trendSlope}/day`
              }
              tone={forecast.trendSlope >= 0 ? "coriander" : "chili"}
            />
          </div>

          {forecast.groceryForecast?.length ? (
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-left text-steel-500 text-xs uppercase tracking-wider">
                  <th className="pb-2 font-medium">Ingredient</th>
                  <th className="pb-2 font-medium text-right">Qty for next 7 days</th>
                </tr>
              </thead>
              <tbody>
                {forecast.groceryForecast.map((ing) => (
                  <tr key={ing.name} className="border-t border-steel-800">
                    <td className="py-2 text-steel-200">{ing.name}</td>
                    <td className="py-2 text-right text-mango-400 font-semibold">
                      {ing.predictedWeeklyQuantity} {ing.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-steel-500 italic">
              {forecast.note || "Log a menu with key ingredients for this meal to see quantities."}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "mango" }) {
  const toneClass = { mango: "text-mango-400", coriander: "text-coriander-400", chili: "text-chili-500" }[tone];
  return (
    <div className="rounded-xl bg-steel-800/60 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-steel-500 mb-1">{label}</p>
      <p className={`font-display text-2xl ${toneClass}`}>{value}</p>
    </div>
  );
}
