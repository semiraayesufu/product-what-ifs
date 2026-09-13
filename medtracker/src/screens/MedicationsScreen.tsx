import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import MedicationRow from "../components/MedicationRow";
import AddMedicationPanel from "../components/AddMedicationPanel";
import MedicationDetailPanel from "../components/MedicationDetailPanel";
import plusIcon from "../assets/icons/plus.svg";
import { MEDICATION_CATALOG } from "../data/profile";
import { useAppStore } from "../store/AppStore";

export default function MedicationsScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { medications, addMedication, updateMedication, removeMedication } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredMedications = useMemo(
    () =>
      medications.filter((m) =>
        m.name.toLowerCase().includes(listQuery.toLowerCase()),
      ),
    [medications, listQuery],
  );

  const matches = useMemo(
    () =>
      MEDICATION_CATALOG.filter(
        (name) =>
          name.toLowerCase().includes(addQuery.toLowerCase()) &&
          !medications.some((m) => m.name.toLowerCase() === name.toLowerCase()),
      ),
    [addQuery, medications],
  );

  const selected = medications.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="medications" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5 bg-white">
            <div className="flex flex-1 flex-col bg-white">
              <p className="text-xl font-semibold text-[#1a1a1a]">Medications</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddQuery("");
                setIsAdding(true);
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
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
                  setSelectedId(medication.id);
                  setIsAdding(false);
                }}
              />
            ))}
            {filteredMedications.length === 0 && (
              <p className="text-sm text-slate-500">No medications match your search.</p>
            )}
          </div>
        </div>

        {isAdding && (
          <AddMedicationPanel
            query={addQuery}
            onQueryChange={setAddQuery}
            matches={matches}
            onBack={() => setIsAdding(false)}
            onClose={() => setIsAdding(false)}
            onSelect={(name) => {
              addMedication(name);
              setIsAdding(false);
            }}
          />
        )}

        {!isAdding && selected && (
          <MedicationDetailPanel
            medication={selected}
            onSave={(patch) => updateMedication(selected.id, patch)}
            onDelete={() => {
              removeMedication(selected.id);
              setSelectedId(null);
            }}
          />
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
