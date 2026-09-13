import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import RecentCheckRow from "../components/RecentCheckRow";
import ResultPanel from "../components/ResultPanel";
import printerIcon from "../assets/icons/printer.svg";
import { useAppStore } from "../store/AppStore";
import type { Decision } from "../types";

export default function HistoryScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { log, addMedication, decideLogEntry } = useAppStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(log[0]?.id ?? null);

  const filtered = useMemo(
    () => log.filter((entry) => entry.title.toLowerCase().includes(query.toLowerCase())),
    [log, query],
  );

  const selected = log.find((entry) => entry.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar
          active="history"
          onNavigate={onNavigate}
          disclaimer="It does not diagnose, prescribe, or replace advice from a licensed provider."
        />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">History</p>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
            >
              <img src={printerIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">Export all</span>
            </button>
          </div>

          <SearchInput value={query} onChange={setQuery} placeholder="Search history" />

          <div className="flex w-full flex-col gap-2 overflow-y-auto">
            {filtered.map((entry) => (
              <RecentCheckRow
                key={entry.id}
                check={{
                  id: entry.id,
                  label: entry.title,
                  meta: entry.timeLabel,
                  severity: entry.severity,
                }}
                active={entry.id === selectedId}
                onClick={() => setSelectedId(entry.id)}
              />
            ))}
            {filtered.length === 0 && log.length > 0 && (
              <p className="text-sm text-slate-500">No history matches your search.</p>
            )}
            {log.length === 0 && (
              <p className="text-sm text-slate-500">
                Nothing here yet — decisions from the Interaction Checker will show up as history.
              </p>
            )}
          </div>
        </div>

        {selected ? (
          <ResultPanel
            data={selected.result}
            decision={selected.decision}
            onDecide={(decision: Decision) => decideLogEntry(selected.id, decision)}
            onBack={() => setSelectedId(null)}
            onClose={() => setSelectedId(null)}
            onAddMedication={addMedication}
          />
        ) : (
          log.length > 0 && (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center px-8 py-5">
              <p className="text-sm text-slate-500">Select an entry to see its details.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
