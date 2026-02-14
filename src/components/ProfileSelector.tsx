import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import { setCurrentProfile, deleteProfile } from "../stores/appSlice";

interface ProfileSelectorProps {
  onCreateNew: () => void;
}

export default function ProfileSelector({ onCreateNew }: ProfileSelectorProps) {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((state) => state.app.profiles);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  const handleSelectProfile = (id: string) => {
    dispatch(setCurrentProfile(id));
  };

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar este perfil?")) {
      dispatch(deleteProfile(id));
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-5xl font-display font-bold text-white mb-16 text-center tracking-tight">
          ¿Quién eres?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredProfile(profile.id)}
              onMouseLeave={() => setHoveredProfile(null)}
              onClick={() => handleSelectProfile(profile.id)}
            >
              <div className="relative overflow-hidden rounded-lg border-4 border-transparent hover:border-accent-primary transition-all duration-300 transform hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <span className="text-6xl">👤</span>
                </div>
                {hoveredProfile === profile.id && (
                  <button
                    onClick={(e) => handleDeleteProfile(e, profile.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors z-10"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-white text-center mt-4 font-medium text-lg group-hover:text-accent-primary transition-colors">
                {profile.userData.name}
              </p>
            </div>
          ))}

          <div onClick={onCreateNew} className="relative group cursor-pointer">
            <div className="aspect-square rounded-lg border-4 border-dashed border-dark-border hover:border-accent-primary transition-all duration-300 transform hover:scale-105 flex items-center justify-center bg-dark-card">
              <div className="text-center">
                <span className="text-5xl text-gray-600 group-hover:text-accent-primary transition-colors">
                  +
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-center mt-4 font-medium text-lg group-hover:text-accent-primary transition-colors">
              Nuevo Perfil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
