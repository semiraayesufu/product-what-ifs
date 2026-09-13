import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import ListRow from "../components/ListRow";
import ConditionDetailPanel from "../components/ConditionDetailPanel";
import ConditionFormPanel from "../components/ConditionFormPanel";
import EmptyState from "../components/EmptyState";
import cardiogramIcon from "../assets/icons/cardiogram.svg";
import plusIcon from "../assets/icons/plus.svg";
import { useAppStore, slugify } from "../store/AppStore";

export default function MedicalConditionsScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { conditions, addCondition, updateCondition, removeCondition } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(conditions[0]?.id ?? null);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");

  const filtered = useMemo(
    () => conditions.filter((c) => c.name.toLowerCase().includes(listQuery.toLowerCase())),
    [conditions, listQuery],
  );

  const selected = conditions.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="conditions" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Medical conditions</p>
            <button
              type="button"
              onClick={() => setMode("add")}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">Add condition</span>
            </button>
          </div>

          {conditions.length > 0 && <SearchInput value={listQuery} onChange={setListQuery} />}

          <div className="flex w-full flex-col gap-3 overflow-y-auto">
            {filtered.map((condition) => (
              <ListRow
                key={condition.id}
                title={condition.name}
                subtitle={condition.statusLabel}
                active={condition.id === selectedId && mode === "view"}
                onClick={() => {
                  setSelectedId(condition.id);
                  setMode("view");
                }}
              />
            ))}
          </div>
        </div>

        {mode === "add" ? (
          <ConditionFormPanel
            mode="add"
            onClose={() => setMode("view")}
            onSave={({ name, diagnosisDate, status }) => {
              addCondition({
                name,
                statusLabel: diagnosisDate ? `${status} — diagnosed ${diagnosisDate}` : status,
                diagnosisName: name,
                diagnosedYear: diagnosisDate ? `Diagnosed ${diagnosisDate}` : status,
              });
              setSelectedId(slugify(name));
              setMode("view");
            }}
          />
        ) : mode === "edit" && selected ? (
          <ConditionFormPanel
            mode="edit"
            initial={selected}
            onClose={() => setMode("view")}
            onSave={({ name, diagnosisDate, status }) => {
              updateCondition(selected.id, {
                name,
                statusLabel: diagnosisDate ? `${status} — diagnosed ${diagnosisDate}` : status,
                diagnosisName: name,
                diagnosedYear: diagnosisDate ? `Diagnosed ${diagnosisDate}` : status,
              });
              setMode("view");
            }}
          />
        ) : selected ? (
          <ConditionDetailPanel
            condition={selected}
            onEdit={() => setMode("edit")}
            onDelete={() => {
              removeCondition(selected.id);
              setSelectedId(null);
            }}
          />
        ) : conditions.length === 0 ? (
          <div className="flex h-full min-w-0 flex-1 flex-col px-8 py-5">
            <EmptyState
              icon={<img src={cardiogramIcon} alt="" className="size-7" />}
              title="No conditions added yet"
              description="Some medications carry added risk with certain conditions, not just other drugs. Add yours so we can catch that too."
              ctaLabel="Add your first condition"
              onCta={() => setMode("add")}
            />
          </div>
        ) : (
          <div className="flex h-full min-w-0 flex-1 items-center justify-center px-8 py-5">
            <p className="text-sm text-slate-500">Select a condition to see its details.</p>
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-5 py-3.5 text-slate-600">
        <p className="text-[13px] font-bold">ⓘ</p>
        <p className="text-xs">
          MedTracker shares information only — It is not a replacement for professional medical advice. — It does not diagnose, prescribe, or replace advice from a licensed provider.
        </p>
      </div>
    </div>
  );
}
