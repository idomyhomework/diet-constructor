import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyDiet } from "../types/diet";
import type { Food, NutritionalInfo } from "../types/food";
import type { Profile } from "../types/profile";

// ── Types ──────────────────────────────────────────────────────────────────
interface ExportPdfOptions {
  diet: DailyDiet;
  profile: Profile;
  foods: Food[];
  consumed: NutritionalInfo;
}

// ── Meal Label Map ─────────────────────────────────────────────────────────
const mealTypeNames: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Merienda",
  dinner: "Cena",
};

// ── exportDietToPdf ────────────────────────────────────────────────────────
// Generates and downloads a PDF with profile info, a daily nutrition summary
// table, and a per-meal food breakdown. File is named after the diet + date.
export function exportDietToPdf({
  diet,
  profile,
  foods,
  consumed,
}: ExportPdfOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Plan de Dieta", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
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
    `Nivel de actividad: ${profile.userData.activityLevel}/7`,
    14,
    yPosition,
  );
  yPosition += 10;

  // ── Nutrition Summary Table ───────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Nutricional Diario:", 14, yPosition);
  yPosition += 7;

  autoTable(doc, {
    startY: yPosition,
    head: [["Nutriente", "Objetivo", "Consumido", "Diferencia"]],
    body: [
      [
        "Calorías",
        `${Math.round(profile.dailyGoals.calories)} kcal`,
        `${Math.round(consumed.calories)} kcal`,
        `${Math.round(consumed.calories - profile.dailyGoals.calories)} kcal`,
      ],
      [
        "Proteínas",
        `${Math.round(profile.dailyGoals.protein)} g`,
        `${Math.round(consumed.protein)} g`,
        `${Math.round(consumed.protein - profile.dailyGoals.protein)} g`,
      ],
      [
        "Carbohidratos",
        `${Math.round(profile.dailyGoals.carbs)} g`,
        `${Math.round(consumed.carbs)} g`,
        `${Math.round(consumed.carbs - profile.dailyGoals.carbs)} g`,
      ],
      [
        "Grasas",
        `${Math.round(profile.dailyGoals.fat)} g`,
        `${Math.round(consumed.fat)} g`,
        `${Math.round(consumed.fat - profile.dailyGoals.fat)} g`,
      ],
      [
        "Fibra",
        `${Math.round(profile.dailyGoals.fiber)} g`,
        `${Math.round(consumed.fiber)} g`,
        `${Math.round(consumed.fiber - profile.dailyGoals.fiber)} g`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ── Meal Detail ───────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Comidas:", 14, yPosition);
  yPosition += 7;

  diet.meals.forEach((meal) => {
    // Start a new page if the remaining space is too small
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

      const multiplier =
        food.unit === "g" ? item.quantity / 100 : item.quantity;
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
    const mealTotals = meal.items.reduce(
      (acc, item) => {
        const food = foods.find((f) => f.id === item.foodId);
        if (!food) return acc;

        const multiplier =
          food.unit === "g" ? item.quantity / 100 : item.quantity;

        return {
          calories: acc.calories + food.nutritionalInfo.calories * multiplier,
          protein: acc.protein + food.nutritionalInfo.protein * multiplier,
          carbs: acc.carbs + food.nutritionalInfo.carbs * multiplier,
          fat: acc.fat + food.nutritionalInfo.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

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
      head: [
        ["Alimento", "Cantidad", "Calorías", "Proteína", "Carbos", "Grasa"],
      ],
      body: mealRows,
      theme: "striped",
      headStyles: {
        fillColor: [75, 85, 99],
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
      },
      footStyles: {
        fillColor: [229, 231, 235],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      margin: { left: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
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
  const fileName = `${diet.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
