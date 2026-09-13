import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import RecentCheckRow from "../components/RecentCheckRow";
import NewCheckPanel from "../components/NewCheckPanel";
import CheckingPanel from "../components/CheckingPanel";
import ResultPanel from "../components/ResultPanel";
import plusIcon from "../assets/icons/plus.svg";
import { MEDICATION_CATALOG } from "../data/profile";
import { useAppStore } from "../store/AppStore";
import type { Decision, LogEntry, ResultData } from "../types";

const IBUPROFEN_RESULT: ResultData = {
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
};

type CheckerState = "idle" | "new" | "checking" | "result";

export default function InteractionCheckerScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { medications, allergies, conditions, log, addMedication, addLogEntry, decideLogEntry } =
    useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [state, setState] = useState<CheckerState>("idle");
  const [selectedId, setSelectedId] = useState<string>(log[0]?.id ?? "");
  const [checkingItems, setCheckingItems] = useState<string[]>([]);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);

  const filteredLog = useMemo(
    () => log.filter((entry) => entry.title.toLowerCase().includes(listQuery.toLowerCase())),
    [log, listQuery],
  );

  const checkedAgainstText = `${medications.length} medications, ${allergies.length} allergies, ${conditions.length} conditions`;

  function buildResult(items: string[]): { result: ResultData; severity: LogEntry["severity"] } {
    const hasIbuprofen = items.some((item) => item.toLowerCase() === "ibuprofen");
    if (hasIbuprofen) return { result: IBUPROFEN_RESULT, severity: "moderate" };

    const unresolvedItem = items.find(
      (item) => !MEDICATION_CATALOG.some((c) => c.toLowerCase() === item.toLowerCase()),
    );
    if (unresolvedItem) {
      return {
        severity: "unresolved",
        result: {
          outcome: "unresolved",
          title: unresolvedItem,
          subtitle: "Not verified against your profile",
          addPromptName: unresolvedItem,
        },
      };
    }

    const newMedication = items.find(
      (item) => !medications.some((m) => m.name.toLowerCase() === item.toLowerCase()),
    );

    return {
      severity: "clear",
      result: {
        outcome: "clear",
        title: items.join(", "),
        subtitle: "No documented interaction",
        checkedAgainst: checkedAgainstText,
        source: "Source: openFDA — checked Aug 20, 2026",
        addPromptName: newMedication,
      },
    };
  }

  function handleSave(items: string[]) {
    setCheckingItems(items);
    setState("checking");
  }

  function handleCheckingDone() {
    const { result, severity } = buildResult(checkingItems);
    const id = `check-${Date.now()}`;
    addLogEntry({
      id,
      title: result.title,
      timeLabel: "Just now",
      severity,
      summary: result.subtitle,
      result,
    });
    setSelectedId(id);
    setPendingEntryId(id);
    setState("result");
  }

  function handleAddMedication(name: string) {
    addMedication(name);
  }

  function backToIdle() {
    setState("idle");
    setPendingEntryId(null);
  }

  const selectedEntry = log.find((entry) => entry.id === selectedId) ?? null;

  const detailPanel = (() => {
    if (state === "new") {
      return <NewCheckPanel onClose={backToIdle} onSave={handleSave} />;
    }
    if (state === "checking") {
      return (
        <CheckingPanel
          items={checkingItems}
          medicationCount={medications.length}
          allergyCount={allergies.length}
          conditionCount={conditions.length}
          onDone={handleCheckingDone}
        />
      );
    }
    const entry = state === "result" && pendingEntryId
      ? log.find((e) => e.id === pendingEntryId)
      : selectedEntry;
    if (entry) {
      return (
        <ResultPanel
          data={entry.result}
          decision={entry.decision}
          onDecide={(decision: Decision) => decideLogEntry(entry.id, decision)}
          onBack={backToIdle}
          onClose={backToIdle}
          onAddMedication={handleAddMedication}
        />
      );
    }
    if (log.length === 0) {
      return (
        <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-4 px-8 py-5">
          <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-teal-100">
            <img src={plusIcon} alt="" className="size-6" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-lg font-semibold text-slate-800">No checks yet</p>
            <p className="w-[320px] text-[13px] text-slate-500">
              Run a check whenever you add a new medication or allergy to see if it conflicts with
              what's already in your profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setState("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
          >
            <img src={plusIcon} alt="" className="size-4" />
            <span className="text-sm font-semibold text-white">New check</span>
          </button>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar
          active="interactions"
          onNavigate={onNavigate}
          disclaimer="It does not diagnose, prescribe, or replace advice from a licensed provider."
        />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <div className="flex flex-1 flex-col">
              <p className="text-xl font-semibold text-[#1a1a1a]">Drug Interaction Checker</p>
            </div>
            <button
              type="button"
              onClick={() => setState("new")}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">New check</span>
            </button>
          </div>

          <SearchInput value={listQuery} onChange={setListQuery} />

          <div className="flex w-full flex-col gap-2 overflow-y-auto">
            {filteredLog.map((entry) => (
              <RecentCheckRow
                key={entry.id}
                check={{
                  id: entry.id,
                  label: entry.title,
                  meta: entry.timeLabel,
                  severity: entry.severity,
                }}
                active={entry.id === selectedId && state === "idle"}
                onClick={() => {
                  setSelectedId(entry.id);
                  setState("idle");
                }}
              />
            ))}
          </div>
        </div>

        {detailPanel}
      </div>
    </div>
  );
}
