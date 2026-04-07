// ── Typed Redux Hooks ──────────────────────────────────────────────────────
// Wrappers around useDispatch and useSelector with the app's RootState and
// AppDispatch types baked in, so callers never need to repeat the generics.
import { useMemo } from "react";
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── useAllFoods ────────────────────────────────────────────────────────────
// Returns the merged list of built-in and custom foods, memoized so that
// components using this hook don't re-render when the reference is stable.
export const useAllFoods = () => {
  const defaultFoods = useAppSelector((state) => state.app.foods);
  const customFoods = useAppSelector((state) => state.app.customFoods);
  return useMemo(() => [...customFoods, ...defaultFoods], [customFoods, defaultFoods]);
};
