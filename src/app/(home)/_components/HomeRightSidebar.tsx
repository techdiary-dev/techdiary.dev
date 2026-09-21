import DiscordWidget from "@/components/widgets/DiscordWidget";
import ImportantLinksWidget from "@/components/widgets/ImportantLinksWidget";
import LatestUsers from "@/components/widgets/LatestUsers";
import SocialLinksWidget from "@/components/widgets/SocialLinksWidget";
import React, { Suspense } from "react";

const HomeRightSidebar = () => {
  return (
    <div className="flex flex-col gap-10">
      <DiscordWidget />
      <SocialLinksWidget />
      <ImportantLinksWidget />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
        <LatestUsers />
      </Suspense>
    </div>
  );
};

export default HomeRightSidebar;
