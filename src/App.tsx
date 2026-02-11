import { useState } from "react";
// import { useAppSelector } from './store/hooks';
import ProfileSelector from "./components/ProfileSelector";
import ProfileForm from "./components/ProfileForm";
import Dashboard from "./components/Dashboard";

type View = "selector" | "createProfile" | "dashboard";

export default function App() {
  const currentProfileId = useAppSelector(
    (state) => state.app.currentProfileId,
  );
  const profiles = useAppSelector((state) => state.app.profiles);
  const [view, setView] = useState<View>("selector");

  // Determine current view based on state
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
