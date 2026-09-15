import { useState } from "react";
import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import editIcon from "../assets/icons/edit.svg";
import trashIcon from "../assets/icons/trash-bin.svg";
import plusIcon from "../assets/icons/plus-teal.svg";
import InlineConfirm from "./InlineConfirm";

export interface StagedRow {
  title: string;
  subtitle: string;
}

export default function StagingReviewPanel({
  heading,
  subtitle,
  rows,
  onEdit,
  onRemove,
  note,
  addAnotherLabel,
  onAddAnother,
  continueLabel = "Continue",
  onContinue,
  onBack,
  onClose,
}: {
  heading: string;
  subtitle: string;
  rows: StagedRow[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  note?: { label: string; body: string };
  addAnotherLabel: string;
  onAddAnother: () => void;
  continueLabel?: string;
  onContinue: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
      <div className="flex w-full items-start justify-between">
        <BackButton onClick={onBack} />
        <button type="button" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xl font-semibold text-slate-800">{heading}</p>
        <p className="text-xs text-slate-600">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) =>
          confirmingIndex === i ? (
            <div
              key={`${row.title}-${i}`}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3"
            >
              <InlineConfirm
                question={`Remove ${row.title}?`}
                onConfirm={() => {
                  onRemove(i);
                  setConfirmingIndex(null);
                }}
                onCancel={() => setConfirmingIndex(null)}
              />
            </div>
          ) : (
            <div
              key={`${row.title}-${i}`}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-sm font-medium text-slate-800">{row.title}</p>
                <p className="truncate text-xs text-slate-500">{row.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(i)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600"
                >
                  <img src={editIcon} alt="" className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingIndex(i)}
                  className="flex items-center gap-1 text-xs font-medium text-[#e7000b]"
                >
                  <img src={trashIcon} alt="" className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-auto flex flex-col gap-4">
        {note && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-slate-100 p-3.5">
            <p className="text-[11px] font-semibold uppercase text-slate-600">{note.label}</p>
            <p className="text-xs leading-4 text-slate-600">{note.body}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onAddAnother}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5"
        >
          <img src={plusIcon} alt="" className="size-4" />
          <span className="text-sm font-semibold text-teal-700">{addAnotherLabel}</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
        >
          <span className="text-sm font-semibold text-white">{continueLabel}</span>
        </button>
      </div>
    </div>
  );
}
