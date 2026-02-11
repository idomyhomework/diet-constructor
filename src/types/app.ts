import type { Profile } from "./profile";
import type { Food } from "./food";


export interface AppState {
  profiles: Profile[];
  currentProfileId: string | null;
  foods: Food[];
}