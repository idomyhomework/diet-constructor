import { useState } from "react";
import { useAppSelector } from "../stores/hooks";
import type { Food } from "../types/food";
import type { FoodCategory } from "../types/food";
import type { MealItem } from "../types/meal";
import CustomFoodForm from "./CustomFoodForm";

interface FoodSelectorProps {
  onAddFood: (item: MealItem) => void;
  onClose: () => void;
}

const categoryNames: Record<FoodCategory, string> = {
  proteins: "Proteínas",
  carbs: "Carbohidratos",
  vegetables: "Verduras",
  fruits: "Frutas",
  dairy: "Lácteos",
  fats: "Grasas",
  beverages: "Bebidas",
  other: "Otros",
};

export default function FoodSelector({
  onAddFood,
  onClose,
}: FoodSelectorProps) {
  const foods = useAppSelector((state) => state.app.foods);
  const customFoods = useAppSelector((state) => state.app.customFoods) || [];
  const [selectedCategory, setSelectedCategory] = useState<
    FoodCategory | "all"
  >("all");
  const allFoods = [...foods, ...customFoods];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const filteredFoods = allFoods.filter((food) => {
    const matchesCategory =
      selectedCategory === "all" || food.category === selectedCategory;
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCloseCreate = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
    }
  };

  const handleAdd = () => {
    if (selectedFood && quantity > 0) {
      onAddFood({
        foodId: selectedFood.id,
        quantity,
      });
      onClose();
    }
  };
  return (
    <>
      {isCreatingNew && <CustomFoodForm onClose={handleCloseCreate} />}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-dark-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-dark-border flex flex-col">
          <div className="p-6 border-b border-dark-border">
            <div className="flex justify-between">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-white">
                  Añadir Alimento
                </h2>
                <button
                  className="bg-accent-primary text-dark-bg p-3 rounded-md ml-2"
                  onClick={() => {
                    setIsCreatingNew(true);
                    console.log(isCreatingNew);
                  }}
                >
                  Crear Alimento
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors mb-4"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedFood(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === "all"
                    ? "bg-accent-primary text-dark-bg"
                    : "bg-dark-bg text-gray-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              {Object.entries(categoryNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key as FoodCategory);
                    setSelectedFood(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === key
                      ? "bg-accent-primary text-dark-bg"
                      : "bg-dark-bg text-gray-400 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedFood?.id === food.id
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-dark-border bg-dark-bg hover:border-gray-600"
                  }`}
                >
                  <div className="text-4xl mb-2">{food.image}</div>
                  <h3 className="text-white font-medium text-xs mb-1">
                    {food.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {food.nutritionalInfo.calories} kcal /{" "}
                    {food.unit === "g" ? "100g" : "unidad"}
                  </p>
                </button>
              ))}
            </div>
          </div>
          {selectedFood && (
            <div className="p-6 border-t border-dark-border w-full min-h-fit flex-shrink-0 bg-dark-bg">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-white font-bold text-sm mb-3">
                    {selectedFood.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Calorías:</span>
                      <span className="text-white font-medium">
                        {selectedFood.nutritionalInfo.calories} kcal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Proteína:</span>
                      <span className="text-white font-medium">
                        {selectedFood.nutritionalInfo.protein}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Grasa:</span>
                      <span className="text-white font-medium">
                        {selectedFood.nutritionalInfo.fat}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">
                        Carbohidratos:
                      </span>
                      <span className="text-white font-medium">
                        {selectedFood.nutritionalInfo.carbs}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Fibra:</span>
                      <span className="text-white font-medium">
                        {selectedFood.nutritionalInfo.fiber}g
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      * Por {selectedFood.unit === "g" ? "100g" : "unidad"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Cantidad (
                    {selectedFood.unit === "g" ? "gramos" : "unidades"})
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors mb-4"
                    min="0"
                    step={selectedFood.unit === "g" ? "10" : "1"}
                  />

                  <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
                    <p className="text-gray-400 text-xs mb-2">Total:</p>
                    <p className="text-accent-primary font-bold text-xl">
                      {Math.round(
                        (selectedFood.nutritionalInfo.calories * quantity) /
                          (selectedFood.unit === "g" ? 100 : 1),
                      )}{" "}
                      kcal
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={quantity <= 0}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-dark-bg font-bold py-4 rounded-lg transition-colors"
              >
                Añadir a la Comida
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
