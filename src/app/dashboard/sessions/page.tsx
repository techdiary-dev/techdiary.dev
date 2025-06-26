"use client";

import * as sessionActions from "@/backend/services/session.actions";
import { useAppConfirm } from "@/components/app-confirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/use-translation";
import { formattedTime } from "@/lib/utils";
import { useSession } from "@/store/session.atom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeIcon,
  ClockIcon,
  ComputerIcon,
  Loader,
  LogOut,
} from "lucide-react";
import { formatDistance } from "date-fns";

const SessionsPage = () => {
  const authSession = useSession();
  const appConfirm = useAppConfirm();
  const { _t } = useTranslation();

  const sessionQuery = useQuery({
    queryKey: ["mySessions"],
    queryFn: () => sessionActions.mySessions(),
  });
  return (
    <div>
      <h3 className="text-xl font-semibold">{_t("Login Sessions")}</h3>
      <p className="text-muted-foreground">
        {_t(
          "These are the login sessions of your account. You can use this to revoke access to your account"
        )}
        .
      </p>
      {/* <pre>{JSON.stringify(sessionQuery.data, null, 2)}</pre> */}

      <div className="flex flex-col gap-2 divide-y divide-dashed divide-border-color my-10">
        {sessionQuery.isFetching && (
          <div>
            <Loader className="size-6 animate-spin" />
          </div>
        )}

        {sessionQuery.data?.map((session) => (
          <div key={session.id} className="flex gap-3 items-start pb-3">
            <span className="pt-1">
              <ComputerIcon className="h-6 w-6 text-neutral-500 " />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{session.device}</span>
              {authSession?.session?.id == session.id ? (
                <div className="text-green-500 text-xs">This device</div>
              ) : (
                <div className="flex items-center gap-1 text-sm">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>
                    Last active{" "}
                    {formatDistance(
                      new Date(session.last_action_at!),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              )}
              <div className="text-xs">IP: {session.ip}</div>
              <span>
                <Button
                  variant={"link"}
                  disabled={authSession?.session?.id == session.id}
                  className="text-destructive text-sm"
                  onClick={() => {
                    appConfirm.show({
                      title: _t("Sure to revoke session?"),
                      children: _t(
                        "If you revoke the session, you will be logged out from all devices"
                      ),
                      labels: {
                        confirm: _t("Yes"),
                        cancel: _t("Cancel"),
                      },
                      async onConfirm() {
                        try {
                          await sessionActions.deleteSession(session?.id);
                        } finally {
                          sessionQuery.refetch();
                        }
                      },
                    });
                  }}
                >
                  Log Out
                </Button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsPage;
