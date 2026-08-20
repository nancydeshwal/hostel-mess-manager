import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function HostelSelect({ value, onChange }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listHostels()
      .then((data) => {
        setHostels(data);
        if (!value && data.length) onChange(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="text-sm text-steel-500">Loading hostels…</div>;
  if (error)
    return (
      <div className="text-sm text-chili-500">
        Couldn't reach the API ({error}). Is the backend running and seeded?
      </div>
    );
  if (!hostels.length)
    return <div className="text-sm text-steel-500">No hostels yet — run the seed script.</div>;

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100"
    >
      {hostels.map((h) => (
        <option key={h.id} value={h.id}>
          {h.name} ({h.type})
        </option>
      ))}
    </select>
  );
}
