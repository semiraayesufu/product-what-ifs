import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import MedicationRow from "../components/MedicationRow";
import AddMedicationChooser, { type AddMedicationMethod } from "../components/AddMedicationChooser";
import UploadMedicationPanel from "../components/UploadMedicationPanel";
import ManualMedicationForm, { type ManualMedicationValues } from "../components/ManualMedicationForm";
import MedicationDetailPanel from "../components/MedicationDetailPanel";
import StagingReviewPanel from "../components/StagingReviewPanel";
import CheckingPanel from "../components/CheckingPanel";
import ResultPanel from "../components/ResultPanel";
import EmptyState from "../components/EmptyState";
import plusIcon from "../assets/icons/plus.svg";
import medicationsIcon from "../assets/icons/medications.svg";
import { checkMedicationsAgainstProfile, type CheckOutcome } from "../lib/checkMedications";
import { useAppStore } from "../store/AppStore";

type FlowStep = "closed" | "chooser" | "upload" | "entry" | "review" | "checking" | "result";

function formatDosage(values: ManualMedicationValues): string {
  const quantityStrength = [values.quantity, values.strength].filter(Boolean).join(" x ");
  return [quantityStrength, values.form].filter(Boolean).join(" ");
}

export default function MedicationsScreen({
  onNavigate,
  autoOpenAdd,
  onAutoOpenAddHandled,
}: {
  onNavigate?: (key: NavKey) => void;
  autoOpenAdd?: boolean;
  onAutoOpenAddHandled?: () => void;
}) {
  const { medications, allergies, conditions, addMedication, updateMedication, removeMedication, addLogEntry } =
    useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [flowStep, setFlowStep] = useState<FlowStep>("closed");
  const [staged, setStaged] = useState<ManualMedicationValues[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [checkOutcome, setCheckOutcome] = useState<CheckOutcome | null>(null);
  const pendingCheckRef = useRef<Promise<CheckOutcome> | null>(null);

  useEffect(() => {
    if (autoOpenAdd) {
      openChooser();
      onAutoOpenAddHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAdd, onAutoOpenAddHandled]);

  const filteredMedications = useMemo(
    () => medications.filter((m) => m.name.toLowerCase().includes(listQuery.toLowerCase())),
    [medications, listQuery],
  );

  const selected = medications.find((m) => m.id === selectedId) ?? null;

  function openChooser() {
    setStaged([]);
    setEditingIndex(null);
    setUploadedFileName(null);
    setCheckOutcome(null);
    setSelectedId(null);
    setFlowStep("chooser");
  }

  function closeAddFlow() {
    setFlowStep("closed");
    setStaged([]);
    setEditingIndex(null);
    setUploadedFileName(null);
    setCheckOutcome(null);
  }

  function handleEntrySave(values: ManualMedicationValues) {
    if (editingIndex !== null) {
      setStaged((prev) => prev.map((v, i) => (i === editingIndex ? values : v)));
    } else {
      setStaged((prev) => [...prev, values]);
    }
    setEditingIndex(null);
    setFlowStep("review");
  }

  function handleAddAnother() {
    setEditingIndex(null);
    setFlowStep("entry");
  }

  function handleEditStaged(index: number) {
    setEditingIndex(index);
    setFlowStep("entry");
  }

  function handleRemoveStaged(index: number) {
    setStaged((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setFlowStep("entry");
      return next;
    });
  }

  function commitStaged() {
    for (const values of staged) {
      addMedication(values.name, {
        dosage: formatDosage(values) || undefined,
        frequency: values.frequency || undefined,
        status: values.status || undefined,
        condition: values.condition || undefined,
        prescribedBy: values.prescribedBy || undefined,
      });
    }
  }

  function handleContinueToCheck() {
    const items = staged.map((v) => v.name);
    const profileNames = [
      ...medications.map((m) => m.name),
      ...allergies.map((a) => a.name),
      ...conditions.map((c) => c.name),
    ];
    pendingCheckRef.current = checkMedicationsAgainstProfile(items, profileNames);
    setFlowStep("checking");
  }

  async function handleCheckingDone() {
    const outcome = await (
      pendingCheckRef.current ?? checkMedicationsAgainstProfile(staged.map((v) => v.name), [])
    );
    pendingCheckRef.current = null;
    setCheckOutcome(outcome);
    setFlowStep("result");
  }

  function handleConfirmAdd() {
    commitStaged();
    if (checkOutcome) {
      addLogEntry({
        id: `check-${Date.now()}`,
        title: checkOutcome.result.title,
        timeLabel: "Just now",
        severity: checkOutcome.severity,
        summary: checkOutcome.result.subtitle,
        result: checkOutcome.result,
      });
    }
    closeAddFlow();
  }

  const stagedCount = staged.length;

  const addPanel = (() => {
    if (flowStep === "chooser") {
      return (
        <AddMedicationChooser
          onClose={closeAddFlow}
          onSelect={(method: AddMedicationMethod) =>
            setFlowStep(method === "upload" ? "upload" : "entry")
          }
        />
      );
    }
    if (flowStep === "upload") {
      return (
        <UploadMedicationPanel
          onBack={() => setFlowStep("chooser")}
          onClose={closeAddFlow}
          onContinue={(fileName) => {
            setUploadedFileName(fileName);
            setFlowStep("entry");
          }}
        />
      );
    }
    if (flowStep === "entry") {
      const editingValues = editingIndex !== null ? staged[editingIndex] : undefined;
      return (
        <ManualMedicationForm
          onBack={() =>
            setFlowStep(stagedCount > 0 ? "review" : uploadedFileName ? "upload" : "chooser")
          }
          onClose={closeAddFlow}
          onSave={handleEntrySave}
          initialValues={editingValues}
          submitLabel={editingIndex !== null ? "Save changes" : "Add medication"}
        />
      );
    }
    if (flowStep === "review") {
      return (
        <StagingReviewPanel
          heading="Adding medications"
          subtitle={`${stagedCount} medication${stagedCount === 1 ? "" : "s"} ready to check - add as many as you need before adding it to your profile`}
          rows={staged.map((v) => ({
            title: v.name,
            subtitle: formatDosage(v) && v.frequency ? `${formatDosage(v)}, ${v.frequency}` : formatDosage(v) || v.frequency || "No dosage details",
          }))}
          onEdit={handleEditStaged}
          onRemove={handleRemoveStaged}
          note={{
            label: "Why we wait to check",
            body: "Checking multiple medications together catches conflicts between them, not just against what you already take.",
          }}
          addAnotherLabel="Add another medication"
          onAddAnother={handleAddAnother}
          continueLabel="Continue"
          onContinue={handleContinueToCheck}
          onBack={() => setFlowStep("entry")}
          onClose={closeAddFlow}
        />
      );
    }
    if (flowStep === "checking") {
      return (
        <CheckingPanel
          items={staged.map((v) => v.name)}
          medicationCount={medications.length}
          allergyCount={allergies.length}
          conditionCount={conditions.length}
          onDone={handleCheckingDone}
        />
      );
    }
    if (flowStep === "result" && checkOutcome) {
      return (
        <ResultPanel
          data={checkOutcome.result}
          onBack={() => setFlowStep("review")}
          onClose={closeAddFlow}
          onConfirm={handleConfirmAdd}
          confirmLabel={`Add ${stagedCount} medication${stagedCount === 1 ? "" : "s"} to my profile`}
        />
      );
    }
    return null;
  })();

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="medications" onNavigate={onNavigate} />

        {medications.length === 0 && flowStep === "closed" && !selected ? (
          <div className="flex h-full min-w-0 flex-1 flex-col gap-6 px-8 py-5">
            <div className="flex w-full items-center gap-5">
              <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Medications</p>
              <button
                type="button"
                onClick={openChooser}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
              >
                <img src={plusIcon} alt="" className="size-4" />
                <span className="text-sm font-semibold text-white">Add medication</span>
              </button>
            </div>
            <EmptyState
              icon={<img src={medicationsIcon} alt="" className="size-7" />}
              title="No medications yet"
              description="Add what you're currently taking so we can start checking for conflicts as your regimen changes."
              ctaLabel="Add your first medication"
              onCta={openChooser}
            />
          </div>
        ) : (
          <>
            <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5 print:hidden">
              <div className="flex w-full items-center gap-5 bg-white">
                <div className="flex flex-1 flex-col bg-white">
                  <p className="text-xl font-semibold text-[#1a1a1a]">Medications</p>
                </div>
                <button
                  type="button"
                  onClick={openChooser}
                  disabled={flowStep !== "closed"}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <img src={plusIcon} alt="" className="size-4" />
                  <span className="text-sm font-semibold text-white">Add medication</span>
                </button>
              </div>

              <SearchInput value={listQuery} onChange={setListQuery} />

              <div className="flex w-full flex-col gap-3 overflow-y-auto">
                {filteredMedications.map((medication) => (
                  <MedicationRow
                    key={medication.id}
                    medication={medication}
                    active={medication.id === selectedId}
                    onClick={() => {
                      if (flowStep !== "closed") return;
                      setSelectedId(medication.id);
                    }}
                  />
                ))}
                {filteredMedications.length === 0 && (
                  <p className="text-sm text-slate-500">
                    {medications.length === 0
                      ? "No medications yet."
                      : "No medications match your search."}
                  </p>
                )}
              </div>
            </div>

            {flowStep !== "closed" && addPanel}

            {flowStep === "closed" && selected && (
              <MedicationDetailPanel
                key={selected.id}
                medication={selected}
                onSave={(patch) => updateMedication(selected.id, patch)}
                onDelete={() => {
                  removeMedication(selected.id);
                  setSelectedId(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
