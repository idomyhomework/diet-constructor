import { useState } from "react";
import { useAppSelector } from "./stores/hooks";
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
  /** 
   * @function getCurrentView 
   * @returns {View} 
   * La funcion que devuelve el "View" actual de la aplicación. 
   */
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
    /**
     * En total tenemos 3 páginas "principales" 
     * La de elegir el perfil
     * La de crear el perfil 
     * El Dashboard principal donde esta el contructor de las dietas. 
     */
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
