"use client";

import type { TrackedResourceType } from "@/backend/services/inputs/analytics.input";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "td_analytics_sid";

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) {
      return existing;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

type ResourceViewTrackerProps = {
  resourceType: TrackedResourceType;
  resourceId: string;
  enabled?: boolean;
};

/**
 * Fire-and-forget view event on mount (each full page load / refresh appends one row).
 */
export function ResourceViewTracker({
  resourceType,
  resourceId,
  enabled = true,
}: ResourceViewTrackerProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (!enabled || sent.current) {
      return;
    }
    sent.current = true;

    const sessionId = getOrCreateSessionId();
    const body = JSON.stringify({
      resource_type: resourceType,
      resource_id: resourceId,
      session_id: sessionId,
      document_referrer: document.referrer
        ? document.referrer.slice(0, 2048)
        : "",
    });

    try {
      void fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    } catch {
      // ignore
    }
  }, [enabled, resourceId, resourceType]);

  return null;
}
