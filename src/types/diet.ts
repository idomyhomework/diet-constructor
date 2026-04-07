import type { Meal } from "./meal";
import type { ActivityLevel } from "./user";

// ── DayPlan ────────────────────────────────────────────────────────────────
// Represents one day's meal plan within a diet.
// Each day carries its own activity level so calorie targets vary between
// training days and rest days.
export interface DayPlan {
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Lunes … 6 = Domingo
  activityLevel: ActivityLevel;
  meals: Meal[];
}

// ── DailyDiet ──────────────────────────────────────────────────────────────
// A named weekly diet plan belonging to a user profile.
// Contains 7 DayPlan slots, one per day of the week.
export interface DailyDiet {
  id: string;
  name: string;
  createdAt: string;
  days: DayPlan[]; // always 7 elements (index = dayIndex)
}
