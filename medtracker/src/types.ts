export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  status?: string;
  condition?: string;
  prescribedBy?: string;
}

export interface FlaggedItem {
  name: string;
  note: string;
}

export interface HistoryRow {
  label: string;
  date: string;
}

export interface Allergy {
  id: string;
  name: string;
  severityLabel: string;
  reactionName: string;
  reactionSeverity: string;
  changedAgo: string;
  flagged: FlaggedItem[];
  history: HistoryRow[];
}

export interface Condition {
  id: string;
  name: string;
  statusLabel: string;
  diagnosisName: string;
  diagnosedYear: string;
  treatedWith: { name: string; dosage: string }[];
  flagged: FlaggedItem[];
  history: HistoryRow[];
}

export type Severity = "major" | "moderate" | "minor" | "unresolved";

export interface ConflictItem {
  pair: string;
  severity: Severity;
  headline: string;
  detail: string;
}

export interface ResultData {
  outcome: "found" | "clear" | "unresolved";
  title: string;
  subtitle: string;
  conflicts?: ConflictItem[];
  checkedAgainst?: string;
  source?: string;
  addPromptName?: string;
}

export type Decision = "proceed" | "contact-provider" | "cancel";

export interface LogEntry {
  id: string;
  title: string;
  timeLabel: string;
  severity: Severity | "clear";
  summary: string;
  result: ResultData;
  decision?: Decision;
  contactedProvider?: string;
}
