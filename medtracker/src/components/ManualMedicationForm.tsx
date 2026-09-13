import { useMemo, useState } from "react";
import arrowLeft from "../assets/icons/arrow-left.svg";
import closeIcon from "../assets/icons/close.svg";
import angleDown from "../assets/icons/angle-down.svg";
import {
  MEDICATION_CATALOG,
  MEDICATION_STATUS_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  MEDICATION_STRENGTH_OPTIONS,
  MEDICATION_QUANTITY_OPTIONS,
  MEDICATION_FREQUENCY_OPTIONS,
} from "../data/profile";

export interface ManualMedicationValues {
  name: string;
  status: string;
  condition: string;
  form: string;
  strength: string;
  quantity: string;
  frequency: string;
  prescribedBy: string;
}

function Select({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#101828]">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-xs focus:outline-none ${
            value ? "text-slate-800" : "text-slate-500"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
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
  );
}

export default function ManualMedicationForm({
  onBack,
  onClose,
  onSave,
  initialName,
}: {
  onBack: () => void;
  onClose: () => void;
  onSave: (values: ManualMedicationValues) => void;
  initialName?: string;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [form, setForm] = useState("");
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState("");
  const [frequency, setFrequency] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");

  const suggestions = useMemo(() => {
    if (!name.trim()) return [];
    return MEDICATION_CATALOG.filter((c) => c.toLowerCase().includes(name.toLowerCase())).slice(
      0,
      5,
    );
  }, [name]);

  const canContinue = name.trim().length > 0;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-5">
      <div className="flex w-full items-start justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5">
          <img src={arrowLeft} alt="" className="size-3.5" />
          <span className="text-xs font-medium text-slate-700">Back</span>
        </button>
        <button type="button" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xl font-semibold text-slate-800">Enter medication manually</p>
        <p className="text-xs text-slate-600">
          Provide more details about the medication dose for better tracking
        </p>
      </div>

      <div className="flex flex-col gap-[18px]">
        <div className="relative flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Medication name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Enter medication name"
            autoFocus
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[68px] z-10 flex w-full flex-col overflow-hidden rounded-base border border-slate-200 bg-white shadow-xs">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setName(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <Select
          label="Status"
          placeholder="Select status"
          value={status}
          onChange={setStatus}
          options={MEDICATION_STATUS_OPTIONS}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Condition (Optional)</label>
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Lupus"
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#101828]">Dosage</label>
          <div className="flex flex-col gap-3">
            <Select
              placeholder="Select form"
              value={form}
              onChange={setForm}
              options={MEDICATION_FORM_OPTIONS}
            />
            <Select
              placeholder="Select strength"
              value={strength}
              onChange={setStrength}
              options={MEDICATION_STRENGTH_OPTIONS}
            />
            <Select
              placeholder="Select quantity"
              value={quantity}
              onChange={setQuantity}
              options={MEDICATION_QUANTITY_OPTIONS}
            />
          </div>
        </div>

        <Select
          label="Frequency"
          placeholder="Select frequency"
          value={frequency}
          onChange={setFrequency}
          options={MEDICATION_FREQUENCY_OPTIONS}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Prescribed by (Optional)</label>
          <input
            value={prescribedBy}
            onChange={(e) => setPrescribedBy(e.target.value)}
            placeholder="e.g. Dr. Nwosu"
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() =>
          onSave({ name, status, condition, form, strength, quantity, frequency, prescribedBy })
        }
        className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-sm font-semibold text-white">Continue</span>
      </button>
    </div>
  );
}
