import { useState } from "react";
import closeIcon from "../assets/icons/close.svg";
import angleDown from "../assets/icons/angle-down.svg";
import { CONDITION_STATUS_OPTIONS } from "../data/profile";
import type { Condition } from "../types";

export default function ConditionFormPanel({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  initial?: Condition;
  onClose: () => void;
  onSave: (values: { name: string; diagnosisDate: string; status: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [status, setStatus] = useState(CONDITION_STATUS_OPTIONS[0]);

  const canSave = name.trim().length > 0;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full items-center gap-5">
        <p className="flex-1 text-xl font-semibold text-slate-800">
          {mode === "add" ? "Add condition" : "Edit condition"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] shadow-xs"
        >
          <img src={closeIcon} alt="Close" className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Condition</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search or type - e.g. Lupus"
            autoFocus
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Diagnosis date (Optional)</label>
          <input
            value={diagnosisDate}
            onChange={(e) => setDiagnosisDate(e.target.value)}
            placeholder="MM/YYYY"
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none"
            >
              {CONDITION_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <img
              src={angleDown}
              alt=""
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={() => onSave({ name, diagnosisDate, status })}
        className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-sm font-semibold text-white">Save</span>
      </button>
    </div>
  );
}
