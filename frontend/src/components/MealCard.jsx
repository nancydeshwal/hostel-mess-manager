const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

export default function MealCard({ mealType, items, skipped, onToggleSkip, disabled }) {
  return (
    <div className="rounded-2xl border border-steel-800 bg-steel-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-wide text-steel-100">
          {MEAL_LABELS[mealType] || mealType}
        </h3>
        {skipped && (
          <span className="text-[11px] uppercase tracking-wider bg-chili-600/20 text-chili-500 px-2 py-1 rounded-full">
            Skipping
          </span>
        )}
      </div>

      {items && items.length ? (
        <ul className="text-sm text-steel-300 space-y-1">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mango-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-steel-500 italic">Menu not published yet for this meal.</p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggleSkip(mealType, !skipped)}
        className={`focus-ring mt-auto rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors disabled:opacity-40 ${
          skipped
            ? "bg-steel-800 text-steel-200 hover:bg-steel-700"
            : "bg-coriander-600 text-white hover:bg-coriander-500"
        }`}
      >
        {skipped ? "I'll be eating here after all" : "Skipping this meal — eating out"}
      </button>
    </div>
  );
}
