import chevronDown from "../assets/icons/chevron-down.svg";
import type { FlaggedItem } from "../types";

export default function FlaggedMedicationList({ items }: { items: FlaggedItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[11px] font-semibold text-slate-600">FLAGGED MEDICATION</p>
      <div className="flex w-full flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex w-full items-center gap-2.5 rounded-lg bg-slate-100 px-4 py-3"
          >
            <div className="size-2 shrink-0 rounded bg-[#fb2c36]" />
            <div className="flex flex-1 flex-col gap-1.5">
              <p className="text-[13px] font-semibold text-slate-700">{item.name}</p>
              <p className="text-[11px] text-slate-600">{item.note}</p>
            </div>
            <img src={chevronDown} alt="" className="size-5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
