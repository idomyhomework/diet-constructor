import type { Meal } from "./meal";


export interface DailyDiet {
  id: string;
  name: string;
  createdAt: string;
  meals: Meal[];
}
