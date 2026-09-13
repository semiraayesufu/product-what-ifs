import chevronRight from "../assets/icons/chevron-right.svg";

export default function ListRow({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-3.5 py-3 text-left ${
        active ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <img src={chevronRight} alt="" className="size-4 shrink-0" />
    </button>
  );
}
