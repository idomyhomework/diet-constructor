// ── Typed Redux Hooks ──────────────────────────────────────────────────────
// Wrappers around useDispatch and useSelector with the app's RootState and
// AppDispatch types baked in, so callers never need to repeat the generics.
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
