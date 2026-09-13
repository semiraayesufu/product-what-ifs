import { useState } from "react";
import type { NavKey } from "./components/Sidebar";
import { AppStoreProvider } from "./store/AppStore";
import DashboardScreen from "./screens/DashboardScreen";
import MedicationsScreen from "./screens/MedicationsScreen";
import AllergiesScreen from "./screens/AllergiesScreen";
import MedicalConditionsScreen from "./screens/MedicalConditionsScreen";
import InteractionCheckerScreen from "./screens/InteractionCheckerScreen";
import HistoryScreen from "./screens/HistoryScreen";

export default function App() {
  const [screen, setScreen] = useState<NavKey>("home");
  const [autoOpenAdd, setAutoOpenAdd] = useState(false);

  function navigate(key: NavKey) {
    setAutoOpenAdd(false);
    setScreen(key);
  }

  function goAddMedication() {
    setAutoOpenAdd(true);
    setScreen("medications");
  }

  let content;
  if (screen === "home") {
    content = <DashboardScreen onNavigate={navigate} onAddMedication={goAddMedication} />;
  } else if (screen === "medications") {
    content = (
      <MedicationsScreen
        onNavigate={navigate}
        autoOpenAdd={autoOpenAdd}
        onAutoOpenAddHandled={() => setAutoOpenAdd(false)}
      />
    );
  } else if (screen === "allergies") {
    content = <AllergiesScreen onNavigate={navigate} />;
  } else if (screen === "conditions") {
    content = <MedicalConditionsScreen onNavigate={navigate} />;
  } else if (screen === "interactions") {
    content = <InteractionCheckerScreen onNavigate={navigate} />;
  } else {
    content = <HistoryScreen onNavigate={navigate} />;
  }

  return <AppStoreProvider>{content}</AppStoreProvider>;
}
