"use client";

import { CommentPresentation } from "@/backend/models/domain-models";
import * as commentActions from "@/backend/services/comment.action";
import { useTranslation } from "@/i18n/use-translation";
import { cn, formattedTime, getAvatarPlaceholder } from "@/lib/utils";
import { useSession } from "@/store/session.atom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { useLoginPopup } from "./app-login-popup";
import ResourceReaction from "./ResourceReaction";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

const Context = React.createContext<
  { mutatingId?: string; setMutatingId: (id?: string) => void } | undefined
>(undefined);

export const CommentSectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mutatingId, setMutatingId] = useState<string | undefined>(undefined);
  return (
    <Context.Provider value={{ mutatingId, setMutatingId }}>
      {children}
    </Context.Provider>
  );
};
export const useCommentSection = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useCommentSectionContext must be used within a CommentSectionProvider"
    );
  }
  return context;
};

function CommentListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-2 py-0.5">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const CommentSection = (props: {
  resource_id: string;
  resource_type: "ARTICLE" | "COMMENT";
  className?: string;
}) => {
  const { _t } = useTranslation();
  const queryClient = useQueryClient();
  const appLoginPopup = useLoginPopup();
  const { setMutatingId } = useCommentSection();
  const session = useSession();
  const mutation = useMutation({
    mutationFn: (payload: { body: string; comment_id: string }) =>
      commentActions.createMyComment({
        resource_id: props.resource_id,
        resource_type: props.resource_type,
        body: payload.body,
        comment_id: payload.comment_id,
      }),
    onMutate: async (payload) => {
      if (!session?.user) {
        appLoginPopup.show();
        return;
      }
      setMutatingId(payload.comment_id);

      // Optimistically update the UI by adding the new comment to the list
      await queryClient.cancelQueries({
        queryKey: ["comments", props.resource_id, props.resource_type],
      });

      const oldComments = queryClient.getQueryData([
        "comments",
        props.resource_id,
        props.resource_type,
      ]);

      queryClient.setQueryData(
        ["comments", props.resource_id, props.resource_type],
        (old: CommentPresentation[] | undefined) => {
          const prev = old ?? [];
          return [
            {
              id: payload.comment_id || crypto.randomUUID(),
              body: payload.body,
              level: 0,
              author: {
                id: session?.user?.id || "temp-user-id",
                name: session?.user?.name || "Temp User",
                username: session?.user?.username || "tempuser",
                email: session?.user?.email || "tempuser@example.com",
              },
              replies: [],
              created_at: new Date(),
            } satisfies CommentPresentation,
            ...prev,
          ];
        }
      );
      return { oldComments };
    },
  });

  const query = useQuery({
    queryKey: ["comments", props.resource_id, props.resource_type],
    queryFn: () =>
      commentActions.getComments({
        resource_id: props.resource_id,
        resource_type: props.resource_type,
      }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const generated_comment_id = () => crypto.randomUUID();
  const listQueryKey = [
    "comments",
    props.resource_id,
    props.resource_type,
  ] as const;

  const count = query.data?.length ?? 0;

  return (
    <section
      className={cn(
        "max-w-2xl mx-auto w-full px-3 py-4 sm:px-4",
        props.className
      )}
      aria-label={_t("Comments")}
    >
      <header className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {_t("Comments")}
        </h2>
        {query.isSuccess && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </header>

      <div className="mb-4">
        <CommentEditor
          onSubmit={(body) => {
            mutation.mutate({ body, comment_id: generated_comment_id() });
          }}
          isLoading={mutation.isPending}
          placeholder={_t("What are your thoughts?")}
          variant="default"
        />
      </div>

      {query.isError && (
        <p className="mb-3 text-xs text-destructive" role="alert">
          {_t("Could not load comments.")}
        </p>
      )}

      {query.isPending && <CommentListSkeleton />}

      {query.isSuccess && count === 0 && (
        <div
          className="flex flex-col items-center justify-center px-2 py-10 text-center"
          role="status"
        >
          <MessageSquare
            className="mb-2 size-7 text-muted-foreground/50"
            strokeWidth={1.25}
            aria-hidden
          />
          <p className="text-xs font-medium text-foreground">{_t("No comments yet")}</p>
          <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
            {_t("Be the first to share your thoughts.")}
          </p>
        </div>
      )}

      {query.isSuccess && count > 0 && (
        <ul className="flex list-none flex-col gap-2 p-0">
          {query.data?.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                mutating={mutation.isPending}
                listQueryKey={listQueryKey}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const CommentEditor = (props: {
  onSubmit: (body: string) => void;
  isLoading: boolean;
  placeholder: string;
  variant?: "default" | "compact";
}) => {
  const { _t } = useTranslation();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const variant = props.variant ?? "default";
  const isCompact = variant === "compact";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputRef.current && inputRef.current.value.trim()) {
        props.onSubmit(inputRef.current.value.trim());
        inputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value.trim()) {
      props.onSubmit(inputRef.current.value.trim());
      inputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div
        className={cn(
          "rounded-md bg-muted/40 px-0 transition-colors focus-within:bg-muted/55 dark:bg-muted/30 dark:focus-within:bg-muted/45",
          isCompact ? "py-1.5" : "py-2"
        )}
      >
        <Textarea
          placeholder={props.placeholder}
          ref={inputRef}
          className={cn(
            "w-full resize-y border-0 bg-transparent px-3 py-2 text-sm leading-snug shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-0",
            isCompact ? "min-h-[56px]" : "min-h-[72px]"
          )}
          required
          disabled={props.isLoading}
          onKeyDown={handleKeyDown}
          aria-label={props.placeholder}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 pt-0.5">
          <p className="text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
            <span className="hidden sm:inline">
              {_t("Enter to post")} · {_t("Shift+Enter for newline")} · Markdown
            </span>
            <span className="sm:hidden">{_t("Enter to post")} · Markdown</span>
          </p>
          <Button
            type="submit"
            size="sm"
            className="h-7 shrink-0 gap-1 px-2.5 text-xs"
            disabled={props.isLoading}
          >
            {props.isLoading ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : null}
            {_t("Post")}
          </Button>
        </div>
      </div>
    </form>
  );
};

const CommentItem = (props: {
  comment: CommentPresentation;
  mutating?: boolean;
  listQueryKey: readonly [string, string, string];
}) => {
  const { _t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useSession();
  const appLoginPopup = useLoginPopup();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(props.comment.body ?? "");
  const { mutatingId, setMutatingId } = useCommentSection();
  const [replies, setReplies] = useImmer<CommentPresentation[]>(
    props.comment.replies ?? []
  );

  const isOwner = Boolean(
    session?.user?.id &&
      props.comment.author?.id &&
      session.user.id === props.comment.author.id
  );

  const level = useMemo(() => props.comment.level ?? 0, [props.comment]);
  const generated_comment_id = () => crypto.randomUUID();

  const updateMutation = useMutation({
    mutationFn: (body: string) =>
      commentActions.updateMyComment({ id: props.comment.id, body }),
    onSuccess: (res) => {
      if (res && "success" in res && res.success) {
        void queryClient.invalidateQueries({ queryKey: [...props.listQueryKey] });
        setIsEditing(false);
        toast.success(_t("Comment updated"));
        return;
      }
      const err = res && "error" in res ? res.error : _t("Something went wrong");
      toast.error(err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentActions.deleteMyComment({ id: props.comment.id }),
    onSuccess: (res) => {
      if (res && "success" in res && res.success) {
        void queryClient.invalidateQueries({ queryKey: [...props.listQueryKey] });
        toast.success(_t("Comment deleted"));
        return;
      }
      const err = res && "error" in res ? res.error : _t("Something went wrong");
      toast.error(err);
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: { body: string; comment_id: string }) =>
      commentActions.createMyComment({
        comment_id: payload.comment_id,
        body: payload.body,
        resource_id: props.comment.id,
        resource_type: "COMMENT",
      }),
    onMutate: (payload) => {
      if (!session?.user) {
        appLoginPopup.show();
        return;
      }

      setReplies((draft) => {
        draft.unshift({
          id: payload.comment_id,
          body: payload.body,
          level: (props.comment.level ?? 0) + 1,
          author: {
            id: session?.user?.id || "temp-user-id",
            name: session?.user?.name || "Temp User",
            username: session?.user?.username || "tempuser",
            email: session?.user?.email || "tempuser@example.com",
          },
          replies: [],
          created_at: new Date(),
        } satisfies CommentPresentation);
      });

      setMutatingId(payload.comment_id);
    },
  });

  const authorLabel = commentAuthorLabel(props.comment);
  const username = props.comment.author?.username ?? "";

  return (
    <div
      data-comment-id={props.comment.id}
      className={cn(
        "group/comment",
        level > 0 && "ml-0.5 border-l border-muted-foreground/20 pl-3"
      )}
    >
      <article className="py-1 pr-0">
        <div className="flex gap-2">
          {username ? (
            <Link
              href={`/@${username}`}
              className="shrink-0 pt-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`@${username}`}
            >
              <CommentAvatar label={authorLabel} />
            </Link>
          ) : (
            <div className="shrink-0 pt-0.5" aria-hidden>
              <CommentAvatar label={authorLabel} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? _t("Expand comment") : _t("Collapse comment")}
              >
                {isCollapsed ? (
                  <ChevronRight className="size-3.5" aria-hidden />
                ) : (
                  <ChevronDown className="size-3.5" aria-hidden />
                )}
              </button>
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0">
                {username ? (
                  <Link
                    href={`/@${username}`}
                    className="truncate text-xs font-semibold text-foreground hover:underline"
                  >
                    @{username}
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">—</span>
                )}
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <time
                  className="text-[11px] text-muted-foreground tabular-nums"
                  dateTime={
                    props.comment.created_at
                      ? new Date(props.comment.created_at).toISOString()
                      : undefined
                  }
                >
                  {props.comment.created_at
                    ? formattedTime(new Date(props.comment.created_at))
                    : ""}
                </time>
              </div>
            </div>

            {!isCollapsed && (
              <>
                <div className="mb-2">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <Textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        className="min-h-[88px] resize-y border-0 bg-muted/40 text-sm focus-visible:ring-1"
                        disabled={updateMutation.isPending}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          type="button"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            const t = editDraft.trim();
                            if (!t) return;
                            updateMutation.mutate(t);
                          }}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="size-3 animate-spin" aria-hidden />
                          ) : null}
                          {_t("Save")}
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setIsEditing(false);
                            setEditDraft(props.comment.body ?? "");
                          }}
                          disabled={updateMutation.isPending}
                        >
                          {_t("Cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-none text-sm leading-snug text-foreground break-words whitespace-pre-wrap">
                      {props.comment.body}
                    </div>
                  )}
                </div>

                {props.mutating && mutatingId == props.comment.id ? (
                  <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                    {_t("Pending")}…
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
                    {isOwner && !isEditing && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditDraft(props.comment.body ?? "");
                            setIsEditing(true);
                          }}
                        >
                          <Pencil className="size-3 mr-0.5" aria-hidden />
                          {_t("Edit")}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1.5 text-xs text-muted-foreground hover:text-destructive"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="size-3 mr-0.5" aria-hidden />
                              {_t("Delete")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {_t("Delete this comment?")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {(replies?.length ?? 0) > 0
                                  ? _t(
                                      "This will remove this comment and all nested replies under it."
                                    )
                                  : _t("This cannot be undone.")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{_t("Cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate()}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {_t("Delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {level < 2 && !isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setShowReplyBox(!showReplyBox)}
                      >
                        <MessageSquare className="size-3 mr-0.5" aria-hidden />
                        {_t("Reply")}
                      </Button>
                    )}
                    {!isEditing && (
                      <div className="inline-flex">
                        <ResourceReaction
                          resource_type="COMMENT"
                          resource_id={props.comment.id}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showReplyBox && (
                  <div className="mt-2 pt-1">
                    <CommentEditor
                      onSubmit={(value) => {
                        mutation.mutate({
                          body: value,
                          comment_id: generated_comment_id(),
                        });
                        setShowReplyBox(false);
                      }}
                      isLoading={false}
                      placeholder={`Reply to ${props.comment.author?.username}`}
                      variant="compact"
                    />
                  </div>
                )}

                {replies && replies.length > 0 && (
                  <ul className="mt-1 flex list-none flex-col gap-0 pl-0">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          mutating={mutation.isPending}
                          listQueryKey={props.listQueryKey}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

function commentAuthorLabel(c: CommentPresentation) {
  const n = c.author?.name?.trim();
  if (n) return n;
  const u = c.author?.username?.trim();
  if (u) return u;
  return "User";
}

function CommentAvatar({ label }: { label: string }) {
  return (
    <Avatar className="size-7">
      <AvatarImage
        src={getAvatarPlaceholder(label)}
        alt=""
        className="object-cover"
      />
      <AvatarFallback className="text-[10px] font-medium">
        {label.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
