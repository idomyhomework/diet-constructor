// ── Imports ────────────────────────────────────────────────────────────────
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../types/app";
import type { Profile } from "../types/profile";
import type { UserData, ActivityLevel } from "../types/user";
import type { DailyDiet, DayPlan } from "../types/diet";
import type { Food, NutritionalInfo } from "../types/food";
import { calculateDailyGoals, calculateCalories } from "../utils/calculations";
import foodsData from "../data/foods.json";

const STORAGE_KEY = "diet-tracker-state";

// ── createEmptyDays ────────────────────────────────────────────────────────
// Builds 7 blank DayPlan slots. Each slot defaults to the given activity
// level (pass 3 for moderate when no specific level is known).
const createEmptyDays = (defaultActivity: ActivityLevel): DayPlan[] =>
  ([0, 1, 2, 3, 4, 5, 6] as DayPlan["dayIndex"][]).map((dayIndex) => ({
    dayIndex,
    activityLevel: defaultActivity,
    meals: [
      { type: "breakfast" as const, items: [] },
      { type: "lunch" as const, items: [] },
      { type: "snack" as const, items: [] },
      { type: "dinner" as const, items: [] },
    ],
  }));

// ── State Persistence ──────────────────────────────────────────────────────
// Profiles and custom foods are saved to localStorage on every mutation.
// The built-in foods list is always re-derived from foods.json at load time
// so that calorie values stay in sync with the macro data.

const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return {
        profiles: [],
        currentProfileId: null,
        foods: foodsData.map((food) => ({
          ...food,
          nutritionalInfo: {
            ...food.nutritionalInfo,
            calories: calculateCalories(food.nutritionalInfo as Omit<NutritionalInfo, "calories">),
          },
        })) as Food[],
        customFoods: [],
      };
    }
    const state = JSON.parse(serialized);
    return {
      ...state,
      foods: foodsData.map((food) => ({
        ...food,
        nutritionalInfo: {
          ...food.nutritionalInfo,
          calories: calculateCalories(food.nutritionalInfo as Omit<NutritionalInfo, "calories">),
        },
      })) as Food[],
      customFoods: state.customFoods || [],
      // ── Migration ─────────────────────────────────────────────────────────
      // Diets created before the weekly-planner feature stored meals: Meal[]
      // at the top level. Convert them to the new days: DayPlan[] format,
      // placing the old meals into Monday (dayIndex 0).
      profiles: (state.profiles || []).map((p: any) => ({
        ...p,
        diets: (p.diets || []).map((d: any) => {
          if (Array.isArray(d.meals)) {
            const days = createEmptyDays(3);
            days[0] = { ...days[0], meals: d.meals };
            return { id: d.id, name: d.name, createdAt: d.createdAt, days };
          }
          return d;
        }),
      })),
    };
  } catch {
    return {
      profiles: [],
      currentProfileId: null,
      foods: foodsData.map((food) => ({
        ...food,
        nutritionalInfo: {
          ...food.nutritionalInfo,
          calories: calculateCalories(food.nutritionalInfo as Omit<NutritionalInfo, "calories">),
        },
      })) as Food[],
      customFoods: [],
    };
  }
};

const saveState = (state: AppState) => {
  const serialized = JSON.stringify({
    profiles: state.profiles,
    currentProfileId: state.currentProfileId,
    customFoods: state.customFoods,
  });
  localStorage.setItem(STORAGE_KEY, serialized);
};

// ── Initial State ──────────────────────────────────────────────────────────
const initialState: AppState = loadState();

// ── Reducers ───────────────────────────────────────────────────────────────
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // ── createProfile ──────────────────────────────────────────────────────
    // Creates a new user profile with auto-computed daily nutritional goals.
    createProfile: (state, action: PayloadAction<UserData>) => {
      const id = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const dailyGoals = calculateDailyGoals(action.payload, 3);

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

    // ── setCurrentProfile ──────────────────────────────────────────────────
    // Switches the active profile. Pass an empty string to deselect.
    setCurrentProfile: (state, action: PayloadAction<string>) => {
      state.currentProfileId = action.payload;
      saveState(state);
    },

    // ── updateProfile ──────────────────────────────────────────────────────
    // Replaces a profile's user data and recalculates its daily goals.
    updateProfile: (
      state,
      action: PayloadAction<{ id: string; userData: UserData }>,
    ) => {
      const profile = state.profiles.find((p) => p.id === action.payload.id);
      if (profile) {
        profile.userData = action.payload.userData;
        profile.dailyGoals = calculateDailyGoals(action.payload.userData, 3);
        saveState(state);
      }
    },

    // ── deleteProfile ──────────────────────────────────────────────────────
    // Removes a profile. Falls back to the first remaining profile if the
    // deleted one was the active profile.
    deleteProfile: (state, action: PayloadAction<string>) => {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
      if (state.currentProfileId === action.payload) {
        state.currentProfileId = state.profiles[0]?.id || null;
      }
      saveState(state);
    },

    // ── createDiet ─────────────────────────────────────────────────────────
    // Adds a new weekly diet to a profile. All 7 days start at activity
    // level 3 (moderate); the user adjusts each day in the DietBuilder.
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
          days: createEmptyDays(3),
        };
        profile.diets.push(newDiet);
        saveState(state);
      }
    },

    // ── updateDiet ─────────────────────────────────────────────────────────
    // Replaces a diet's full data (meals + items) within a profile.
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

    // ── deleteDiet ─────────────────────────────────────────────────────────
    // Removes a diet from a profile by ID.
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

    // ── addCustomFood ──────────────────────────────────────────────────────
    // Creates a user-defined food entry. Calories are derived from macros.
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
          calories: calculateCalories(action.payload),
          protein: action.payload.protein,
          fat: action.payload.fat,
          carbs: action.payload.carbs,
          fiber: action.payload.fiber || 0,
        },
      };

      state.customFoods.push(newFood);
      saveState(state);
    },

    // ── deleteCustomFood ───────────────────────────────────────────────────
    // Removes a custom food by ID.
    deleteCustomFood: (state, action: PayloadAction<string>) => {
      state.customFoods = state.customFoods.filter(
        (f) => f.id !== action.payload,
      );
      saveState(state);
    },

    // ── updateCustomFood ───────────────────────────────────────────────────
    // Updates an existing custom food. Calories are re-derived from macros.
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
            calories: calculateCalories(action.payload),
            protein: action.payload.protein,
            fat: action.payload.fat,
            carbs: action.payload.carbs,
            fiber: action.payload.fiber || 0,
          },
        };

        state.customFoods[foodToUpdateIndex] = updatedFood;
        saveState(state);
      }
    },
  },
});

// ── Actions ────────────────────────────────────────────────────────────────
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
