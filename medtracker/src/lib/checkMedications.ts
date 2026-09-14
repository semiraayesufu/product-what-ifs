import { fetchDrugSafetyInfo, excerptAround, DrugApiError } from "../services/drugApi";
import type { ConflictItem, LogEntry, ResultData, Severity } from "../types";

const SEVERITY_RANK: Record<Severity, number> = { major: 3, moderate: 2, minor: 1, unresolved: 0 };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type CheckOutcome = { result: ResultData; severity: LogEntry["severity"] };

/**
 * Fetches each item's real FDA label live (openFDA) and scans its interaction /
 * warning / contraindication text for mentions of anything in `profileNames`
 * (existing medications/allergies/conditions, plus any other items being
 * checked alongside it). This is a live, honest heuristic — a real pairwise
 * drug-interaction database (e.g. DrugBank) isn't free/keyless, so we surface
 * what the FDA's own label text says rather than a fabricated verdict.
 */
export async function checkMedicationsAgainstProfile(
  items: string[],
  profileNames: string[],
  checkedAgainstText: string,
  /** When provided, the result offers to add the first checked item not already in this list. */
  existingMedicationNames?: string[],
): Promise<CheckOutcome> {
  const otherProfileNames = profileNames.filter(
    (n) => !items.some((item) => item.toLowerCase() === n.toLowerCase()),
  );
  const addPromptName = existingMedicationNames
    ? items.find((item) => !existingMedicationNames.some((m) => m.toLowerCase() === item.toLowerCase()))
    : undefined;

  try {
    const infos = await Promise.all(
      items.map(async (item) => ({ item, info: await fetchDrugSafetyInfo(item) })),
    );

    const unresolvedCount = infos.filter((x) => x.info === null).length;
    if (unresolvedCount === items.length) {
      return {
        severity: "unresolved",
        result: {
          outcome: "unresolved",
          title: items.join(", "),
          subtitle: "No FDA label on file",
          note: "openFDA doesn't have a published label under this exact name — try the generic name, or double-check the spelling.",
          addPromptName: items[0],
        },
      };
    }

    const conflicts: ConflictItem[] = [];
    const displayNames: string[] = [];

    for (const { info } of infos) {
      if (!info) continue;
      displayNames.push(info.displayName);
      for (const profName of otherProfileNames) {
        if (profName.trim().length < 4) continue;
        const needle = new RegExp(`\\b${escapeRegExp(profName.trim())}`, "i");
        const hitSection = info.sections.find((s) => needle.test(s.text));
        if (hitSection) {
          conflicts.push({
            pair: `${info.displayName} + ${profName}`,
            severity: hitSection.severity,
            headline: `${profName} is mentioned in this label's ${hitSection.label.toLowerCase()}`,
            detail: excerptAround(hitSection.text, profName.trim()),
          });
        }
      }
    }

    const title = displayNames.join(", ") || items.join(", ");

    if (conflicts.length > 0) {
      const worst = conflicts.reduce<Severity>(
        (acc, c) => (SEVERITY_RANK[c.severity] > SEVERITY_RANK[acc] ? c.severity : acc),
        "unresolved",
      );
      return {
        severity: worst,
        result: {
          outcome: "found",
          title,
          subtitle: `${conflicts.length} potential interaction${conflicts.length > 1 ? "s" : ""} found — live from openFDA`,
          conflicts,
          addPromptName,
        },
      };
    }

    return {
      severity: "clear",
      result: {
        outcome: "clear",
        title,
        subtitle: "No mention found in the current FDA label",
        checkedAgainst: checkedAgainstText,
        source: "Source: openFDA drug label database (checked live)",
        addPromptName,
      },
    };
  } catch (err) {
    return {
      severity: "unresolved",
      result: {
        outcome: "unresolved",
        title: items.join(", "),
        subtitle: "Couldn't complete the check",
        note:
          err instanceof DrugApiError
            ? err.message
            : "Something went wrong reaching the live drug database. Please try again.",
      },
    };
  }
}
