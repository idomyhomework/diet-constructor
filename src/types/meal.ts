export interface MealItem {
  foodId: string;
  quantity: number; // gramos o unidades
}

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";
export interface Meal {
  type: MealType;
  items: MealItem[];
}