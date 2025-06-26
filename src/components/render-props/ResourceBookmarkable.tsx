import * as bookmarkAction from "@/backend/services/bookmark.action";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

interface Props {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
  render: ({
    toggle,
    bookmarked,
  }: {
    toggle: () => void;
    bookmarked: boolean;
  }) => React.ReactNode;
}

export const ResourceBookmarkable: React.FC<Props> = ({
  resource_id,
  resource_type,
  render,
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  const status = useQuery({
    queryKey: ["bookmark-status", resource_id],
    queryFn: () =>
      bookmarkAction.bookmarkStatus({ resource_id, resource_type }),
    enabled: Boolean(resource_id) && Boolean(resource_type),
  });

  const mutation = useMutation({
    mutationFn: () =>
      bookmarkAction.toggleResourceBookmark({ resource_id, resource_type }),

    // Ensure state is accurate after success
    onSuccess: (data) => {
      setBookmarked(data?.bookmarked ?? false);
    },
  });

  const toggle = () => {
    setBookmarked((state) => !state);
    mutation.mutate();
  };

  useEffect(() => {
    if (status.data) {
      setBookmarked(status.data.bookmarked ?? false);
    }
  }, [status.data]);

  return <>{render({ toggle, bookmarked })}</>;
};
