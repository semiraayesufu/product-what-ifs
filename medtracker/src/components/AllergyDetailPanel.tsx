import editIcon from "../assets/icons/edit.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import FlaggedMedicationList from "./FlaggedMedicationList";
import ChangeHistoryList from "./ChangeHistoryList";
import type { Allergy } from "../types";

export default function AllergyDetailPanel({
  allergy,
  onEdit,
  onDelete,
}: {
  allergy: Allergy;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-hidden px-8 py-6">
      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">{allergy.name}</p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-teal-700" />
            <p className="text-xs text-slate-600">{allergy.changedAgo}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={onEdit}
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

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
        <div className="flex w-full flex-col gap-3 rounded-lg bg-slate-100 p-4">
          <p className="text-[10px] font-semibold text-slate-600">REACTION / SEVERITY</p>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-slate-800">{allergy.reactionName}</p>
            <p className="text-xs text-slate-600">{allergy.reactionSeverity}</p>
          </div>
          <button type="button" onClick={onEdit} className="flex items-center gap-1">
            <img src={editIcon} alt="" className="size-3.5" />
            <span className="text-xs font-medium text-slate-600">Edit reaction</span>
          </button>
        </div>

        <FlaggedMedicationList items={allergy.flagged} />
        <ChangeHistoryList rows={allergy.history} />
      </div>
    </div>
  );
}
