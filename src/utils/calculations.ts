import type { UserData, ActivityLevel } from "../types/user";
import type { NutritionalInfo, Food } from "../types/food";
import type { MealItem } from "../types/meal";
import type { DayPlan, DailyDiet } from "../types/diet";

// ── Calorie Calculation ────────────────────────────────────────────────────
// Derives calories from macros: protein & carbs = 4 kcal/g, fat = 9 kcal/g.
export const calculateCalories = (info: Omit<NutritionalInfo, "calories">): number => {
  return Math.round(info.protein * 4 + info.carbs * 4 + info.fat * 9);
};

// ── Nutrition From Items ───────────────────────────────────────────────────
// Sums the nutritional contribution of a list of meal items.
// For gram-based foods, values are scaled by quantity / 100 (per-100g basis).
// For unit-based foods, values are multiplied directly by quantity.
export const calculateNutritionFromItems = (
  items: MealItem[],
  foods: Food[],
): NutritionalInfo => {
  return items.reduce(
    (total, item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (!food) return total;
      const multiplier = food.unit === "g" ? item.quantity / 100 : item.quantity;
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

// ── BMR — Mifflin-St Jeor Formula ─────────────────────────────────────────
// Men:   BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
// Women: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161
export const calculateBMR = (userData: UserData): number => {
  const { weight, height, age, gender } = userData;

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  if (gender === "male") {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
};

// ── Activity Multipliers ───────────────────────────────────────────────────
// Maps the 1-7 activity level scale to a TDEE multiplier.
const activityMultipliers: Record<ActivityLevel, number> = {
  1: 1.2,   // Sedentary (little or no exercise)
  2: 1.275, // Lightly active (light exercise 1-2 days/week)
  3: 1.35,  // Lightly active (light exercise 2-3 days/week)
  4: 1.465, // Moderately active (moderate exercise 3-5 days/week)
  5: 1.55,  // Active (hard exercise 4-5 days/week)
  6: 1.725, // Very active (hard exercise 6-7 days/week)
  7: 1.9,   // Extra active (very hard exercise & physical job)
};

// ── TDEE ───────────────────────────────────────────────────────────────────
// Total Daily Energy Expenditure = BMR × activity multiplier.
// activityLevel is passed explicitly because it lives on each DayPlan,
// not on the user profile.
export const calculateTDEE = (userData: UserData, activityLevel: ActivityLevel): number => {
  const bmr = calculateBMR(userData);
  const multiplier = activityMultipliers[activityLevel];
  return bmr * multiplier;
};

// ── Daily Calorie Goal ─────────────────────────────────────────────────────
// Applies a ±300 kcal offset to TDEE based on the user's goal.
export const calculateDailyCalories = (userData: UserData, activityLevel: ActivityLevel): number => {
  const tdee = calculateTDEE(userData, activityLevel);

  // user will adjust deficits himself
  switch (userData.goal) {
    case "lose":
      return tdee - 300; // 300 calorie deficit for weight loss
    case "gain":
      return tdee + 300; // 300 calorie surplus for weight gain
    default: // maintain
      return tdee;
  }
};

// ── Daily Macro Goals ──────────────────────────────────────────────────────
// Splits daily calories into macros: 30% protein, 30% fat, 40% carbs.
// Fiber is estimated at 14g per 1000 kcal.
// activityLevel is always passed explicitly from the active DayPlan.
export const calculateDailyGoals = (
  userData: UserData,
  activityLevel: ActivityLevel,
): NutritionalInfo => {
  const calories = calculateDailyCalories(userData, activityLevel);

  // 1g protein = 4 calories
  // 1g fat = 9 calories
  // 1g carbs = 4 calories

  const protein = (calories * 0.3) / 4;
  const fat = (calories * 0.3) / 9;
  const carbs = (calories * 0.4) / 4;

  // Fiber: 14g per 1000 kcal
  const fiber = (calories / 1000) * 14;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    fiber: Math.round(fiber),
  };
};

// ── Day Nutrition ──────────────────────────────────────────────────────────
// Sums all nutritional values across all meals in a single day.
export const calculateDayNutrition = (
  day: DayPlan,
  foods: Food[],
): NutritionalInfo => {
  const allItems = day.meals.flatMap((meal) => meal.items);
  return calculateNutritionFromItems(allItems, foods);
};

// ── Weekly Average Nutrition ───────────────────────────────────────────────
// Averages the consumed nutrition across the days that have at least one
// food item. Days with no items are excluded from the divisor so the
// average reflects only planned days.
export const calculateWeeklyAverageNutrition = (
  diet: DailyDiet,
  foods: Food[],
): NutritionalInfo => {
  const filledDays = diet.days.filter((d) =>
    d.meals.some((m) => m.items.length > 0),
  );

  if (filledDays.length === 0) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  }

  const totals = filledDays.reduce(
    (acc, day) => {
      const n = calculateDayNutrition(day, foods);
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        fat: acc.fat + n.fat,
        carbs: acc.carbs + n.carbs,
        fiber: acc.fiber + n.fiber,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
  );

  const count = filledDays.length;
  return {
    calories: Math.round(totals.calories / count),
    protein: Math.round(totals.protein / count),
    fat: Math.round(totals.fat / count),
    carbs: Math.round(totals.carbs / count),
    fiber: Math.round(totals.fiber / count),
  };
};
