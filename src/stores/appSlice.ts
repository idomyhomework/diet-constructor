import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../types/app";
import type { Profile } from "../types/profile";
import type { UserData } from "../types/user";
import type { DailyDiet } from "../types/diet";
import type { Food } from "../types/food";
import { calculateDailyGoals } from "../utils/calculations";
import foodsData from "../data/foods.json";
const STORAGE_KEY = "diet-tracker-state";

const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return {
        profiles: [],
        currentProfileId: null,
        foods: foodsData as Food[],
        customFoods: [],
      };
    }
    const state = JSON.parse(serialized);
    return {
      ...state,
      foods: foodsData as Food[],
      customFoods: state.customFoods || [],
    };
  } catch {
    return {
      profiles: [],
      currentProfileId: null,
      foods: foodsData as Food[],
      customFoods: [],
    };
  }
};

// Guardar estado en localStorage
const saveState = (state: AppState) => {
  const serialized = JSON.stringify({
    profiles: state.profiles,
    currentProfileId: state.currentProfileId,
    customFoods: state.customFoods,
  });
  localStorage.setItem(STORAGE_KEY, serialized);
};

const initialState: AppState = loadState();

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Crear un nuevo perfil de usuario
    createProfile: (state, action: PayloadAction<UserData>) => {
      const id = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const dailyGoals = calculateDailyGoals(action.payload);

      const newProfile: Profile = {
        id,
        userData: action.payload,
        dailyGoals,
        diets: [],
        createdAt: new Date().toISOString(),
      };

      state.profiles.push(newProfile);
      state.currentProfileId = id;
      saveState(state);
    },

    // Cambiar de perfil activo
    setCurrentProfile: (state, action: PayloadAction<string>) => {
      state.currentProfileId = action.payload;
      saveState(state);
    },

    // Actualizar datos de un perfil existente
    updateProfile: (
      state,
      action: PayloadAction<{ id: string; userData: UserData }>,
    ) => {
      const profile = state.profiles.find((p) => p.id === action.payload.id);
      if (profile) {
        profile.userData = action.payload.userData;
        profile.dailyGoals = calculateDailyGoals(action.payload.userData);
        saveState(state);
      }
    },

    // Eliminar un perfil
    deleteProfile: (state, action: PayloadAction<string>) => {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
      if (state.currentProfileId === action.payload) {
        state.currentProfileId = state.profiles[0]?.id || null;
      }
      saveState(state);
    },

    // Crear una nueva dieta dentro de un perfil
    createDiet: (
      state,
      action: PayloadAction<{ profileId: string; name: string }>,
    ) => {
      const profile = state.profiles.find(
        (p) => p.id === action.payload.profileId,
      );
      if (profile) {
        const id = `diet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newDiet: DailyDiet = {
          id,
          name: action.payload.name,
          createdAt: new Date().toISOString(),
          meals: [
            { type: "breakfast", items: [] },
            { type: "lunch", items: [] },
            { type: "snack", items: [] },
            { type: "dinner", items: [] },
          ],
        };
        profile.diets.push(newDiet);
        saveState(state);
      }
    },

    // Actualizar una dieta (cuando añadimos/quitamos alimentos)
    updateDiet: (
      state,
      action: PayloadAction<{ profileId: string; diet: DailyDiet }>,
    ) => {
      const profile = state.profiles.find(
        (p) => p.id === action.payload.profileId,
      );
      if (profile) {
        const dietIndex = profile.diets.findIndex(
          (d) => d.id === action.payload.diet.id,
        );
        if (dietIndex !== -1) {
          profile.diets[dietIndex] = action.payload.diet;
          saveState(state);
        }
      }
    },

    // Eliminar una dieta
    deleteDiet: (
      state,
      action: PayloadAction<{ profileId: string; dietId: string }>,
    ) => {
      const profile = state.profiles.find(
        (p) => p.id === action.payload.profileId,
      );
      if (profile) {
        profile.diets = profile.diets.filter(
          (d) => d.id !== action.payload.dietId,
        );
        saveState(state);
      }
    },

    addCustomFood: (
      state,
      action: PayloadAction<{
        name: string;
        category: string;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        unit: "g" | "unit";
      }>,
    ) => {
      const id = `custom-food-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newFood: Food = {
        id,
        name: action.payload.name,
        category: action.payload.category,
        unit: action.payload.unit,
        image: "🍽️",
        nutritionalInfo: {
          calories:
            action.payload.protein * 4 +
            action.payload.carbs * 4 +
            action.payload.fat * 9,
          protein: action.payload.protein,
          fat: action.payload.fat,
          carbs: action.payload.carbs,
          fiber: action.payload.fiber || 0,
        },
      };

      state.customFoods.push(newFood);
      saveState(state);
    },

    deleteCustomFood: (state, action: PayloadAction<string>) => {
      state.customFoods = state.customFoods.filter(
        (f) => f.id != action.payload,
      );
      saveState(state);
    },

    updateCustomFood: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        category: string;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        unit?: "g" | "unit";
        image?: string;
      }>,
    ) => {
      const foodToUpdateIndex = state.customFoods.findIndex(
        (f) => f.id === action.payload.id,
      );
      if (foodToUpdateIndex !== -1) {
        const existingFood = state.customFoods[foodToUpdateIndex];
        const updatedFood: Food = {
          id: action.payload.id,
          name: action.payload.name,
          category: action.payload.category,
          unit: action.payload.unit || existingFood.unit || "g",
          image: action.payload.image || existingFood.image || "🍽️",
          nutritionalInfo: {
            calories:
              action.payload.protein * 4 +
              action.payload.carbs * 4 +
              action.payload.fat * 9,
            protein: action.payload.protein,
            fat: action.payload.fat,
            carbs: action.payload.carbs,
            fiber: action.payload.fiber || 0,
          },
        };

        // Reemplazar el elemento en el índice encontrado
        state.customFoods[foodToUpdateIndex] = updatedFood;
        saveState(state);
      }
    },
  },
});

export const {
  createProfile,
  setCurrentProfile,
  updateProfile,
  deleteProfile,
  createDiet,
  updateDiet,
  deleteDiet,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
} = appSlice.actions;

export default appSlice.reducer;
