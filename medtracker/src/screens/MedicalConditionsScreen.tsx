import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import ListRow from "../components/ListRow";
import ConditionDetailPanel from "../components/ConditionDetailPanel";
import ConditionFormPanel, { type ConditionValues } from "../components/ConditionFormPanel";
import EmptyState from "../components/EmptyState";
import cardiogramIcon from "../assets/icons/cardiogram.svg";
import plusIcon from "../assets/icons/plus.svg";
import { useAppStore, slugify } from "../store/AppStore";

type FlowStep = "closed" | "entry";
type ViewMode = "view" | "edit";

export default function MedicalConditionsScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { conditions, medications, addCondition, updateCondition, removeCondition } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(conditions[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  const [flowStep, setFlowStep] = useState<FlowStep>("closed");

  const filtered = useMemo(
    () => conditions.filter((c) => c.name.toLowerCase().includes(listQuery.toLowerCase())),
    [conditions, listQuery],
  );

  const selected = conditions.find((c) => c.id === selectedId) ?? null;

  function openAdd() {
    setFlowStep("entry");
  }

  function closeAddFlow() {
    setFlowStep("closed");
  }

  function handleEntrySave(values: ConditionValues) {
    addCondition({
      name: values.name,
      statusLabel: values.diagnosisDate ? `${values.status}, diagnosed ${values.diagnosisDate}` : values.status,
      diagnosisName: values.name,
      diagnosedYear: values.diagnosisDate ? `Diagnosed ${values.diagnosisDate}` : values.status,
    });
    setSelectedId(slugify(values.name));
    setViewMode("view");
    closeAddFlow();
  }

  const addPanel = (
    <ConditionFormPanel mode="add" onClose={closeAddFlow} onSave={handleEntrySave} submitLabel="Add condition" />
  );

  if (conditions.length === 0 && flowStep === "closed") {
    return (
      <div className="flex h-screen w-full items-start bg-white">
        <div className="flex min-h-0 h-full flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
          <Sidebar active="conditions" onNavigate={onNavigate} />
          <div className="flex h-full min-w-0 flex-1 flex-col gap-6 px-8 py-5">
            <div className="flex w-full items-center gap-5">
              <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Medical conditions</p>
              <button
                type="button"
                onClick={openAdd}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
              >
                <img src={plusIcon} alt="" className="size-4" />
                <span className="text-sm font-semibold text-white">Add condition</span>
              </button>
            </div>
            <EmptyState
              icon={<img src={cardiogramIcon} alt="" className="size-7" />}
              title="No conditions added yet"
              description="Some medications carry added risk with certain conditions, not just other drugs. Add yours so we can catch that too."
              ctaLabel="Add your first condition"
              onCta={openAdd}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="conditions" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Medical conditions</p>
            <button
              type="button"
              onClick={openAdd}
              disabled={flowStep !== "closed"}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
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
                active={condition.id === selectedId && flowStep === "closed"}
                onClick={() => {
                  if (flowStep !== "closed") return;
                  setSelectedId(condition.id);
                  setViewMode("view");
                }}
              />
            ))}
          </div>
        </div>

        {flowStep !== "closed" ? (
          addPanel
        ) : viewMode === "edit" && selected ? (
          <ConditionFormPanel
            mode="edit"
            initialValues={{ name: selected.name, status: selected.statusLabel, diagnosisDate: "" }}
            onClose={() => setViewMode("view")}
            onSave={({ name, diagnosisDate, status }) => {
              updateCondition(selected.id, {
                name,
                statusLabel: diagnosisDate ? `${status}, diagnosed ${diagnosisDate}` : status,
                diagnosisName: name,
                diagnosedYear: diagnosisDate ? `Diagnosed ${diagnosisDate}` : status,
              });
              setViewMode("view");
            }}
            submitLabel="Save"
          />
        ) : selected ? (
          <ConditionDetailPanel
            condition={{
              ...selected,
              treatedWith: medications
                .filter((m) => {
                  const c = (m.condition ?? "").trim().toLowerCase();
                  const n = selected.name.trim().toLowerCase();
                  return c.length > 0 && (c.includes(n) || n.includes(c));
                })
                .map((m) => ({ name: m.name, dosage: `${m.dosage}, ${m.frequency}` })),
            }}
            onEdit={() => setViewMode("edit")}
            onDelete={() => {
              removeCondition(selected.id);
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="flex h-full min-w-0 flex-1 items-center justify-center px-8 py-5">
            <p className="text-sm text-slate-500">Select a condition to see its details.</p>
          </div>
        )}
      </div>

    </div>
  );
}
