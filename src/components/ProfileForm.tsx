import React, { useState } from "react";
import type { UserData, Gender, Goal } from "../types/user";
import { useAppDispatch } from "../stores/hooks";
import { createProfile, updateProfile } from "../stores/appSlice";
import { User, Ruler, Weight, Target } from "lucide-react";

// ── Props ──────────────────────────────────────────────────────────────────
interface ProfileFromProp {
  existingData?: UserData; // Pre-fills the form when editing an existing profile
  profileId?: string;      // If set, dispatches updateProfile instead of createProfile
  onCancel?: () => void;
}

// ── Profile Form ───────────────────────────────────────────────────────────
// Used for both creating a new profile and editing an existing one.
// Dispatches createProfile or updateProfile depending on whether profileId is set.
export default function ProfileForm({
  existingData,
  profileId,
  onCancel,
}: ProfileFromProp) {
  const dispatch = useAppDispatch();

  // ── State ────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<UserData>(
    existingData || {
      name: "",
      weight: 70,
      height: 170,
      age: 30,
      gender: "male",
      goal: "maintain",
    },
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileId) {
      dispatch(updateProfile({ id: profileId, userData: formData }));
      if (onCancel) onCancel();
    } else {
      dispatch(createProfile(formData));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* ── Physical Stats ──────────────────────────────────────────────── */}
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

        {/* ── Goal & Gender ───────────────────────────────────────────────── */}
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

        {/* ── Submit / Cancel ─────────────────────────────────────────────── */}
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
