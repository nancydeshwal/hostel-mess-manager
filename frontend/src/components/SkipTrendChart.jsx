import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const MEAL_COLORS = {
  breakfast: "#f0ab4c",
  lunch: "#569166",
  snacks: "#8b98a1",
  dinner: "#cf5a44",
};

export default function SkipTrendChart({ labels, series }) {
  const data = {
    labels: labels.map((l) => l.slice(5)), // MM-DD
    datasets: Object.entries(series).map(([meal, values]) => ({
      label: meal[0].toUpperCase() + meal.slice(1),
      data: values,
      borderColor: MEAL_COLORS[meal],
      backgroundColor: MEAL_COLORS[meal],
      tension: 0.35,
      pointRadius: 2,
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#b4bfc6", font: { family: "Inter", size: 11 } },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: { color: "#66757f", font: { size: 10 } },
        grid: { color: "#242c33" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#66757f", font: { size: 10 } },
        grid: { color: "#242c33" },
        title: { display: true, text: "Students skipping", color: "#8b98a1" },
      },
    },
  };

  return (
    <div style={{ height: 300 }}>
      <Line data={data} options={options} />
    </div>
  );
}
