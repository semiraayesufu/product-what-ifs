import { useEffect, useState } from "react";
import spinner from "../assets/icons/spinner.svg";

const STEPS = [
  "Normalizing medication name",
  "Checking against {count} current medications",
  "Checking against {allergies} allergies",
  "Checking against {conditions} medical conditions",
];

export default function CheckingPanel({
  items,
  medicationCount,
  allergyCount,
  conditionCount,
  onDone,
}: {
  items: string[];
  medicationCount: number;
  allergyCount: number;
  conditionCount: number;
  onDone: () => void;
}) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setCompleted(i + 1), (i + 1) * 500),
    );
    const finish = setTimeout(onDone, STEPS.length * 500 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = items.join(", ");

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-start gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
        <img src={spinner} alt="" className="size-16 animate-spin" />
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-[15px] font-semibold text-slate-800">
            Checking {label} against
          </p>
          <p className="text-[15px] font-semibold text-slate-800">
            each other and your medications and allergies
          </p>
        </div>
        <div className="flex w-[400px] flex-col gap-2 rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
          {STEPS.map((step, i) => (
            <p key={step}>
              {i < completed ? "✓" : "○"}{" "}
              {step
                .replace("{count}", String(medicationCount))
                .replace("{allergies}", String(allergyCount))
                .replace("{conditions}", String(conditionCount))}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
