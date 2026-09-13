import { useState } from "react";
import type { NavKey } from "./components/Sidebar";
import { AppStoreProvider } from "./store/AppStore";
import DashboardScreen from "./screens/DashboardScreen";
import MedicationsScreen from "./screens/MedicationsScreen";
import AllergiesScreen from "./screens/AllergiesScreen";
import MedicalConditionsScreen from "./screens/MedicalConditionsScreen";
import InteractionCheckerScreen from "./screens/InteractionCheckerScreen";
import HistoryScreen from "./screens/HistoryScreen";

const SCREENS: Record<NavKey, React.ComponentType<{ onNavigate: (key: NavKey) => void }>> = {
  home: DashboardScreen,
  medications: MedicationsScreen,
  allergies: AllergiesScreen,
  conditions: MedicalConditionsScreen,
  interactions: InteractionCheckerScreen,
  history: HistoryScreen,
};

export default function App() {
  const [screen, setScreen] = useState<NavKey>("home");
  const Screen = SCREENS[screen];

  return (
    <AppStoreProvider>
      <Screen onNavigate={setScreen} />
    </AppStoreProvider>
  );
}
