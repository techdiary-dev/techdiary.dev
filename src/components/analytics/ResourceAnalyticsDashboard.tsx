"use client";

import * as React from "react";
import { getResourceAnalytics } from "@/backend/services/analytics.actions";
import type { TrackedResourceType } from "@/backend/services/inputs/analytics.input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "@/i18n/use-translation";
import { actionPromisify } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AnalyticsRangeControls,
  analyticsTimeRangeToQueryPayload,
  type AnalyticsTimeRange,
} from "@/components/analytics/AnalyticsRangeControls";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  unique_viewers: {
    label: "Unique viewers",
    color: "var(--chart-1)",
  },
  impressions: {
    label: "Impressions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ResourceAnalyticsDashboardProps = {
  resourceType: TrackedResourceType;
  resourceId: string;
  /** e.g. article or gist title (shown above the chart). */
  resourceTitle?: string | null;
  /** Link to the public reader page for this resource. */
  publicReaderHref?: string | null;
};

export function ResourceAnalyticsDashboard({
  resourceType,
  resourceId,
  resourceTitle,
  publicReaderHref,
}: ResourceAnalyticsDashboardProps) {
  const { _t } = useTranslation();
  const [timeRange, setTimeRange] = React.useState<AnalyticsTimeRange>({
    kind: "preset",
    days: 30,
  });

  const rangePayload = analyticsTimeRangeToQueryPayload(timeRange);

  const query = useQuery({
    queryKey: ["resource-analytics", resourceType, resourceId, rangePayload],
    queryFn: () =>
      actionPromisify(
        getResourceAnalytics({
          resource_type: resourceType,
          resource_id: resourceId,
          ...rangePayload,
        }),
      ),
  });

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-[280px] animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className="text-sm text-destructive">
        {query.error instanceof Error ? query.error.message : String(query.error)}
      </p>
    );
  }

  const data = query.data;
  const chartData = data.series.map((row) => ({
    ...row,
    dateLabel: row.date.slice(5),
  }));

  return (
    <div className="space-y-6">
      {resourceTitle ? (
        <div className="space-y-1">
          <p className="text-lg font-semibold leading-snug text-foreground">
            {resourceTitle}
          </p>
          {publicReaderHref ? (
            <Link
              href={publicReaderHref}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {_t("View public page")}
            </Link>
          ) : null}
        </div>
      ) : null}
      {!data.clickhouseConfigured ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {_t(
            "View analytics are not configured (ClickHouse env missing). Reaction and bookmark counts still reflect your content.",
          )}
        </p>
      ) : null}

      <AnalyticsRangeControls value={timeRange} onChange={setTimeRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Unique viewers")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {data.totals.unique_viewers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Impressions")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {data.totals.impressions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Reactions")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.reactions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Bookmarks")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.bookmarks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>{_t("Views over time")}</CardTitle>
          <CardDescription>
            {_t("Unique viewers and impressions per day")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">{_t("No view data in this range yet.")}</p>
          ) : (
            <ChartContainer config={chartConfig} className="max-h-[320px] w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="unique_viewers"
                  stroke="var(--color-unique_viewers)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--color-impressions)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
