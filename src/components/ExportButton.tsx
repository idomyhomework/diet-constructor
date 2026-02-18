// src/components/ExportButton.tsx
import { useState } from "react";
import { exportDietToPdf } from "../utils/exportPdf";
import type { DailyDiet } from "../types/diet";
import type { Food, NutritionalInfo } from "../types/food";
import type { Profile } from "../types/profile";

interface ExportButtonProps {
  diet: DailyDiet;
  profile: Profile;
  foods: Food[];
  consumed: NutritionalInfo;
}

export default function ExportButton({
  diet,
  profile,
  foods,
  consumed,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportDietToPdf({ diet, profile, foods, consumed });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-dark-bg font-bold px-4 py-2 rounded-lg transition-colors"
    >
      {isExporting ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Generando...</span>
        </>
      ) : (
        <>
          <span>📄</span>
          <span>Exportar a PDF</span>
        </>
      )}
    </button>
  );
}
