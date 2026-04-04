"use client";

import { MyNotificationsFeed } from "@/components/notifications/MyNotificationsFeed";

const NotificationPage = () => {
  return (
    <div className="mx-auto max-w-2xl">
      <MyNotificationsFeed variant="page" />
    </div>
  );
};

export default NotificationPage;
