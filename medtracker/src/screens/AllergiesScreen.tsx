import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import ListRow from "../components/ListRow";
import AllergyDetailPanel from "../components/AllergyDetailPanel";
import AllergyFormPanel, { type AllergyValues } from "../components/AllergyFormPanel";
import StagingReviewPanel from "../components/StagingReviewPanel";
import EmptyState from "../components/EmptyState";
import plusIcon from "../assets/icons/plus.svg";
import shieldAlertIcon from "../assets/icons/shield-alert.svg";
import { useAppStore, slugify } from "../store/AppStore";

type FlowStep = "closed" | "entry" | "review";
type ViewMode = "view" | "edit";

export default function AllergiesScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { allergies, addAllergy, updateAllergy, removeAllergy } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(allergies[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  const [flowStep, setFlowStep] = useState<FlowStep>("closed");
  const [staged, setStaged] = useState<AllergyValues[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => allergies.filter((a) => a.name.toLowerCase().includes(listQuery.toLowerCase())),
    [allergies, listQuery],
  );

  const selected = allergies.find((a) => a.id === selectedId) ?? null;

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

  function handleEntrySave(values: AllergyValues) {
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
      addAllergy({
        name: values.name,
        severityLabel: values.severity,
        reactionName: values.reactionName,
        reactionSeverity: `${values.severity} reaction`,
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
        <AllergyFormPanel
          mode="add"
          initialValues={editingValues}
          onBack={stagedCount > 0 ? () => setFlowStep("review") : undefined}
          onClose={closeAddFlow}
          onSave={handleEntrySave}
          submitLabel={editingIndex !== null ? "Save changes" : "Add allergy"}
        />
      );
    }
    if (flowStep === "review") {
      return (
        <StagingReviewPanel
          heading="Adding allergies"
          subtitle={`${stagedCount} allerg${stagedCount === 1 ? "y" : "ies"} ready to add - add as many as you need before saving to your profile`}
          rows={staged.map((v) => ({
            title: v.name,
            subtitle: `${v.severity}, ${v.reactionName}`,
          }))}
          onEdit={(i) => {
            setEditingIndex(i);
            setFlowStep("entry");
          }}
          onRemove={handleRemoveStaged}
          addAnotherLabel="Add another allergy"
          onAddAnother={() => {
            setEditingIndex(null);
            setFlowStep("entry");
          }}
          continueLabel={`Add ${stagedCount} allerg${stagedCount === 1 ? "y" : "ies"} to profile`}
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
        <Sidebar active="allergies" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Allergies</p>
            <button
              type="button"
              onClick={openAdd}
              disabled={flowStep !== "closed"}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">Add allergy</span>
            </button>
          </div>

          {allergies.length > 0 && <SearchInput value={listQuery} onChange={setListQuery} />}

          <div className="flex w-full flex-col gap-3 overflow-y-auto">
            {filtered.map((allergy) => (
              <ListRow
                key={allergy.id}
                title={allergy.name}
                subtitle={allergy.severityLabel}
                active={allergy.id === selectedId && flowStep === "closed"}
                onClick={() => {
                  if (flowStep !== "closed") return;
                  setSelectedId(allergy.id);
                  setViewMode("view");
                }}
              />
            ))}
          </div>
        </div>

        {flowStep !== "closed" ? (
          addPanel
        ) : viewMode === "edit" && selected ? (
          <AllergyFormPanel
            mode="edit"
            initialValues={{
              name: selected.name,
              reactionName: selected.reactionName,
              severity: selected.severityLabel,
            }}
            onClose={() => setViewMode("view")}
            onSave={({ name, reactionName, severity }) => {
              updateAllergy(selected.id, {
                name,
                severityLabel: severity,
                reactionName,
                reactionSeverity: `${severity} reaction`,
              });
              setViewMode("view");
            }}
            submitLabel="Save"
          />
        ) : selected ? (
          <AllergyDetailPanel
            allergy={selected}
            onEdit={() => setViewMode("edit")}
            onDelete={() => {
              removeAllergy(selected.id);
              setSelectedId(null);
            }}
          />
        ) : allergies.length === 0 ? (
          <div className="flex h-full min-w-0 flex-1 flex-col px-8 py-5">
            <EmptyState
              icon={<img src={shieldAlertIcon} alt="" className="size-7" />}
              title="No allergies recorded"
              description="Add any known allergies so we can check new medications against them automatically, from day one."
              ctaLabel="Add your first allergy"
              onCta={openAdd}
            />
          </div>
        ) : (
          <div className="flex h-full min-w-0 flex-1 items-center justify-center px-8 py-5">
            <p className="text-sm text-slate-500">Select an allergy to see its details.</p>
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-5 py-3.5 text-slate-600">
        <p className="text-[13px] font-bold">ⓘ</p>
        <p className="text-xs">
          MedTracker shares information only. It is not a replacement for professional medical advice. It does not diagnose, prescribe, or replace advice from a licensed provider.
        </p>
      </div>
    </div>
  );
}
