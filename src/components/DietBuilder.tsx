import { useState } from "react";
import { useAppSelector } from "../stores/hooks";
import type { DailyDiet } from "../types/diet";
import type { MealType } from "../types/meal";
import type { MealItem } from "../types/meal";
import type { Meal } from "../types/meal";
import FoodSelector from "./FoodSelector";
// import { Trash2, Plus, Coffee, Sun, Apple, Moon } from "lucide-react";
import type { NutritionalInfo } from "../types/food";

interface DietBuilderProps {
  diet: DailyDiet;
  onUpdate: (diet: DailyDiet) => void;
}

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

export default function DietBuilder({ diet, onUpdate }: DietBuilderProps) {
  const defaultFoods = useAppSelector((state) => state.app.foods);
  const customFoods = useAppSelector((state) => state.app.customFoods);
  const foods = [...customFoods, ...defaultFoods];
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);

  const calculateMealNutrition = (meal: Meal): NutritionalInfo => {
    return meal.items.reduce(
      (total, item) => {
        const food = foods.find((f) => f.id === item.foodId);
        if (!food) return total;

        const multiplier =
          food.unit === "g" ? item.quantity / 100 : item.quantity;

        return {
          calories: total.calories + food.nutritionalInfo.calories * multiplier,
          protein: total.protein + food.nutritionalInfo.protein * multiplier,
          fat: total.fat + food.nutritionalInfo.fat * multiplier,
          carbs: total.carbs + food.nutritionalInfo.carbs * multiplier,
          fiber: total.fiber + food.nutritionalInfo.fiber * multiplier,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
    );
  };

  const handleAddFood = (mealType: MealType, item: MealItem) => {
    const updatedDiet = {
      ...diet,
      meals: diet.meals.map((meal) => {
        if (meal.type === mealType) {
          // Buscar si ya existe un item con el mismo foodId
          const existingItemIndex = meal.items.findIndex(
            (existingItem) => existingItem.foodId === item.foodId,
          );

          if (existingItemIndex !== -1) {
            // Si existe, sumar la cantidad
            const updatedItems = [...meal.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + item.quantity,
            };
            return {
              ...meal,
              items: updatedItems,
            };
          } else {
            // Si no existe, añadir como nuevo item
            return {
              ...meal,
              items: [...meal.items, item],
            };
          }
        }
        return meal;
      }),
    };

    onUpdate(updatedDiet);
    setSelectedMeal(null);
  };

  const handleRemoveItem = (mealType: MealType, itemIndex: number) => {
    const updatedDiet = {
      ...diet,
      meals: diet.meals.map((meal) => {
        if (meal.type === mealType) {
          return {
            ...meal,
            items: meal.items.filter((_, index) => index !== itemIndex),
          };
        }
        return meal;
      }),
    };

    onUpdate(updatedDiet);
  };

  return (
    <div className="space-y-6">
      {diet.meals.map((meal) => {
        const nutrition = calculateMealNutrition(meal);

        return (
          <div
            key={meal.type}
            className="bg-dark-card rounded-xl p-6 border border-dark-border"
          >
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
                + <span className="hidden md:block">Añadir</span>
              </button>
            </div>

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
                        <span className="text-2xl">{food.image}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {food.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}
                            {food.unit === "g" ? "g" : " unidad(es)"} ·{" "}
                            {itemCalories} kcal
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

      {selectedMeal && (
        <FoodSelector
          onAddFood={(item) => handleAddFood(selectedMeal, item)}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}
