import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch, useAllFoods } from "../stores/hooks";
import {
  calculateNutritionFromItems,
  calculateDailyGoals,
  calculateWeeklyAverageNutrition,
} from "../utils/calculations";
import ExportDropdownButton from "./ExportDropdownButton";
import {
  createDiet,
  updateDiet,
  deleteDiet,
  setCurrentProfile,
} from "../stores/appSlice";
import type { DailyDiet } from "../types/diet";
import type { ActivityLevel } from "../types/user";
import NutritionCharts from "./NutritionCharts";
import FloatingNutritionBar from "./FloatingNutritionBar";
import ProfileForm from "./ProfileForm";
import DietBuilder from "./DietBuilder";

// ── Day Strip Config ───────────────────────────────────────────────────────
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// ── Dashboard ──────────────────────────────────────────────────────────────
// Main screen. Shows daily nutrition progress for the selected day, a list
// of saved diets, and the diet builder for the currently selected diet and day.
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const currentProfileId = useAppSelector(
    (state) => state.app.currentProfileId,
  );
  const profile = useAppSelector((state) =>
    state.app.profiles.find((p) => p.id === currentProfileId),
  );
  const foods = useAllFoods();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const chartRef = useRef<HTMLDivElement>(null);

  // ── Chart Visibility ──────────────────────────────────────────────────────
  // Tracks whether the NutritionCharts section is visible in the viewport.
  // Starts as true so the floating bar does not flash on initial load.
  const [isChartVisible, setIsChartVisible] = useState(true);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsChartVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── State ────────────────────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<DailyDiet | null>(null);
  const [isCreatingDiet, setIsCreatingDiet] = useState(false);
  const [newDietName, setNewDietName] = useState("");
  const [selectedDay, setSelectedDay] = useState<number>(0);

  if (!profile) return null;

  // ── Active Day View ───────────────────────────────────────────────────────
  // DietBuilder always receives a single-day slice of the full diet.
  // Dashboard reconstructs the full diet on every update from the builder.
  const activeDayView: DailyDiet | null = selectedDiet
    ? { ...selectedDiet, days: [{ ...selectedDiet.days[selectedDay] }] }
    : null;

  // ── Nutrition Calculation ──────────────────────────────────────────────
  // Returns average daily kcal across all planned days — used in diet cards.
  const calculateDietAverageNutrition = (diet: DailyDiet) =>
    calculateWeeklyAverageNutrition(diet, foods);

  // ── Diet Handlers ─────────────────────────────────────────────────────────
  const handleCreateDiet = () => {
    if (newDietName.trim()) {
      dispatch(createDiet({ profileId: profile.id, name: newDietName }));
      setNewDietName("");
      setIsCreatingDiet(false);
    }
  };

  const handleUpdateDiet = (updated: DailyDiet) => {
    if (!selectedDiet) return;
    const fullDiet: DailyDiet = {
      ...selectedDiet,
      days: selectedDiet.days.map((d, i) =>
        i === selectedDay ? updated.days[0] : d,
      ),
    };
    dispatch(updateDiet({ profileId: profile.id, diet: fullDiet }));
    setSelectedDiet(fullDiet);
  };

  const handleUpdateDayActivity = (activityLevel: ActivityLevel) => {
    if (!selectedDiet) return;
    const fullDiet: DailyDiet = {
      ...selectedDiet,
      days: selectedDiet.days.map((d, i) =>
        i === selectedDay ? { ...d, activityLevel } : d,
      ),
    };
    dispatch(updateDiet({ profileId: profile.id, diet: fullDiet }));
    setSelectedDiet(fullDiet);
  };

  const handleDeleteDiet = (dietId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta dieta?")) {
      dispatch(deleteDiet({ profileId: profile.id, dietId }));
      if (selectedDiet?.id === dietId) {
        setSelectedDiet(null);
      }
    }
  };

  // ── Derived State ─────────────────────────────────────────────────────────
  // Goals and consumed are computed for the currently selected day so the
  // charts reflect that day's activity level and food intake.
  const activeDay = selectedDiet?.days[selectedDay] ?? null;

  const dayGoals = useMemo(
    () =>
      activeDay
        ? calculateDailyGoals(profile.userData, activeDay.activityLevel)
        : profile.dailyGoals,
    [activeDay, profile.userData, profile.dailyGoals],
  );

  const consumed = useMemo(() => {
    if (!activeDay)
      return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    const allItems = activeDay.meals.flatMap((m) => m.items);
    return calculateNutritionFromItems(allItems, foods);
  }, [activeDay, foods]);

  // ── Edit Profile Overlay ──────────────────────────────────────────────────
  if (isEditingProfile) {
    return (
      <ProfileForm
        existingData={profile.userData}
        profileId={profile.id}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-bold text-white">
              🥗 Diet Tracker
            </h1>
            <div className="h-6 w-px bg-dark-border"></div>
            <span className="text-gray-400">{profile.userData.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-gray-400 hover:text-white transition-colors px-4 py-2"
            >
              ⚙️ <span className="hidden md:inline-block">Editar Perfil</span>
            </button>
            <button
              onClick={() => dispatch(setCurrentProfile(""))}
              className="text-gray-400 hover:text-white transition-colors px-4 py-2"
            >
              🔄 <span className="hidden md:inline-block">Cambiar Perfil</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Daily Goals Header ────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Objetivos Diarios
          </h2>
          <p className="text-gray-400">
            {profile.userData.goal === "lose"
              ? "Perder Peso"
              : profile.userData.goal === "gain"
                ? "Ganar Peso"
                : "Mantener Peso"}{" "}
            {activeDay && <>· Actividad del día: {activeDay.activityLevel}/7</>}
          </p>
        </div>

        {/* ── Nutrition Charts ──────────────────────────────────────────── */}
        <div ref={chartRef}>
          <NutritionCharts goals={dayGoals} consumed={consumed} />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Diet List Panel ───────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Mis Dietas</h3>
                <button
                  onClick={() => setIsCreatingDiet(true)}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-dark-bg font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  + Nueva
                </button>
              </div>

              {/* ── New Diet Input ────────────────────────────────────────── */}
              {isCreatingDiet && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={newDietName}
                    onChange={(e) => setNewDietName(e.target.value)}
                    placeholder="Nombre de la dieta"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-primary transition-colors mb-2"
                    onKeyPress={(e) => e.key === "Enter" && handleCreateDiet()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateDiet}
                      className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-dark-bg font-bold py-2 rounded-lg transition-colors text-sm"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingDiet(false);
                        setNewDietName("");
                      }}
                      className="px-4 bg-dark-bg hover:bg-dark-hover border border-dark-border text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* ── Diet Cards ───────────────────────────────────────────── */}
              <div className="space-y-2">
                {profile.diets.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No hay dietas creadas
                  </p>
                ) : (
                  profile.diets.map((diet) => {
                    const avgNutrition = calculateDietAverageNutrition(diet);
                    return (
                      <div
                        key={diet.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedDiet?.id === diet.id
                            ? "border-accent-primary bg-accent-primary/10"
                            : "border-dark-border bg-dark-bg hover:border-gray-600"
                        }`}
                        onClick={() => setSelectedDiet(diet)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">
                            {diet.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDiet(diet.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-xl leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          {avgNutrition.calories > 0
                            ? `~${Math.round(avgNutrition.calories)} kcal/día`
                            : "Sin planificar"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Diet Builder Panel ────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {selectedDiet && activeDayView ? (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <h3 className="hidden sm:block text-lg font-bold text-white truncate max-w-[10rem] lg:max-w-[14rem]">
                    {selectedDiet.name}
                  </h3>

                  {/* ── Day Strip ──────────────────────────────────────────── */}
                  <div className="flex items-end gap-1 xs:gap-4 mb-4 sm:mb-0">
                    {DAY_LABELS.map((label, i) => {
                      const day = selectedDiet.days[i];
                      const hasFood = day.meals.some((m) => m.items.length > 0);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDay(i)}
                          className={`flex flex-col items-center px-2 py-1 xs:px-3 xs:py-2 rounded-lg transition-all ${
                            selectedDay === i
                              ? "bg-accent-primary/10 text-accent-primary font-bold ring-1 ring-accent-primary/40"
                              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                          }`}
                        >
                          <span className="text-sm xs:text-base font-bold">
                            {label}
                          </span>
                          <span
                            className={`text-xs mt-0.5 tabular-nums ${
                              selectedDay === i
                                ? "text-accent-primary"
                                : "text-gray-600"
                            }`}
                          >
                            {day.activityLevel}
                          </span>
                          {hasFood && (
                            <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-accent-primary mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Export Button (desktop only) ───────────────────── */}
                  <div className="hidden sm:block shrink-0">
                    <ExportDropdownButton
                      diet={selectedDiet}
                      profile={profile}
                      foods={foods}
                      activeDayIndex={selectedDay}
                    />
                  </div>
                </div>

                <DietBuilder
                  diet={activeDayView}
                  onUpdate={handleUpdateDiet}
                  onUpdateActivity={handleUpdateDayActivity}
                />
              </div>
            ) : (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border flex items-center justify-center h-96">
                <p className="text-gray-600 text-lg">
                  Selecciona o crea una dieta para empezar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ── Floating Nutrition Bar (mobile/tablet only) ───────────────── */}
      {!isChartVisible && (
        <FloatingNutritionBar goals={dayGoals} consumed={consumed} />
      )}

      {/* ── Export FAB (mobile only) ──────────────────────────────────── */}
      {selectedDiet && (
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <ExportDropdownButton
            diet={selectedDiet}
            profile={profile}
            foods={foods}
            activeDayIndex={selectedDay}
            fab
          />
        </div>
      )}
    </div>
  );
}
