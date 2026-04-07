import { Chart, ArcElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { NutritionalInfo } from "../types/food";

Chart.register(ArcElement);

// ── Props ──────────────────────────────────────────────────────────────────
interface FloatingNutritionBarProps {
  goals: NutritionalInfo;
  consumed: NutritionalInfo;
}

// ── Nutrient Config ────────────────────────────────────────────────────────
// Display order, labels, and accent colours — mirrors NutritionCharts.
const NUTRIENTS = [
  { key: "calories" as const, label: "Cal",  color: "#00ff88" },
  { key: "protein"  as const, label: "Prot", color: "#ff4444" },
  { key: "fat"      as const, label: "Grasa", color: "#ffaa00" },
  { key: "carbs"    as const, label: "Carbs", color: "#00ccff" },
  { key: "fiber"    as const, label: "Fibra", color: "#aa44ff" },
];

// ── Chart Data Factory ─────────────────────────────────────────────────────
// Builds a Chart.js dataset for a single mini doughnut.
// Clamps remaining to Number.MIN_VALUE so there is always a visible segment.
const createChartData = (cons: number, remaining: number, color: string) => ({
  datasets: [
    {
      data: [cons, remaining],
      backgroundColor: [color, "#262626"],
      borderColor: ["#0a0a0a", "#0a0a0a"],
      borderWidth: 1,
    },
  ],
});

// ── Mini Chart Options ─────────────────────────────────────────────────────
// Fixed size (controlled by wrapper div), no tooltip, no animation.
const miniOptions = {
  responsive: false,
  maintainAspectRatio: true,
  plugins: {
    legend:  { display: false },
    tooltip: { enabled: false },
  },
  cutout: "72%",
  animation: false as const,
};

// ── Floating Nutrition Bar ─────────────────────────────────────────────────
// Appears on mobile/tablet (< 1024 px) when the main NutritionCharts section
// scrolls out of view. Shows a compact strip of mini doughnut charts pinned
// to the top of the viewport, mirroring the full chart style at ~40% scale.
export default function FloatingNutritionBar({
  goals,
  consumed,
}: FloatingNutritionBarProps) {

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 right-0 z-30 lg:hidden bg-dark-card border-b border-dark-border shadow-lg">
      <div className="flex items-center justify-around px-4 py-1">
        {NUTRIENTS.map(({ key, label, color }) => {
          const cons      = consumed[key];
          const goal      = goals[key];
          const exceeded  = cons > goal;
          const remaining = Math.max(Number.MIN_VALUE, goal - cons);
          const arcColor  = exceeded ? "#f87171" : color;

          return (
            <div key={key} className="flex flex-col items-center gap-0.5 py-1">

              {/* ── Mini Doughnut ─────────────────────────────────────────── */}
              <div className="relative w-10 h-10">
                <Doughnut
                  data={createChartData(cons, remaining, arcColor)}
                  options={miniOptions}
                  width={40}
                  height={40}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white tabular-nums leading-none">
                    {Math.round(cons)}
                  </span>
                </div>
              </div>

              {/* ── Nutrient Label ────────────────────────────────────────── */}
              <span className="text-[10px] text-gray-400 leading-none">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
