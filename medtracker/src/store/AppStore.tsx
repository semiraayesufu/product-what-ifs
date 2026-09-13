import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Medication, Allergy, Condition, LogEntry, Decision } from "../types";
import {
  MEDICATIONS as INITIAL_MEDICATIONS,
  ALLERGIES as INITIAL_ALLERGIES,
  CONDITIONS as INITIAL_CONDITIONS,
} from "../data/profile";

const INITIAL_LOG: LogEntry[] = [
  {
    id: "ibuprofen-amoxicillin",
    title: "Ibuprofen + Amoxicillin",
    timeLabel: "20 mins ago",
    severity: "major",
    summary: "2 interactions found against your saved profile",
    result: {
      outcome: "found",
      title: "Ibuprofen",
      subtitle: "2 interactions found against your saved profile",
      conflicts: [
        {
          pair: "Ibuprofen + Prednisone",
          severity: "moderate",
          headline: "Increased risk of stomach bleeding and reduced kidney function",
          detail:
            "Taking these together raises the risk of GI bleeding and may worsen kidney strain, especially relevant given your lupus nephritis risk.",
        },
        {
          pair: "Trimethoprim-Sulfamethoxazole + Prednisone",
          severity: "minor",
          headline: "NSAIDS carry added risk with lupus nephritis",
          detail:
            "This is a condition-based caution, not a drug-drug interaction — your rheumatologist may prefer an alternative pain reliever.",
        },
      ],
      addPromptName: "Ibuprofen",
    },
  },
  {
    id: "prednisone-major",
    title: "Prednisone — major interaction",
    timeLabel: "1 hour ago",
    severity: "major",
    summary: "Awaiting your decision",
    result: {
      outcome: "found",
      title: "Prednisone",
      subtitle: "1 interaction found against your saved profile",
      conflicts: [
        {
          pair: "Prednisone + Ibuprofen",
          severity: "major",
          headline: "Increased risk of stomach bleeding and reduced kidney function",
          detail:
            "Taking these together raises the risk of GI bleeding and may worsen kidney strain, especially relevant given your lupus nephritis risk.",
        },
      ],
    },
  },
  {
    id: "mometasone-unresolved",
    title: "Mometasone furuoate - unresolved",
    timeLabel: "3 hours ago",
    severity: "unresolved",
    summary: "Not verified against your profile",
    result: {
      outcome: "unresolved",
      title: "Mometasone furuoate",
      subtitle: "Not verified against your profile",
      addPromptName: "Mometasone furuoate",
    },
  },
  {
    id: "loratadine-erythromycin-recent",
    title: "Loratadine + Erythromycin",
    timeLabel: "2 days ago",
    severity: "major",
    summary: "1 interaction found against your saved profile",
    decision: "proceed",
    result: {
      outcome: "found",
      title: "Loratadine + Erythromycin",
      subtitle: "1 interaction found against your saved profile",
      conflicts: [
        {
          pair: "Loratadine + Erythromycin",
          severity: "major",
          headline: "Erythromycin can raise loratadine levels",
          detail:
            "Erythromycin slows how quickly loratadine is broken down, which can increase the chance of drowsiness or a fast heartbeat. Consult your prescriber before continuing both together.",
        },
      ],
    },
  },
  {
    id: "loratadine-erythromycin-moderate",
    title: "Loratadine + Erythromycin",
    timeLabel: "3 days ago",
    severity: "moderate",
    summary: "Moderate interaction flagged",
    decision: "proceed",
    result: {
      outcome: "found",
      title: "Loratadine + Erythromycin",
      subtitle: "1 interaction found against your saved profile",
      conflicts: [
        {
          pair: "Loratadine + Erythromycin",
          severity: "moderate",
          headline: "Moderate interaction flagged",
          detail: "Review this pair with your prescriber before combining them.",
        },
      ],
    },
  },
  {
    id: "loratadine-erythromycin-minor",
    title: "Loratadine + Erythromycin",
    timeLabel: "5 days ago",
    severity: "minor",
    summary: "Minor interaction flagged",
    decision: "proceed",
    result: {
      outcome: "found",
      title: "Loratadine + Erythromycin",
      subtitle: "1 interaction found against your saved profile",
      conflicts: [
        {
          pair: "Loratadine + Erythromycin",
          severity: "minor",
          headline: "Minor interaction flagged",
          detail: "Low risk, but worth mentioning at your next appointment.",
        },
      ],
    },
  },
  {
    id: "naproxen-contacted",
    title: "Naproxen — contacted Dr. Nwosu",
    timeLabel: "2 days ago",
    severity: "moderate",
    summary: "Awaiting response",
    decision: "contact-provider",
    contactedProvider: "Dr. Nwosu",
    result: {
      outcome: "found",
      title: "Naproxen",
      subtitle: "1 interaction found against your saved profile",
      conflicts: [
        {
          pair: "Naproxen + Prednisone",
          severity: "moderate",
          headline: "Increased GI risk",
          detail: "Your provider was contacted to weigh in before continuing.",
        },
      ],
    },
  },
  {
    id: "amoxicillin-added",
    title: "Amoxicillin added",
    timeLabel: "Today",
    severity: "clear",
    summary: "No documented interaction",
    decision: "proceed",
    result: {
      outcome: "clear",
      title: "Amoxicillin",
      subtitle: "No documented interaction",
      checkedAgainst: "6 medications, 2 allergies, 2 conditions",
      source: "Source: openFDA — checked Aug 20, 2026",
    },
  },
];

interface AppState {
  medications: Medication[];
  allergies: Allergy[];
  conditions: Condition[];
  log: LogEntry[];
  addMedication: (name: string) => void;
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
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [allergies, setAllergies] = useState<Allergy[]>(INITIAL_ALLERGIES);
  const [conditions, setConditions] = useState<Condition[]>(INITIAL_CONDITIONS);
  const [log, setLog] = useState<LogEntry[]>(INITIAL_LOG);

  const value = useMemo<AppState>(
    () => ({
      medications,
      allergies,
      conditions,
      log,
      addMedication: (name) => {
        setMedications((prev) => {
          if (prev.some((m) => m.name.toLowerCase() === name.toLowerCase())) return prev;
          return [
            ...prev,
            { id: slugify(name), name, dosage: "1 x tablet", frequency: "As directed" },
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
