import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Medication, Allergy, Condition, LogEntry, Decision } from "../types";

interface MedicationDetails {
  dosage?: string;
  frequency?: string;
  status?: string;
  condition?: string;
  prescribedBy?: string;
}

interface AppState {
  medications: Medication[];
  allergies: Allergy[];
  conditions: Condition[];
  log: LogEntry[];
  addMedication: (name: string, details?: MedicationDetails) => void;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  addAllergy: (allergy: Omit<Allergy, "id" | "history" | "flagged" | "changedAgo"> & { id?: string }) => void;
  updateAllergy: (id: string, patch: Partial<Allergy>) => void;
  removeAllergy: (id: string) => void;
  addCondition: (condition: Omit<Condition, "id" | "history" | "flagged" | "treatedWith"> & { id?: string }) => void;
  updateCondition: (id: string, patch: Partial<Condition>) => void;
  removeCondition: (id: string) => void;
  addLogEntry: (entry: LogEntry) => void;
  decideLogEntry: (id: string, decision: Decision, contactedProvider?: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);

  const value = useMemo<AppState>(
    () => ({
      medications,
      allergies,
      conditions,
      log,
      addMedication: (name, details) => {
        setMedications((prev) => {
          if (prev.some((m) => m.name.toLowerCase() === name.toLowerCase())) return prev;
          return [
            ...prev,
            {
              id: slugify(name),
              name,
              dosage: details?.dosage ?? "1 x tablet",
              frequency: details?.frequency ?? "As directed",
              status: details?.status,
              condition: details?.condition,
              prescribedBy: details?.prescribedBy,
            },
          ];
        });
      },
      updateMedication: (id, patch) =>
        setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      removeMedication: (id) => setMedications((prev) => prev.filter((m) => m.id !== id)),
      addAllergy: (allergy) =>
        setAllergies((prev) => [
          ...prev,
          {
            id: allergy.id ?? slugify(allergy.name),
            name: allergy.name,
            severityLabel: allergy.severityLabel,
            reactionName: allergy.reactionName,
            reactionSeverity: allergy.reactionSeverity,
            changedAgo: "Active allergy — added just now",
            flagged: [],
            history: [{ label: "Added to profile", date: "Today" }],
          },
        ]),
      updateAllergy: (id, patch) =>
        setAllergies((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      removeAllergy: (id) => setAllergies((prev) => prev.filter((a) => a.id !== id)),
      addCondition: (condition) =>
        setConditions((prev) => [
          ...prev,
          {
            id: condition.id ?? slugify(condition.name),
            name: condition.name,
            statusLabel: condition.statusLabel,
            diagnosisName: condition.diagnosisName,
            diagnosedYear: condition.diagnosedYear,
            treatedWith: [],
            flagged: [],
            history: [{ label: "Added to profile", date: "Today" }],
          },
        ]),
      updateCondition: (id, patch) =>
        setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      removeCondition: (id) => setConditions((prev) => prev.filter((c) => c.id !== id)),
      addLogEntry: (entry) => setLog((prev) => [entry, ...prev]),
      decideLogEntry: (id, decision, contactedProvider) =>
        setLog((prev) =>
          prev.map((e) => (e.id === id ? { ...e, decision, contactedProvider } : e)),
        ),
    }),
    [medications, allergies, conditions, log],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
