import { useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import chevronDown from "../assets/icons/chevron-down.svg";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ChangeHistoryList from "./ChangeHistoryList";
import { DOT_COLOR, SEVERITY_GUIDANCE } from "./SeverityBadge";
import { coreDrugName } from "../lib/drugNames";
import { useAppStore } from "../store/AppStore";
import type { Medication, Severity } from "../types";

const SEVERITY_WORD: Record<Severity, string> = {
  major: "Major interaction",
  moderate: "Moderate interaction",
  minor: "Minor interaction",
  unresolved: "Unverified interaction",
};

export default function MedicationDetailPanel({
  medication,
  onSave,
  onDelete,
}: {
  medication: Medication;
  onSave: (patch: Partial<Medication>) => void;
  onDelete: () => void;
}) {
  const { log } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState(medication.frequency);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [openPair, setOpenPair] = useState<string | null>(null);

  const core = coreDrugName(medication.name);
  const interactions = log
    .flatMap((entry) => entry.result.conflicts ?? [])
    .filter((c) => c.pair.split(" + ").some((n) => coreDrugName(n) === core));
  const unique = [...new Map(interactions.map((c) => [c.pair, c])).values()];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-hidden px-8 py-6">
      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">{medication.name}</p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-teal-700" />
            <p className="text-xs text-slate-600">{medication.status ?? "Currently taking"}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs"
          >
            <img src={editIcon} alt="" className="size-3.5" />
            <span className="text-xs font-medium text-slate-600">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1.5 rounded-sm border border-[#ffc9c9] bg-[#fef2f2] px-3 py-1.5 shadow-xs"
          >
            <img src={trashIcon} alt="" className="size-3.5" />
            <span className="text-xs font-medium text-[#e7000b]">Delete</span>
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDeleteModal
          message="Are you sure you want to delete this medication from your profile?"
          onConfirm={onDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {editing ? (
          <div className="flex w-full flex-col gap-4 rounded-lg bg-slate-100 p-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#101828]">Dosage</label>
              <input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#101828]">Frequency</label>
              <input
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onSave({ dosage, frequency });
                setEditing(false);
              }}
              className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
            >
              <span className="text-sm font-semibold text-white">Save</span>
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3 rounded-lg bg-slate-100 p-4">
            <p className="text-[10px] font-semibold text-slate-600">CONDITION / DOSAGE</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-slate-800">
                {medication.condition || "No condition recorded"}
              </p>
              <p className="text-xs text-slate-600">
                {medication.dosage}, {medication.frequency}
              </p>
              {medication.prescribedBy && (
                <p className="text-xs text-slate-500">Prescribed by {medication.prescribedBy}</p>
              )}
            </div>
            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1">
              <img src={editIcon} alt="" className="size-3.5" />
              <span className="text-xs font-medium text-slate-600">Edit dosage</span>
            </button>
          </div>
        )}

        <div className="flex w-full flex-col gap-3">
          <p className="text-[11px] font-semibold text-slate-600">RELATED INTERACTIONS</p>
          {unique.length === 0 ? (
            <p className="text-xs text-slate-500">
              No interactions found for this medication in your checks so far.
            </p>
          ) : (
            <div className="flex w-full flex-col gap-2">
              {unique.map((c) => {
                const open = openPair === c.pair;
                return (
                  <div key={c.pair} className="flex w-full flex-col rounded-lg bg-slate-100">
                    <button
                      type="button"
                      onClick={() => setOpenPair(open ? null : c.pair)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
                    >
                      <div className={`size-2 shrink-0 rounded ${DOT_COLOR[c.severity]}`} />
                      <div className="flex flex-1 flex-col gap-1.5">
                        <p className="text-[13px] font-semibold text-slate-700">{c.pair}</p>
                        <p className="text-[11px] text-slate-600">{SEVERITY_WORD[c.severity]}</p>
                      </div>
                      <img src={chevronDown} alt="" className={`size-5 shrink-0 ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="flex flex-col gap-2 px-4 pb-3">
                        <p className="whitespace-pre-line text-xs leading-[18px] text-slate-600">{c.detail}</p>
                        <p className="text-xs leading-[18px] text-slate-700">{SEVERITY_GUIDANCE[c.severity]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ChangeHistoryList rows={medication.history ?? [{ label: "Added to profile", date: "Earlier" }]} />
      </div>
    </div>
  );
}
