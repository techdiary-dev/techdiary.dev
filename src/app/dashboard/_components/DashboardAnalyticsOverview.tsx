"use client";

import * as React from "react";
import { getDashboardAnalyticsOverview } from "@/backend/services/analytics.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "@/i18n/use-translation";
import { actionPromisify } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  AnalyticsRangeControls,
  analyticsTimeRangeToQueryPayload,
  type AnalyticsTimeRange,
} from "@/components/analytics/AnalyticsRangeControls";

const chartConfig = {
  unique_viewers: {
    label: "Unique viewers",
    color: "hsl(var(--chart-1))",
  },
  impressions: {
    label: "Impressions",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function DashboardAnalyticsOverview() {
  const { _t } = useTranslation();
  const [timeRange, setTimeRange] = React.useState<AnalyticsTimeRange>({
    kind: "preset",
    days: 30,
  });

  const rangePayload = analyticsTimeRangeToQueryPayload(timeRange);

  const query = useQuery({
    queryKey: ["dashboard-analytics-overview", rangePayload],
    queryFn: () =>
      actionPromisify(getDashboardAnalyticsOverview({ ...rangePayload })),
  });

  if (query.isPending) {
    return (
      <section id="dashboard-analytics" className="mb-10 space-y-4 scroll-mt-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section id="dashboard-analytics" className="mb-10 scroll-mt-4">
        <p className="text-sm text-destructive">
          {query.error instanceof Error ? query.error.message : String(query.error)}
        </p>
      </section>
    );
  }

  const data = query.data;
  const chartData = data.series.map((row) => ({
    ...row,
    dateLabel: row.date.slice(5),
  }));

  const hasTrackedResources =
    data.publishedArticleCount > 0 || data.publicGistCount > 0;

  return (
    <section id="dashboard-analytics" className="mb-10 scroll-mt-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {_t("Reach & views")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {_t("Across your published articles and public gists")} (
            {data.publishedArticleCount}{" "}
            {data.publishedArticleCount === 1 ? _t("article") : _t("articles")}
            {", "}
            {data.publicGistCount}{" "}
            {data.publicGistCount === 1 ? _t("gist") : _t("gists")}).{" "}
            <span className="text-foreground/80">
              {_t("Use Article analytics on each published row for a single post.")}
            </span>
          </p>
        </div>
        <AnalyticsRangeControls value={timeRange} onChange={setTimeRange} />
      </div>

      {!data.clickhouseConfigured ? (
        <p className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {_t(
            "View analytics are not configured (ClickHouse env missing). Totals below show reactions and bookmarks from the database only.",
          )}
        </p>
      ) : null}

      {data.clickhouseConfigured && !hasTrackedResources ? (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {_t(
            "Publish an article or create a public gist to start collecting view analytics.",
          )}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Unique viewers")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {data.totals.unique_viewers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Impressions")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {data.totals.impressions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Reactions")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.reactions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{_t("Bookmarks")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.bookmarks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-4 rounded-lg border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{_t("Views over time")}</CardTitle>
          <CardDescription>
            {_t("Stacked across everything you track in this dashboard")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data.clickhouseConfigured || !hasTrackedResources ? (
            <p className="text-sm text-muted-foreground">
              {_t("Chart appears when view tracking is available for your content.")}
            </p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {_t("No view data in this range yet.")}
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[min(320px,50vh)] w-full">
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
                <ChartLegend content={<ChartLegendContent />} />
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
    </section>
  );
}
