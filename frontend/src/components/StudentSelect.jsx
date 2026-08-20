import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function StudentSelect({ hostelId, value, onChange }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!hostelId) return;
    api
      .listStudents(hostelId)
      .then((data) => {
        setStudents(data);
        if (data.length) onChange(data[0].id);
        else onChange(null);
      })
      .catch(() => setStudents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelId]);

  if (!students.length)
    return <div className="text-sm text-steel-500">No students registered in this hostel.</div>;

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100"
    >
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} · {s.rollNumber}
        </option>
      ))}
    </select>
  );
}
