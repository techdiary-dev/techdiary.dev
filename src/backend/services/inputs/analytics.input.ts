import { z } from "zod/v4";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const analyticsRangeFields = {
  range_days: z.coerce.number().int().min(1).max(365).optional(),
  start_date: ymd.optional(),
  end_date: ymd.optional(),
};

function refineAnalyticsRange(
  v: {
    range_days?: number;
    start_date?: string;
    end_date?: string;
  },
  ctx: z.RefinementCtx,
) {
  const hasCustom = v.start_date != null && v.end_date != null;
  const hasPartial =
    (v.start_date != null && v.end_date == null) ||
    (v.start_date == null && v.end_date != null);
  if (hasPartial) {
    ctx.addIssue({
      code: "custom",
      message: "Provide both start_date and end_date for a custom range",
      path: ["start_date"],
    });
  }
  if (hasCustom && v.range_days != null) {
    ctx.addIssue({
      code: "custom",
      message: "Use either range_days or start_date/end_date, not both",
      path: ["range_days"],
    });
  }
  if (hasCustom && v.start_date! > v.end_date!) {
    ctx.addIssue({
      code: "custom",
      message: "start_date must be on or before end_date",
      path: ["start_date"],
    });
  }
}

export const TRACKED_RESOURCE_TYPES = ["ARTICLE", "GIST"] as const;
export type TrackedResourceType = (typeof TRACKED_RESOURCE_TYPES)[number];

/** Stored in ClickHouse `session_type`; `session_id` is anon token or user UUID string. */
export const ANALYTICS_SESSION_TYPES = ["ANON", "AUTHENTICATED"] as const;
export type AnalyticsSessionType = (typeof ANALYTICS_SESSION_TYPES)[number];

export const AnalyticsInput = {
  recordViewBody: z.object({
    resource_type: z.enum(TRACKED_RESOURCE_TYPES),
    resource_id: z.string().uuid(),
    session_id: z.string().min(8).max(128),
  }),

  getResourceAnalyticsInput: z
    .object({
      resource_type: z.enum(TRACKED_RESOURCE_TYPES),
      resource_id: z.string().uuid(),
      ...analyticsRangeFields,
    })
    .superRefine(refineAnalyticsRange),

  getDashboardAnalyticsOverviewInput: z
    .object({
      ...analyticsRangeFields,
    })
    .superRefine(refineAnalyticsRange),
};
