import { useState, useEffect } from "react";
import IngredientEditor from "./IngredientEditor.jsx";

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

export default function MenuEditCard({ mealType, existing, onSave }) {
  const [items, setItems] = useState(existing?.items || []);
  const [ingredients, setIngredients] = useState(existing?.keyIngredients || []);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // reset local edit state whenever the underlying menu entry changes (date/hostel switch)
  useEffect(() => {
    setItems(existing?.items || []);
    setIngredients(existing?.keyIngredients || []);
    setSavedAt(null);
  }, [existing, mealType]);

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems([...items, trimmed]);
    setNewItem("");
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ mealType, items, keyIngredients: ingredients });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-steel-800 bg-steel-900 p-5 flex flex-col gap-4">
      <h3 className="font-display text-xl tracking-wide text-steel-100">
        {MEAL_LABELS[mealType] || mealType}
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wider text-steel-500">Dishes</span>
        {items.length === 0 && <p className="text-xs text-steel-500 italic">No dishes added yet.</p>}
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1.5 bg-steel-800 rounded-full pl-3 pr-2 py-1 text-xs text-steel-200"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                aria-label={`Remove ${item}`}
                className="focus-ring text-steel-500 hover:text-chili-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder="Add a dish, e.g. Paneer Curry"
            className="focus-ring flex-1 bg-steel-800 border border-steel-700 rounded-lg px-3 py-1.5 text-sm text-steel-100"
          />
          <button
            type="button"
            onClick={addItem}
            className="focus-ring px-3 py-1.5 rounded-lg text-xs font-medium bg-steel-700 text-steel-200 hover:bg-steel-600"
          >
            Add
          </button>
        </div>
      </div>

      <IngredientEditor ingredients={ingredients} onChange={setIngredients} />

      <div className="flex items-center gap-3 mt-auto pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="focus-ring rounded-xl px-4 py-2 text-sm font-semibold tracking-wide bg-mango-500 text-steel-950 hover:bg-mango-400 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save meal"}
        </button>
        {savedAt && <span className="text-xs text-coriander-400">Saved ✓</span>}
      </div>
    </div>
  );
}
