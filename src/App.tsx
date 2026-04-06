import { useState } from "react";
import { useAppSelector } from "./stores/hooks";
import ProfileSelector from "./components/ProfileSelector";
import ProfileForm from "./components/ProfileForm";
import Dashboard from "./components/Dashboard";

// ── Types ──────────────────────────────────────────────────────────────────
type View = "selector" | "createProfile" | "dashboard";

// ── App ────────────────────────────────────────────────────────────────────
// Root component. Manages which of the three top-level screens is active:
//   selector     → choose an existing profile
//   createProfile → fill in the new-profile form
//   dashboard    → the main diet-builder screen
export default function App() {
  const currentProfileId = useAppSelector(
    (state) => state.app.currentProfileId,
  );
  const profiles = useAppSelector((state) => state.app.profiles);
  const [view, setView] = useState<View>("selector");

  // ── View Resolution ──────────────────────────────────────────────────────
  // If a valid profile is selected, always show the dashboard.
  // Otherwise honour the local `view` state (selector or createProfile).
  const getCurrentView = (): View => {
    if (currentProfileId && profiles.find((p) => p.id === currentProfileId)) {
      return "dashboard";
    }
    if (view === "createProfile") {
      return "createProfile";
    }
    return "selector";
  };

  const currentView = getCurrentView();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-bg">
      {currentView === "selector" && (
        <ProfileSelector onCreateNew={() => setView("createProfile")} />
      )}
      {currentView === "createProfile" && (
        <ProfileForm onCancel={() => setView("selector")} />
      )}
      {currentView === "dashboard" && <Dashboard />}
    </div>
  );
}
