import React, { useState } from "react";
import { useAppDispatch } from "../stores/hooks";
import { addCustomFood } from "../stores/appSlice";
import { Utensils, Apple, Scale } from "lucide-react";

interface CustomFoodFormProps {
  onClose?: () => void;
}

export default function CustomFoodForm({ onClose }: CustomFoodFormProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    category: "Other",
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    unit: "g" as "g" | "unit",
  });
  const calculatedCalories =
    formData.protein * 4 + formData.carbs * 4 + formData.fat * 9;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addCustomFood({
        name: formData.name,
        category: formData.category,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber,
        unit: formData.unit,
      }),
    );

    setFormData({
      name: "",
      category: "General",
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      unit: "g",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["name", "category", "unit"].includes(name)
        ? value
        : Number(value),
    }));
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-dark-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Utensils className="text-accent-primary" />
              Crear Comida Personalizada
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all"
                placeholder="Ej: Mi Pan Integral"
              />
            </div>

            {/* Categoría y Unidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
                  <Apple size={16} /> Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none appearance-none"
                >
                  <option value="proteins">Proteínas</option>
                  <option value="carbs">Carbohidratos</option>
                  <option value="vegetables">Vegetales</option>
                  <option value="fruits">Frutas</option>
                  <option value="dairy">Lácteos</option>
                  <option value="fats">Grasas</option>
                  <option value="beverages">Bebidas</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
                  <Scale size={16} /> Se mide por
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none appearance-none"
                >
                  <option value="g">Cada 100 gramos</option>
                  <option value="unit">Por Unidad</option>
                </select>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Carbohidratos (g)
                </label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Grasas (g)
                </label>
                <input
                  type="number"
                  name="fats"
                  value={formData.fat}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  Fibra (g)
                </label>
                <input
                  type="number"
                  name="fiber"
                  value={formData.fiber}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
                />
              </div>
            </div>

            {/* Preview de Calorías */}
            <div className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                Total calculado:{" "}
                <span className="font-bold text-accent-primary text-2xl">
                  {calculatedCalories.toFixed(0)} kcal
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valores{" "}
                {formData.unit === "g"
                  ? "por cada 100g"
                  : "por cada unidad individual"}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-xl border border-dark-border text-white hover:bg-dark-hover transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent-primary text-dark-bg font-bold px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Guardar Comida
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
