export type Gender = "male" | "female";
export type Goal = "maintain" | "lose" | "gain";

// Niveles de actividad del 1 al 7 (ej: 1 = sedentario, 7 = atleta)
// El nivel se asigna por día en DayPlan, no a nivel de perfil.
export type ActivityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface UserData {
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: Gender;
  goal: Goal;
}



