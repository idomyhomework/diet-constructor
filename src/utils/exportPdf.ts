import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyDiet, DayPlan } from "../types/diet";
import type { Food, NutritionalInfo } from "../types/food";
import type { Profile } from "../types/profile";
import { calculateNutritionFromItems, calculateDailyGoals } from "./calculations";

// Extends the jsPDF type with the lastAutoTable property added by jspdf-autotable.
interface JsPDFWithPlugin extends jsPDF {
  lastAutoTable: { finalY: number };
}

// ── Types ──────────────────────────────────────────────────────────────────
interface ExportPdfOptions {
  diet: DailyDiet;
  profile: Profile;
  foods: Food[];
  dayIndex: number;
}

// ── Meal Label Map ─────────────────────────────────────────────────────────
const mealTypeNames: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Merienda",
  dinner: "Cena",
};

// ── Day Label Map ──────────────────────────────────────────────────────────
export const dayLabels: Record<number, string> = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo",
};

// ── renderDaySection ───────────────────────────────────────────────────────
// Renders the per-meal food breakdown for a single day onto an existing
// jsPDF document. Returns the Y position after the last table so the caller
// can continue adding content below.
export function renderDaySection(
  doc: JsPDFWithPlugin,
  dayPlan: DayPlan,
  foods: Food[],
  startY: number,
): number {
  let yPosition = startY;

  dayPlan.meals.forEach((meal) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(mealTypeNames[meal.type] || meal.type, 14, yPosition);
    yPosition += 5;

    if (meal.items.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("(Sin alimentos)", 14, yPosition);
      yPosition += 10;
      return;
    }

    // ── Per-meal Food Rows ───────────────────────────────────────────────
    const mealRows = meal.items.map((item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (!food) return ["Alimento no encontrado", "-", "-", "-", "-", "-"];

      const multiplier = food.unit === "g" ? item.quantity / 100 : item.quantity;
      const calories = Math.round(food.nutritionalInfo.calories * multiplier);
      const protein = Math.round(food.nutritionalInfo.protein * multiplier);
      const carbs = Math.round(food.nutritionalInfo.carbs * multiplier);
      const fat = Math.round(food.nutritionalInfo.fat * multiplier);

      return [
        food.name,
        `${item.quantity} ${food.unit === "g" ? "g" : "ud"}`,
        `${calories} kcal`,
        `${protein} g`,
        `${carbs} g`,
        `${fat} g`,
      ];
    });

    // ── Meal Totals Row ──────────────────────────────────────────────────
    const mealTotals = calculateNutritionFromItems(meal.items, foods);
    mealRows.push([
      "TOTAL",
      "",
      `${Math.round(mealTotals.calories)} kcal`,
      `${Math.round(mealTotals.protein)} g`,
      `${Math.round(mealTotals.carbs)} g`,
      `${Math.round(mealTotals.fat)} g`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Alimento", "Cantidad", "Calorías", "Proteína", "Carbos", "Grasa"]],
      body: mealRows,
      theme: "striped",
      headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8 },
      footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold" },
      margin: { left: 14 },
    });

    yPosition = (doc as JsPDFWithPlugin).lastAutoTable.finalY + 10;
  });

  return yPosition;
}

// ── exportDietToPdf ────────────────────────────────────────────────────────
// Generates and downloads a PDF for a specific day of the diet.
// Uses the day's own activity level to compute the calorie/macro goals.
export function exportDietToPdf({ diet, profile, foods, dayIndex }: ExportPdfOptions) {
  const doc = new jsPDF() as JsPDFWithPlugin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const dayPlan = diet.days[dayIndex];
  const dayLabel = dayLabels[dayIndex];
  let yPosition = 20;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Plan de Dieta", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`${diet.name} — ${dayLabel}`, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 15;

  // ── Profile Info ──────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Perfil:", 14, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombre: ${profile.userData.name}`, 14, yPosition);
  yPosition += 5;
  doc.text(
    `Edad: ${profile.userData.age} años | Peso: ${profile.userData.weight} kg | Altura: ${profile.userData.height} cm`,
    14,
    yPosition,
  );
  yPosition += 5;
  doc.text(
    `Objetivo: ${profile.userData.goal === "lose" ? "Perder peso" : profile.userData.goal === "gain" ? "Ganar peso" : "Mantener peso"}`,
    14,
    yPosition,
  );
  yPosition += 5;
  doc.text(
    `Nivel de actividad (${dayLabel}): ${dayPlan.activityLevel}/7`,
    14,
    yPosition,
  );
  yPosition += 10;

  // ── Nutrition Summary Table ───────────────────────────────────────────────
  const dayGoals = calculateDailyGoals(profile.userData, dayPlan.activityLevel);
  const allItems = dayPlan.meals.flatMap((m) => m.items);
  const consumed: NutritionalInfo = calculateNutritionFromItems(allItems, foods);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Nutricional:", 14, yPosition);
  yPosition += 7;

  autoTable(doc, {
    startY: yPosition,
    head: [["Nutriente", "Objetivo", "Consumido", "Diferencia"]],
    body: [
      ["Calorías", `${dayGoals.calories} kcal`, `${Math.round(consumed.calories)} kcal`, `${Math.round(consumed.calories - dayGoals.calories)} kcal`],
      ["Proteínas", `${dayGoals.protein} g`, `${Math.round(consumed.protein)} g`, `${Math.round(consumed.protein - dayGoals.protein)} g`],
      ["Carbohidratos", `${dayGoals.carbs} g`, `${Math.round(consumed.carbs)} g`, `${Math.round(consumed.carbs - dayGoals.carbs)} g`],
      ["Grasas", `${dayGoals.fat} g`, `${Math.round(consumed.fat)} g`, `${Math.round(consumed.fat - dayGoals.fat)} g`],
      ["Fibra", `${dayGoals.fiber} g`, `${Math.round(consumed.fiber)} g`, `${Math.round(consumed.fiber - dayGoals.fiber)} g`],
    ],
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // ── Meal Detail ───────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Comidas:", 14, yPosition);
  yPosition += 7;

  renderDaySection(doc, dayPlan, foods, yPosition);

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString("es-ES")} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `${diet.name.replace(/\s+/g, "_")}_${dayLabel}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
