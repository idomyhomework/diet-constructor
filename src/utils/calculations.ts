import type { UserData } from "../types/user";
import type { NutritionalInfo } from "../types/food";
import type { ActivityLevel } from "../types/user";
// Mifflin-St Jeor Formula
// Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
// Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

export const calculateBMR = (userData: UserData): number => {
  const { weight, height, age, gender } = userData;
  
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
  
  if (gender === 'male') {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
};

// Activity multipliers
const activityMultipliers: Record<ActivityLevel, number> = {
  1: 1.2,   // Sedentary (little or no exercise)
  2: 1.275, // Lightly active (light exercise 1-2 days/week)
  3: 1.35,  // Lightly active (light exercise 2-3 days/week)
  4: 1.465, // Moderately active (moderate exercise 3-5 days/week)
  5: 1.55,  // Active (hard exercise 4-5 days/week)
  6: 1.725, // Very active (hard exercise 6-7 days/week)
  7: 1.9,   // Extra active (very hard exercise & physical job)
};

export const calculateTDEE = (userData: UserData): number => {
  const bmr = calculateBMR(userData);
  const multiplier = activityMultipliers[userData.activityLevel];
  return bmr * multiplier;
};

// Goal adjustments
export const calculateDailyCalories = (userData: UserData): number => {
  const tdee = calculateTDEE(userData);

  // user will adjust deficits himself
  switch (userData.goal) {
    case 'lose':
      return tdee - 500; // 500 calorie deficit for weight loss
    case 'gain':
      return tdee + 300; // 300 calorie surplus for weight gain
    default: // maintain
      return tdee;
  }
};

// Macro distribution (30% protein, 30% fat, 40% carbs)
export const calculateDailyGoals = (userData: UserData): NutritionalInfo => {
  const calories = calculateDailyCalories(userData);
  
  // 1g protein = 4 calories
  // 1g fat = 9 calories
  // 1g carbs = 4 calories
  
  const protein = (calories * 0.30) / 4;
  const fat = (calories * 0.30) / 9;
  const carbs = (calories * 0.40) / 4;
  
  // Fiber: 14g per 1000 kcal
  const fiber = (calories / 1000) * 14;
  
  return {
    "calories": Math.round(calories),
    "protein": Math.round(protein),
    "fat": Math.round(fat),
    "carbs": Math.round(carbs),
    "fiber": Math.round(fiber),
  };
};