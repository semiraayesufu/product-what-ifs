import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import ListRow from "../components/ListRow";
import ConditionDetailPanel from "../components/ConditionDetailPanel";
import ConditionFormPanel, { type ConditionValues } from "../components/ConditionFormPanel";
import StagingReviewPanel from "../components/StagingReviewPanel";
import EmptyState from "../components/EmptyState";
import cardiogramIcon from "../assets/icons/cardiogram.svg";
import plusIcon from "../assets/icons/plus.svg";
import { useAppStore, slugify } from "../store/AppStore";

type FlowStep = "closed" | "entry" | "review";
type ViewMode = "view" | "edit";

export default function MedicalConditionsScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { conditions, addCondition, updateCondition, removeCondition } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(conditions[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  const [flowStep, setFlowStep] = useState<FlowStep>("closed");
  const [staged, setStaged] = useState<ConditionValues[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => conditions.filter((c) => c.name.toLowerCase().includes(listQuery.toLowerCase())),
    [conditions, listQuery],
  );

  const selected = conditions.find((c) => c.id === selectedId) ?? null;

  function openAdd() {
    setStaged([]);
    setEditingIndex(null);
    setFlowStep("entry");
  }

  function closeAddFlow() {
    setFlowStep("closed");
    setStaged([]);
    setEditingIndex(null);
  }

  function handleEntrySave(values: ConditionValues) {
    if (editingIndex !== null) {
      setStaged((prev) => prev.map((v, i) => (i === editingIndex ? values : v)));
    } else {
      setStaged((prev) => [...prev, values]);
    }
    setEditingIndex(null);
    setFlowStep("review");
  }

  function handleRemoveStaged(index: number) {
    setStaged((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setFlowStep("entry");
      return next;
    });
  }

  function handleContinue() {
    let lastName = "";
    for (const values of staged) {
      addCondition({
        name: values.name,
        statusLabel: values.diagnosisDate
          ? `${values.status} — diagnosed ${values.diagnosisDate}`
          : values.status,
        diagnosisName: values.name,
        diagnosedYear: values.diagnosisDate ? `Diagnosed ${values.diagnosisDate}` : values.status,
      });
      lastName = values.name;
    }
    setSelectedId(slugify(lastName));
    closeAddFlow();
  }

  const stagedCount = staged.length;

  const addPanel = (() => {
    if (flowStep === "entry") {
      const editingValues = editingIndex !== null ? staged[editingIndex] : undefined;
      return (
        <ConditionFormPanel
          mode="add"
          initialValues={editingValues}
          onBack={stagedCount > 0 ? () => setFlowStep("review") : undefined}
          onClose={closeAddFlow}
          onSave={handleEntrySave}
          submitLabel={editingIndex !== null ? "Save changes" : "Add condition"}
        />
      );
    }
    if (flowStep === "review") {
      return (
        <StagingReviewPanel
          heading="Adding conditions"
          subtitle={`${stagedCount} condition${stagedCount === 1 ? "" : "s"} ready to add - add as many as you need before saving to your profile`}
          rows={staged.map((v) => ({
            title: v.name,
            subtitle: v.diagnosisDate ? `${v.status} — diagnosed ${v.diagnosisDate}` : v.status,
          }))}
          onEdit={(i) => {
            setEditingIndex(i);
            setFlowStep("entry");
          }}
          onRemove={handleRemoveStaged}
          addAnotherLabel="Add another condition"
          onAddAnother={() => {
            setEditingIndex(null);
            setFlowStep("entry");
          }}
          continueLabel={`Add ${stagedCount} condition${stagedCount === 1 ? "" : "s"} to profile`}
          onContinue={handleContinue}
          onBack={() => setFlowStep("entry")}
          onClose={closeAddFlow}
        />
      );
    }
    return null;
  })();

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
                statusLabel: diagnosisDate ? `${status} — diagnosed ${diagnosisDate}` : status,
                diagnosisName: name,
                diagnosedYear: diagnosisDate ? `Diagnosed ${diagnosisDate}` : status,
              });
              setViewMode("view");
            }}
            submitLabel="Save"
          />
        ) : selected ? (
          <ConditionDetailPanel
            condition={selected}
            onEdit={() => setViewMode("edit")}
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
              onCta={openAdd}
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
