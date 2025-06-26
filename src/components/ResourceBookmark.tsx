"use client";

import React from "react";
import { ResourceBookmarkable } from "./render-props/ResourceBookmarkable";
import { useSession } from "@/store/session.atom";
import { useLoginPopup } from "./app-login-popup";
import clsx from "clsx";

interface ResourceBookmarkProps {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
}
const ResourceBookmark: React.FC<ResourceBookmarkProps> = ({
  resource_type,
  resource_id,
}) => {
  const session = useSession();
  const loginPopup = useLoginPopup();

  return (
    <ResourceBookmarkable
      resource_type={resource_type}
      resource_id={resource_id}
      render={({ bookmarked, toggle }) => (
        <button
          onClick={() => {
            if (!session?.user) {
              loginPopup.show();
              return;
            }
            toggle();
          }}
          className={clsx(
            "transition-colors duration-300 flex cursor-pointer px-2 py-1 rounded-sm hover:bg-primary/20",
            { "bg-primary/20": bookmarked }
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={clsx("size-5 stroke-2 fill-transparent", {
              "!stroke-current": !bookmarked,
              "!fill-current": bookmarked,
            })}
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      )}
    />
  );
};

export default ResourceBookmark;
