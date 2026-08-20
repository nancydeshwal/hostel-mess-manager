import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function ComplaintCategoryChart({ byCategory }) {
  const entries = Object.entries(byCategory || {});
  const data = {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        label: "Complaints",
        data: entries.map(([, v]) => v),
        backgroundColor: "#e6952e",
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#8b98a1", font: { size: 11 } }, grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { color: "#66757f", stepSize: 1, font: { size: 10 } },
        grid: { color: "#242c33" },
      },
    },
  };

  if (!entries.length)
    return <p className="text-sm text-steel-500">No complaints logged in this window.</p>;

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
