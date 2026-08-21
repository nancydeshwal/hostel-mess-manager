const UNITS = ["kg", "g", "L", "ml", "units"];

export default function IngredientEditor({ ingredients, onChange }) {
  function updateRow(idx, patch) {
    const next = ingredients.map((row, i) => (i === idx ? { ...row, ...patch } : row));
    onChange(next);
  }

  function removeRow(idx) {
    onChange(ingredients.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...ingredients, { name: "", unitPerHundredStudents: 0, unit: "kg" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-steel-500">
          Key ingredients (per 100 students)
        </span>
        <button
          type="button"
          onClick={addRow}
          className="focus-ring text-xs text-mango-400 hover:text-mango-300 font-medium"
        >
          + Add ingredient
        </button>
      </div>

      {ingredients.length === 0 && (
        <p className="text-xs text-steel-500 italic">
          None yet — the grocery forecast needs at least one to compute quantities.
        </p>
      )}

      {ingredients.map((row, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ingredient name"
            value={row.name}
            onChange={(e) => updateRow(idx, { name: e.target.value })}
            className="focus-ring flex-1 bg-steel-800 border border-steel-700 rounded-lg px-2.5 py-1.5 text-xs text-steel-100"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Qty"
            value={row.unitPerHundredStudents}
            onChange={(e) => updateRow(idx, { unitPerHundredStudents: parseFloat(e.target.value) || 0 })}
            className="focus-ring w-20 bg-steel-800 border border-steel-700 rounded-lg px-2.5 py-1.5 text-xs text-steel-100"
          />
          <select
            value={row.unit}
            onChange={(e) => updateRow(idx, { unit: e.target.value })}
            className="focus-ring w-20 bg-steel-800 border border-steel-700 rounded-lg px-2 py-1.5 text-xs text-steel-100"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeRow(idx)}
            aria-label="Remove ingredient"
            className="focus-ring text-steel-500 hover:text-chili-500 text-sm px-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
