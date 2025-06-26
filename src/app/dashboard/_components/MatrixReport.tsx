"use client";

import { myArticleMatrix } from "@/backend/services/dashboard.action";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/use-translation";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import React, { useEffect } from "react";

const MatrixReport = () => {
  const { _t } = useTranslation();

  const query = useQuery({
    queryKey: ["dashboard-matrix-report"],
    queryFn: () => myArticleMatrix(),
  });

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">{_t("Stats")}</h3>

      <div className="mt-4 grid grid-col-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded">
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-semibold h-9">
              {query.isFetching && (
                <LoaderIcon className="animate-spin size-8 text-muted-foreground" suppressHydrationWarning />
              )}
              {query.data?.total_articles}
            </p>
            <div className="text-md text-muted-foreground font-semibold">
              {_t("Total articles")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-semibold h-9">
              {query.isFetching && (
                <LoaderIcon className="animate-spin size-8 text-muted-foreground" suppressHydrationWarning />
              )}
              {query.data?.total_comments}
            </p>
            <div className="text-md text-muted-foreground font-semibold">
              {_t("Total post comments")}
            </div>
          </CardContent>
        </Card>

        {/* <Card className="rounded">
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-semibold">1334</p>
            <div className="text-md text-muted-foreground font-semibold">
               {_t("Total post reactions")}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default MatrixReport;
