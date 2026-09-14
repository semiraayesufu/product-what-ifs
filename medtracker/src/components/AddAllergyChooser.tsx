import closeIcon from "../assets/icons/close.svg";
import searchIcon from "../assets/icons/search.svg";
import editIcon from "../assets/icons/edit.svg";
import chevronRight from "../assets/icons/chevron-right.svg";

const OPTIONS = [
  {
    key: "search" as const,
    icon: searchIcon,
    title: "Search",
    description: "Find it in our medication database",
  },
  {
    key: "manual" as const,
    icon: editIcon,
    title: "Manual entry",
    description: "Type in the name and details yourself",
  },
];

export type AddAllergyMethod = "search" | "manual";

export default function AddAllergyChooser({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (method: AddAllergyMethod) => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">Add allergy</p>
          <p className="text-xs text-slate-600">How would you like to add this allergy?</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] shadow-xs"
        >
          <img src={closeIcon} alt="Close" className="size-3.5" />
        </button>
      </div>

      <div className="flex w-full flex-col gap-4">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] shadow-xs">
              <img src={option.icon} alt="" className="size-3.5" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 text-left">
              <p className="text-sm font-medium text-slate-800">{option.title}</p>
              <p className="text-[11px] text-slate-500">{option.description}</p>
            </div>
            <img src={chevronRight} alt="" className="size-4 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
