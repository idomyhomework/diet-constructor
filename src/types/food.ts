export interface NutritionalInfo {
  calories: number;
  protein: number; // en gramos
  fat: number;     // en gramos
  carbs: number;   // en gramos
  fiber: number;   // en gramos
}

export interface Food {
  id: string;
  name: string;
  category: string;
  image?: string; // Emoji o URL de imagen
  unit: "g" | "unit"; // Se calcula por cada 100g o por unidad
  nutritionalInfo: NutritionalInfo;
}

export type FoodCategory =
  | "proteins"
  | "carbs"
  | "vegetables"
  | "fruits"
  | "dairy"
  | "fats"
  | "beverages"
  | "other";
