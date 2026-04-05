"use client";

import * as React from "react";
import { useTranslation } from "@/i18n/use-translation";
import { Button } from "@/components/ui/button";

const PRESET_DAYS = [7, 30, 90] as const;
export type PresetDays = (typeof PRESET_DAYS)[number];

export type AnalyticsTimeRange =
  | { kind: "preset"; days: PresetDays }
  | { kind: "custom"; start_date: string; end_date: string };

function toYmdUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function defaultCustomRange(): { start_date: string; end_date: string } {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 29);
  return { start_date: toYmdUTC(start), end_date: toYmdUTC(end) };
}

type AnalyticsRangeControlsProps = {
  value: AnalyticsTimeRange;
  onChange: (next: AnalyticsTimeRange) => void;
};

export function AnalyticsRangeControls({ value, onChange }: AnalyticsRangeControlsProps) {
  const { _t } = useTranslation();
  const [draftStart, setDraftStart] = React.useState(
    value.kind === "custom" ? value.start_date : defaultCustomRange().start_date,
  );
  const [draftEnd, setDraftEnd] = React.useState(
    value.kind === "custom" ? value.end_date : defaultCustomRange().end_date,
  );

  React.useEffect(() => {
    if (value.kind === "custom") {
      setDraftStart(value.start_date);
      setDraftEnd(value.end_date);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-wrap gap-2">
        {PRESET_DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange({ kind: "preset", days: d })}
            className={
              value.kind === "preset" && value.days === d
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            }
          >
            {d}d
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const r = defaultCustomRange();
            onChange({ kind: "custom", ...r });
          }}
          className={
            value.kind === "custom"
              ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              : "rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          }
        >
          {_t("Custom")}
        </button>
      </div>

      {value.kind === "custom" ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{_t("From")}</span>
            <input
              type="date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{_t("To")}</span>
            <input
              type="date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-9"
            onClick={() => {
              if (!draftStart || !draftEnd || draftStart > draftEnd) {
                return;
              }
              onChange({
                kind: "custom",
                start_date: draftStart,
                end_date: draftEnd,
              });
            }}
          >
            {_t("Apply")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function analyticsTimeRangeToQueryPayload(
  range: AnalyticsTimeRange,
): { range_days: number; start_date?: undefined; end_date?: undefined } | { start_date: string; end_date: string; range_days?: undefined } {
  if (range.kind === "preset") {
    return { range_days: range.days };
  }
  return { start_date: range.start_date, end_date: range.end_date };
}
