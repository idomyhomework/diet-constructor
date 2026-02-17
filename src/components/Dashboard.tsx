import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../stores/hooks";
import {
  createDiet,
  updateDiet,
  deleteDiet,
  setCurrentProfile,
} from "../stores/appSlice";
import type { DailyDiet } from "../types/diet";
import type { NutritionalInfo } from "../types/food";
// import type { AppState } from "../types/app";
import NutritionCharts from "./NutritionCharts";
import ProfileForm from "./ProfileForm";
import DietBuilder from "./DietBuilder";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const currentProfileId = useAppSelector(
    (state) => state.app.currentProfileId,
  );
  const profile = useAppSelector((state) =>
    state.app.profiles.find((p) => p.id === currentProfileId),
  );
  const defaultFoods = useAppSelector((state) => state.app.foods);
  const customFoods = useAppSelector((state) => state.app.customFoods);
  const foods = [...customFoods, ...defaultFoods];

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<DailyDiet | null>(null);
  const [isCreatingDiet, setIsCreatingDiet] = useState(false);
  const [newDietName, setNewDietName] = useState("");
  if (!profile) return null;

  const calculateDietNutrition = (diet: DailyDiet): NutritionalInfo => {
    return diet.meals.reduce(
      (total, meal) => {
        const mealTotal = meal.items.reduce(
          (mealSum, item) => {
            const food = foods.find((f) => f.id === item.foodId);
            if (!food) return mealSum;

            const multiplier =
              food.unit === "g" ? item.quantity / 100 : item.quantity;

            return {
              calories:
                mealSum.calories + food.nutritionalInfo.calories * multiplier,
              protein:
                mealSum.protein + food.nutritionalInfo.protein * multiplier,
              fat: mealSum.fat + food.nutritionalInfo.fat * multiplier,
              carbs: mealSum.carbs + food.nutritionalInfo.carbs * multiplier,
              fiber: mealSum.fiber + food.nutritionalInfo.fiber * multiplier,
            };
          },
          { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
        );

        return {
          calories: total.calories + mealTotal.calories,
          protein: total.protein + mealTotal.protein,
          fat: total.fat + mealTotal.fat,
          carbs: total.carbs + mealTotal.carbs,
          fiber: total.fiber + mealTotal.fiber,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
    );
  };

  const handleCreateDiet = () => {
    if (newDietName.trim()) {
      dispatch(createDiet({ profileId: profile.id, name: newDietName }));
      setNewDietName("");
      setIsCreatingDiet(false);
    }
  };

  const handleUpdateDiet = (diet: DailyDiet) => {
    dispatch(updateDiet({ profileId: profile.id, diet }));
    setSelectedDiet(diet); // <-- Añade esta línea
  };

  const handleDeleteDiet = (dietId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta dieta?")) {
      dispatch(deleteDiet({ profileId: profile.id, dietId }));
      if (selectedDiet?.id === dietId) {
        setSelectedDiet(null);
      }
    }
  };

  const consumed = selectedDiet
    ? calculateDietNutrition(selectedDiet)
    : {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
      };

  if (isEditingProfile) {
    return (
      <ProfileForm
        existingData={profile.userData}
        profileId={profile.id}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
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
            · Nivel de actividad - {profile.userData.activityLevel}
          </p>
        </div>

        <NutritionCharts goals={profile.dailyGoals} consumed={consumed} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <div className="space-y-2">
                {profile.diets.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No hay dietas creadas
                  </p>
                ) : (
                  profile.diets.map((diet) => {
                    const nutrition = calculateDietNutrition(diet);
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
                          {Math.round(nutrition.calories)} kcal
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedDiet ? (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {selectedDiet.name}
                </h3>
                <DietBuilder diet={selectedDiet} onUpdate={handleUpdateDiet} />
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
    </div>
  );
}
