import { useState } from "react";
import { useAllFoods } from "../stores/hooks";
import { calculateNutritionFromItems } from "../utils/calculations";
import type { DailyDiet } from "../types/diet";
import type { ActivityLevel } from "../types/user";
import type { MealType, MealItem, Meal } from "../types/meal";
import FoodSelector from "./FoodSelector";

// ── Props ──────────────────────────────────────────────────────────────────
interface DietBuilderProps {
  diet: DailyDiet;
  onUpdate: (diet: DailyDiet) => void;
  onUpdateActivity?: (level: ActivityLevel) => void;
}

// ── Meal Display Maps ──────────────────────────────────────────────────────
const mealNames: Record<MealType, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Merienda",
  dinner: "Cena",
};

const mealIcons: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  snack: "🍎",
  dinner: "🌙",
};

// ── Activity Labels ────────────────────────────────────────────────────────
const activityLabels: Record<ActivityLevel, string> = {
  1: "Sedentario",
  2: "Ligero",
  3: "Moderado",
  4: "Activo",
  5: "Muy activo",
  6: "Intenso",
  7: "Atleta",
};

// ── Diet Builder ───────────────────────────────────────────────────────────
// Renders the four meal sections (breakfast, lunch, snack, dinner) for a
// single day of the diet. The diet prop is always a single-day view
// (days[0] holds the current day). Each section lists its food items and
// exposes +/- quantity controls and a delete button.
export default function DietBuilder({
  diet,
  onUpdate,
  onUpdateActivity,
}: DietBuilderProps) {
  const foods = useAllFoods();

  // ── State ────────────────────────────────────────────────────────────────
  // Tracks which meal's FoodSelector modal is currently open (null = closed).
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);

  // ── Current Day ──────────────────────────────────────────────────────────
  // DietBuilder always receives a single-day view — days[0] is the active day.
  const currentDay = diet.days[0];
  const meals = currentDay.meals;

  // ── Nutrition Calculation ──────────────────────────────────────────────
  // Returns the total nutritional info for a single meal's items.
  const calculateMealNutrition = (meal: Meal) =>
    calculateNutritionFromItems(meal.items, foods);

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Returns an updated diet with the given meals replacing the current day.
  const withUpdatedMeals = (updatedMeals: Meal[]): DailyDiet => ({
    ...diet,
    days: [{ ...currentDay, meals: updatedMeals }],
  });

  // ── Item Quantity Handlers ────────────────────────────────────────────────
  const handleAddOne = (mealType: MealType, itemIndex: number) => {
    onUpdate(
      withUpdatedMeals(
        meals.map((meal) => {
          if (meal.type !== mealType) return meal;
          const updatedItems = [...meal.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: updatedItems[itemIndex].quantity + 1,
          };
          return { ...meal, items: updatedItems };
        }),
      ),
    );
  };

  // Decrements quantity by 1. Removes the item entirely if quantity drops below 0.
  const handleRemoveOne = (mealType: MealType, itemIndex: number) => {
    onUpdate(
      withUpdatedMeals(
        meals.map((meal) => {
          if (meal.type !== mealType) return meal;
          const updatedItems = [...meal.items];
          const currentQty = updatedItems[itemIndex].quantity;
          if (currentQty < 1) {
            return {
              ...meal,
              items: meal.items.filter((_, i) => i !== itemIndex),
            };
          }
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: currentQty - 1,
          };
          return { ...meal, items: updatedItems };
        }),
      ),
    );
  };

  // ── Food Add Handler ──────────────────────────────────────────────────────
  // If the same food already exists in the meal, its quantity is summed;
  // otherwise the item is appended as a new entry.
  const handleAddFood = (mealType: MealType, item: MealItem) => {
    onUpdate(
      withUpdatedMeals(
        meals.map((meal) => {
          if (meal.type !== mealType) return meal;
          const existingIndex = meal.items.findIndex(
            (i) => i.foodId === item.foodId,
          );
          if (existingIndex !== -1) {
            const updatedItems = [...meal.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
            };
            return { ...meal, items: updatedItems };
          }
          return { ...meal, items: [...meal.items, item] };
        }),
      ),
    );
    setSelectedMeal(null);
  };

  // ── Food Remove Handler ───────────────────────────────────────────────────
  const handleRemoveItem = (mealType: MealType, itemIndex: number) => {
    onUpdate(
      withUpdatedMeals(
        meals.map((meal) => {
          if (meal.type !== mealType) return meal;
          return {
            ...meal,
            items: meal.items.filter((_, i) => i !== itemIndex),
          };
        }),
      ),
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Activity Level Selector ──────────────────────────────────────── */}
      {onUpdateActivity && (
        <div className="flex items-center gap-3 justify-center">
          <span className="hidden sm:block text-sm text-gray-400 shrink-0">
            Actividad:
          </span>
          <div className="flex flex-col gap-1 sm:gap-0">
            {/* ── Level Buttons ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {([1, 2, 3, 4, 5, 6, 7] as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdateActivity(level)}
                  className={`w-7 h-7 xs:w-9 xs:h-9 rounded text-xs xs:text-sm font-bold transition-all ${
                    currentDay.activityLevel === level
                      ? "bg-accent-primary text-dark-bg scale-105"
                      : "bg-dark-bg border border-dark-border text-gray-400 hover:border-gray-400 hover:text-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
              {/* ── Inline Label (desktop only) ───────────────────────── */}
              <span className="hidden sm:block ml-2 text-sm text-accent-primary font-medium whitespace-nowrap min-w-[5rem]">
                {activityLabels[currentDay.activityLevel]}
              </span>
            </div>
            {/* ── Sliding Label (mobile only) ───────────────────────────── */}
            <div className="relative h-4 sm:hidden">
              <span
                className="absolute text-xs text-gray-500 transition-all duration-200 whitespace-nowrap -translate-x-1/2"
                style={{
                  left: `${(currentDay.activityLevel - 1) * 32 + 14}px`,
                }}
              >
                {activityLabels[currentDay.activityLevel]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Meal Sections ────────────────────────────────────────────────── */}
      {meals.map((meal) => {
        const nutrition = calculateMealNutrition(meal);

        return (
          <div
            key={meal.type}
            className="bg-dark-card rounded-xl p-6 border-b-2 border-t-2 border-dark-border"
          >
            {/* ── Meal Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="hidden md:text-xl">
                  {mealIcons[meal.type]}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {mealNames[meal.type]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Math.round(nutrition.calories)} kcal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMeal(meal.type)}
                className="bg-accent-primary hover:bg-accent-primary/90 text-dark-bg font-bold px-6 py-2 rounded-lg transition-colors"
              >
                + <span className="hidden md:block"></span>
              </button>
            </div>

            {/* ── Item List ───────────────────────────────────────────────── */}
            {meal.items.length > 0 ? (
              <div className="space-y-2">
                {meal.items.map((item, index) => {
                  const food = foods.find((f) => f.id === item.foodId);
                  if (!food) return null;

                  const multiplier =
                    food.unit === "g" ? item.quantity / 100 : item.quantity;
                  const itemCalories = Math.round(
                    food.nutritionalInfo.calories * multiplier,
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col items-center justify-center xs:flex-row">
                          <button
                            className="text-md"
                            onClick={() => handleAddOne(meal.type, index)}
                          >
                            +
                          </button>
                          <span className="text-xl">{food.image}</span>
                          <button
                            className="text-md"
                            onClick={() => handleRemoveOne(meal.type, index)}
                          >
                            -
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-xs">
                            {food.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}
                            {food.unit === "g" ? "g" : " uds."} {itemCalories}{" "}
                            kcal
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(meal.type, index)}
                        className="text-red-400 hover:text-red-300 px-3 py-1 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No hay alimentos añadidos
              </div>
            )}
          </div>
        );
      })}

      {/* ── Food Selector Modal ─────────────────────────────────────────── */}
      {selectedMeal && (
        <FoodSelector
          onAddFood={(item) => handleAddFood(selectedMeal, item)}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}
