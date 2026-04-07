import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyDiet } from "../types/diet";
import type { Food } from "../types/food";
import type { Profile } from "../types/profile";
import {
  calculateDailyGoals,
  calculateNutritionFromItems,
} from "./calculations";
import { renderDaySection, dayLabels } from "./exportPdf";

// Extends the jsPDF type with the lastAutoTable property added by jspdf-autotable.
interface JsPDFWithPlugin extends jsPDF {
  lastAutoTable: { finalY: number };
}

// ── Types ──────────────────────────────────────────────────────────────────
interface ExportWeeklyPdfOptions {
  diet: DailyDiet;
  profile: Profile;
  foods: Food[];
}

// ── exportWeeklyPlanToPdf ──────────────────────────────────────────────────
// Generates and downloads a full 7-day PDF for a diet.
// Cover page: profile info, per-day overview table (calories goal vs consumed).
// Subsequent sections: detailed meal breakdown for each day.
export function exportWeeklyPlanToPdf({
  diet,
  profile,
  foods,
}: ExportWeeklyPdfOptions) {
  const doc = new jsPDF() as JsPDFWithPlugin;
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // ── Cover Header ──────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Plan Semanal de Dieta", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 8;
  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  doc.text(diet.name, pageWidth / 2, yPosition, { align: "center" });
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
  yPosition += 12;

  // ── Weekly Overview Table ─────────────────────────────────────────────────
  // One row per day: day name, activity level, calorie goal, consumed, diff.
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Semanal:", 14, yPosition);
  yPosition += 7;

  const overviewRows = diet.days.map((day) => {
    const goals = calculateDailyGoals(profile.userData, day.activityLevel);
    const allItems = day.meals.flatMap((m) => m.items);
    const consumed = calculateNutritionFromItems(allItems, foods);
    const hasFood = allItems.length > 0;

    return [
      dayLabels[day.dayIndex],
      `${day.activityLevel}/7`,
      `${goals.calories} kcal`,
      hasFood ? `${Math.round(consumed.calories)} kcal` : "Sin planificar",
      hasFood ? `${Math.round(consumed.protein)} g` : "-",
      hasFood ? `${Math.round(consumed.carbs)} g` : "-",
      hasFood ? `${Math.round(consumed.fat)} g` : "-",
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [["Día", "Actividad", "Objetivo", "Calorías", "Proteína", "Carbos", "Grasa"]],
    body: overviewRows,
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // ── Per-Day Detail Sections ────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle por Día:", 14, yPosition);
  yPosition += 7;

  diet.days.forEach((day, index) => {
    const hasFood = day.meals.some((m) => m.items.length > 0);

    if (index > 0) {
      doc.addPage();
      yPosition = 20;
    } else if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // ── Day Header ─────────────────────────────────────────────────────────
    const goals = calculateDailyGoals(profile.userData, day.activityLevel);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${dayLabels[day.dayIndex]} — Actividad ${day.activityLevel}/7 — Objetivo: ${goals.calories} kcal`,
      14,
      yPosition,
    );
    yPosition += 8;

    if (!hasFood) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Día sin planificar", 14, yPosition);
      doc.setTextColor(0);
      yPosition += 10;
      return;
    }

    yPosition = renderDaySection(doc as JsPDFWithPlugin, day, foods, yPosition);
  });

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
  const fileName = `${diet.name.replace(/\s+/g, "_")}_semana_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
