import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Medication, Allergy, Condition, LogEntry, Decision } from "../types";

const STORAGE_KEY = "medtracker:profile:v1";

interface PersistedState {
  medications: Medication[];
  allergies: Allergy[];
  conditions: Condition[];
  log: LogEntry[];
}

const EMPTY_STATE: PersistedState = { medications: [], allergies: [], conditions: [], log: [] };

const BACKUP_PREFIX = "MEDTRACKER-V1:";

// A transfer code isn't a sync mechanism — it's a one-time snapshot the
// patient copies onto a second device, since the app has no backend or
// accounts to sync through automatically.
function encodeBackup(state: PersistedState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return BACKUP_PREFIX + btoa(binary);
}

function decodeBackup(code: string): PersistedState {
  const trimmed = code.trim();
  if (!trimmed.startsWith(BACKUP_PREFIX)) {
    throw new Error("That doesn't look like a MedTracker transfer code.");
  }
  const binary = atob(trimmed.slice(BACKUP_PREFIX.length));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (
    !Array.isArray(parsed.medications) ||
    !Array.isArray(parsed.allergies) ||
    !Array.isArray(parsed.conditions) ||
    !Array.isArray(parsed.log)
  ) {
    throw new Error("That code is missing some profile data.");
  }
  return parsed;
}

// Persisted to the browser's local storage so a profile and decision log
// survive a refresh or a return visit, not just the current session. Reads
// and writes are wrapped in try/catch since localStorage can throw (private
// browsing, quota exceeded, or disabled entirely) and that should degrade to
// an in-memory-only session rather than crash the app.
function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      log: Array.isArray(parsed.log) ? parsed.log : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

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
  removeLogEntry: (id: string) => void;
  /** A copyable snapshot of the whole profile, for moving it to another device. */
  exportBackupCode: () => string;
  /** Replaces the current profile with one decoded from a transfer code. Throws on invalid input. */
  importBackupCode: (code: string) => void;
}

const AppContext = createContext<AppState | null>(null);

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadPersistedState);
  const [medications, setMedications] = useState<Medication[]>(initial.medications);
  const [allergies, setAllergies] = useState<Allergy[]>(initial.allergies);
  const [conditions, setConditions] = useState<Condition[]>(initial.conditions);
  const [log, setLog] = useState<LogEntry[]>(initial.log);

  useEffect(() => {
    try {
      const state: PersistedState = { medications, allergies, conditions, log };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private browsing, quota, disabled) — the
      // session still works, it just won't survive a refresh.
    }
  }, [medications, allergies, conditions, log]);

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
              history: [{ label: "Added to profile", date: todayLabel() }],
            },
          ];
        });
      },
      updateMedication: (id, patch) =>
        setMedications((prev) =>
          prev.map((m) => {
            if (m.id !== id) return m;
            const history = [...(m.history ?? [])];
            if (patch.dosage !== undefined && patch.dosage !== m.dosage) {
              history.unshift({ label: `Dose changed: ${m.dosage} to ${patch.dosage}`, date: todayLabel() });
            }
            if (patch.frequency !== undefined && patch.frequency !== m.frequency) {
              history.unshift({ label: `Frequency changed: ${m.frequency} to ${patch.frequency}`, date: todayLabel() });
            }
            return { ...m, ...patch, history };
          }),
        ),
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
            changedAgo: "Active allergy, added just now",
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
      removeLogEntry: (id) => setLog((prev) => prev.filter((e) => e.id !== id)),
      exportBackupCode: () => encodeBackup({ medications, allergies, conditions, log }),
      importBackupCode: (code) => {
        const next = decodeBackup(code);
        setMedications(next.medications);
        setAllergies(next.allergies);
        setConditions(next.conditions);
        setLog(next.log);
      },
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
