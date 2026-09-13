import { useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import type { Medication } from "../types";

export default function MedicationDetailPanel({
  medication,
  onSave,
  onDelete,
}: {
  medication: Medication;
  onSave: (patch: Partial<Medication>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState(medication.frequency);
  const [takenToday, setTakenToday] = useState(false);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-6">
      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">{medication.name}</p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-teal-700" />
            <p className="text-xs text-slate-600">
              {medication.dosage} — {medication.frequency}
            </p>
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
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-sm border border-[#ffc9c9] bg-[#fef2f2] px-3 py-1.5 shadow-xs"
          >
            <img src={trashIcon} alt="" className="size-3.5" />
            <span className="text-xs font-medium text-[#e7000b]">Delete</span>
          </button>
        </div>
      </div>

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
          <p className="text-[11px] font-semibold text-slate-600">TODAY'S DOSE</p>
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={takenToday}
              onChange={(e) => setTakenToday(e.target.checked)}
              className="size-4 accent-teal-700"
            />
            <span className="text-sm text-slate-700">
              {takenToday ? "Marked as taken today" : "Mark as taken today"}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
