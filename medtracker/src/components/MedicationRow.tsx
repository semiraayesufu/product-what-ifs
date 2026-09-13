import chevronRight from "../assets/icons/chevron-right.svg";
import type { Medication } from "../types";

export default function MedicationRow({
  medication,
  active,
  onClick,
}: {
  medication: Medication;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-3 text-left ${
        active ? "bg-slate-100" : "bg-white"
      }`}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-sm font-medium text-slate-800">{medication.name}</p>
        <p className="text-[11px] text-slate-500">
          {medication.dosage} — {medication.frequency}
        </p>
      </div>
      <img src={chevronRight} alt="" className="size-4" />
    </button>
  );
}
