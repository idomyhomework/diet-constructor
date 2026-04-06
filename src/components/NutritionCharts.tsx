import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { NutritionalInfo } from "../types/food";

Chart.register(ArcElement, Tooltip, Legend);

// ── Props ──────────────────────────────────────────────────────────────────
interface NutritionalChartProps {
  goals: NutritionalInfo;    // The profile's daily nutritional targets
  consumed: NutritionalInfo; // What the selected diet actually provides
}

// ── Nutrition Charts ───────────────────────────────────────────────────────
// Renders one doughnut chart per macro (calories, protein, fat, carbs, fiber).
// Each chart shows consumed vs. remaining portions of the daily goal.
export default function NutritionChart({
  goals,
  consumed,
}: NutritionalChartProps) {

  // ── Remaining Calculation ─────────────────────────────────────────────────
  // Clamps to Number.MIN_VALUE so the chart always has a visible segment
  // even when the goal is fully met or exceeded.
  const remaining = {
    calories: Math.max(Number.MIN_VALUE, goals.calories - consumed.calories),
    protein: Math.max(Number.MIN_VALUE, goals.protein - consumed.protein),
    fat: Math.max(Number.MIN_VALUE, goals.fat - consumed.fat),
    carbs: Math.max(Number.MIN_VALUE, goals.carbs - consumed.carbs),
    fiber: Math.max(Number.MIN_VALUE, goals.fiber - consumed.fiber),
  };

  // ── Chart Data Factory ────────────────────────────────────────────────────
  // Builds the Chart.js dataset for a single nutrient doughnut.
  const createChartData = (
    consumed: number,
    remaining: number,
    color: string,
  ) => ({
    labels: ["Consumido", "Restante"],
    datasets: [
      {
        data: [consumed, remaining],
        backgroundColor: [color, "#262626"],
        borderColor: ["#0a0a0a", "#0a0a0a"],
        borderWidth: 2,
      },
    ],
  });

  // ── Chart Options ─────────────────────────────────────────────────────────
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#141414",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#262626",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    cutout: "70%",
  };

  // ── Nutrients Config ──────────────────────────────────────────────────────
  // Defines the display order, labels, units, and accent colours for each chart.
  const nutrients = [
    {
      name: "Calorías",
      consumed: consumed.calories,
      goal: goals.calories,
      remaining: remaining.calories,
      unit: "kcal",
      color: "#00ff88",
    },
    {
      name: "Proteína",
      consumed: consumed.protein,
      goal: goals.protein,
      remaining: remaining.protein,
      unit: "g",
      color: "#ff4444",
    },
    {
      name: "Grasa",
      consumed: consumed.fat,
      goal: goals.fat,
      remaining: remaining.fat,
      unit: "g",
      color: "#ffaa00",
    },
    {
      name: "Carbohidratos",
      consumed: consumed.carbs,
      goal: goals.carbs,
      remaining: remaining.carbs,
      unit: "g",
      color: "#00ccff",
    },
    {
      name: "Fibra",
      consumed: consumed.fiber,
      goal: goals.fiber,
      remaining: remaining.fiber,
      unit: "g",
      color: "#aa44ff",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {nutrients.map((nutrient) => (
        <div
          key={nutrient.name}
          className="bg-dark-card rounded-xl p-4 border border-dark-border"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Doughnut
              data={createChartData(
                nutrient.consumed,
                nutrient.remaining,
                nutrient.color,
              )}
              options={options}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {Math.round(nutrient.consumed)}
              </span>
              <span className="text-xs text-gray-500">{nutrient.unit}</span>
            </div>
          </div>
          <h3 className="text-md font-medium text-gray-400 text-center mb-1">
            {nutrient.name}
          </h3>
          <p className="text-md text-gray-600 text-center mb-1">
            {Math.round(nutrient.consumed)} / {Math.round(nutrient.goal)}{" "}
            {nutrient.unit}
          </p>
          {nutrient.consumed > nutrient.goal ? (
            <p className="text-center text-red-300 text-sm">Superado!</p>
          ) : (
            <p></p>
          )}
        </div>
      ))}
    </div>
  );
}
