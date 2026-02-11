import type { UserData } from "./user";
import type { NutritionalInfo } from "./food";
import type { DailyDiet } from "./diet";


export interface Profile {
  id: string;
  userData: UserData;
  dailyGoals: NutritionalInfo;
  diets: DailyDiet[];
  createdAt: string;
}