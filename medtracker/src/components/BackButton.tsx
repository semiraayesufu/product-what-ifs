import chevronLeft from "../assets/icons/chevron-left.svg";

export default function BackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group -ml-1.5 flex shrink-0 items-center gap-1 rounded-full py-1 pl-1 pr-2.5 hover:bg-slate-100"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-200">
        <img src={chevronLeft} alt="" className="size-4" />
      </span>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
  );
}
