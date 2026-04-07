import { useState, useRef, useEffect } from "react";
import { exportDietToPdf, dayLabels } from "../utils/exportPdf";
import { exportWeeklyPlanToPdf } from "../utils/exportWeeklyPdf";
import type { DailyDiet } from "../types/diet";
import type { Food } from "../types/food";
import type { Profile } from "../types/profile";

// ── Props ──────────────────────────────────────────────────────────────────
interface ExportDropdownButtonProps {
  diet: DailyDiet;
  profile: Profile;
  foods: Food[];
  activeDayIndex: number;
  fab?: boolean;
}

// ── Export Dropdown Button ─────────────────────────────────────────────────
// A single export button with a dropdown that lets the user choose to export
// the full week or any specific day of the diet.
export default function ExportDropdownButton({
  diet,
  profile,
  foods,
  activeDayIndex,
  fab = false,
}: ExportDropdownButtonProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Close on Outside Click ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Export Handlers ───────────────────────────────────────────────────────
  const handleExportDay = async (dayIndex: number) => {
    setIsOpen(false);
    setIsExporting(true);
    try {
      exportDietToPdf({ diet, profile, foods, dayIndex });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWeek = async () => {
    setIsOpen(false);
    setIsExporting(true);
    try {
      exportWeeklyPlanToPdf({ diet, profile, foods });
    } catch (error) {
      console.error("Error al exportar PDF semanal:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Trigger Button ─────────────────────────────────────────────── */}
      {fab ? (
        // ── FAB Mode (mobile) ───────────────────────────────────────────
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isExporting}
          title="Exportar PDF"
          className="w-14 h-14 flex items-center justify-center bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-dark-bg rounded-full shadow-xl transition-colors text-2xl"
        >
          {isExporting ? <span className="animate-spin text-lg">⏳</span> : <span>📄</span>}
        </button>
      ) : (
        // ── Inline Mode (desktop) ───────────────────────────────────────
        <button
          onClick={() => setIsOpen((prev) => !prev)}
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
              <span>Exportar</span>
              <span className="text-xs">▾</span>
            </>
          )}
        </button>
      )}

      {/* ── Dropdown Menu ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`absolute right-0 w-44 bg-dark-card border border-dark-border rounded-lg shadow-lg z-50 overflow-hidden ${
            fab ? "bottom-full mb-3" : "mt-2"
          }`}
        >
          {/* ── Week Option ────────────────────────────────────────────── */}
          <button
            onClick={handleExportWeek}
            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-dark-hover transition-colors font-semibold border-b border-dark-border"
          >
            📅 Semana completa
          </button>

          {/* ── Day Options ────────────────────────────────────────────── */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <button
              key={dayIndex}
              onClick={() => handleExportDay(dayIndex)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-dark-hover ${
                dayIndex === activeDayIndex
                  ? "text-accent-primary font-semibold"
                  : "text-gray-300"
              }`}
            >
              {dayIndex === activeDayIndex && (
                <span className="mr-1 text-accent-primary">•</span>
              )}
              {dayLabels[dayIndex]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
