import React, { useState } from "react";
import type { UserData, Gender, ActivityLevel, Goal } from "../types/user";
import { useAppDispatch } from "../stores/hooks";
import { createProfile, updateProfile } from "../stores/appSlice";
import { User, Ruler, Weight, Activity, Target } from "lucide-react";

interface ProfileFromProp {
  existingData?: UserData;
  profileId?: string;
  onCancel?: () => void;
}

export default function ProfileForm({
  existingData,
  profileId,
  onCancel,
}: ProfileFromProp) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<UserData>(
    existingData || {
      name: "",
      weight: 70,
      height: 170,
      age: 30,
      gender: "male",
      activityLevel: 3,
      goal: "maintain",
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileId) {
      dispatch(updateProfile({ id: profileId, userData: formData }));
      if (onCancel) onCancel();
    } else {
      dispatch(createProfile(formData));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-dark-card p-8 rounded-2xl border border-dark-border shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <User className="text-accent-primary" />
        {existingData ? "Editar Perfil" : "Crear tu Perfil"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-gray-400 mb-2 text-sm">Nombre</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none transition-all"
            placeholder="Tu nombre..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Peso */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
              <Weight size={16} /> Peso (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: Number(e.target.value) })
              }
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
            />
          </div>

          {/* Altura */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
              <Ruler size={16} /> Altura (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: Number(e.target.value) })
              }
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Edad</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: Number(e.target.value) })
              }
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none"
            />
          </div>
        </div>

        {/* Género y Objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Género</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value as Gender })
              }
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none appearance-none"
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
              <Target size={16} /> Objetivo
            </label>
            <select
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value as Goal })
              }
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:border-accent-primary outline-none appearance-none"
            >
              <option value="lose">Perder peso</option>
              <option value="maintain">Mantener peso</option>
              <option value="gain">Ganar peso</option>
            </select>
          </div>
        </div>

        {/* Nivel de Actividad */}
        <div>
          <label className="block text-gray-400 mb-2 text-sm flex items-center gap-2">
            <Activity size={16} /> Nivel de Actividad (1-7)
          </label>
          <input
            type="range"
            min="1"
            max="7"
            value={formData.activityLevel}
            onChange={(e) =>
              setFormData({
                ...formData,
                activityLevel: Number(e.target.value) as ActivityLevel,
              })
            }
            className="w-full accent-accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Sedentario</span>
            <span>Moderado</span>
            <span>Atleta</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-xl border border-dark-border text-white hover:bg-dark-hover transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-accent-primary text-dark-bg font-bold px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {existingData ? "Guardar Cambios" : "Comenzar mi Dieta"}
          </button>
        </div>
      </form>
    </div>
  );
}
