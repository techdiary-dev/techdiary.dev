"use client";

import { CommentPresentation } from "@/backend/models/domain-models";
import * as commentActions from "@/backend/services/comment.action";
import { useTranslation } from "@/i18n/use-translation";
import { formattedTime } from "@/lib/utils";
import { useSession } from "@/store/session.atom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { useLoginPopup } from "./app-login-popup";
import ResourceReaction from "./ResourceReaction";
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

export const CommentSection = (props: {
  resource_id: string;
  resource_type: "ARTICLE" | "COMMENT";
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
        (old: any) => {
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
            ...old,
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
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{_t("Comments")}</h2>

        {/* New Comment Box */}
        <CommentEditor
          onSubmit={(body) => {
            mutation.mutate({ body, comment_id: generated_comment_id() });
          }}
          isLoading={mutation.isPending}
          placeholder={_t("What are your thoughts?")}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-10">
        {query?.data?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            mutating={mutation.isPending}
          />
        ))}
      </div>
    </div>
  );
};

const CommentEditor = (props: {
  onSubmit: (body: string) => void;
  isLoading: boolean;
  placeholder: string;
}) => {
  const { _t } = useTranslation();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

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
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="relative">
        <Textarea
          placeholder={props.placeholder}
          ref={inputRef}
          className="w-full min-h-10"
          required
          rows={1}
          disabled={props.isLoading}
          onKeyDown={handleKeyDown}
        />
        <button className=" absolute bottom-[6px] right-1 text-sm bg-primary/20 hover:bg-primary/30 cursor-pointer px-2 py-1 rounded-md text-muted-foreground">
          {_t("Save")}
        </button>
      </div>
      <div className="flex items-center mt-2 gap-2">
        <ul className="**:text-xs **:text-muted-foreground **:my-1 **:list-disc **:list-inside">
          <li>{_t("Type and hit enter to post comment")}</li>
          <li>{_t("For multiline comments, use Shift + Enter")}</li>
          <li>{_t("You can use markdown syntax for formatting")}</li>
        </ul>
      </div>
    </form>
  );
};

const CommentItem = (props: {
  comment: CommentPresentation;
  mutating?: boolean;
}) => {
  const { _t } = useTranslation();
  const session = useSession();
  const appLoginPopup = useLoginPopup();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const { mutatingId, setMutatingId } = useCommentSection();
  const [replies, setReplies] = useImmer<CommentPresentation[]>(
    props.comment.replies ?? []
  );

  const level = useMemo(() => props.comment.level ?? 0, [props.comment]);
  const generated_comment_id = () => crypto.randomUUID();
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
      console.log("Mutating comment with ID:", payload.comment_id);

      setMutatingId(payload.comment_id);
    },
    onError: (error) => {
      // reverse the optimistic update if there's an error
      // Optionally, you can show an error message to the user
    },
  });

  const levelMargin = useMemo(
    () => Math.min(level, 8) * 30,
    [props.comment.level]
  );
  return (
    <div
      data-comment-id={props.comment.id}
      className="group"
      style={{ marginLeft: `${levelMargin}px` }}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          <span className="font-medium">@{props.comment.author?.username}</span>
        </button>
        <span>•</span>
        <span>{formattedTime(new Date(props.comment.created_at!))}</span>
      </div>

      {!isCollapsed && (
        <>
          {/* Comment Content */}
          <div className="mb-2">
            <div className="prose prose-sm max-w-none text-foreground">
              {props.comment.body}
            </div>
          </div>

          {/* Comment Actions */}

          {props.mutating && mutatingId == props.comment.id ? (
            <p className="text-muted-foreground text-sm mb-3">
              {_t("Pending")}...
            </p>
          ) : (
            <div className="flex items-center gap-4 mb-3">
              {level < 2 && (
                <button
                  className="text-sm flex items-center hover:underline cursor-pointer"
                  onClick={() => setShowReplyBox(!showReplyBox)}
                >
                  <MessageSquare className="size-3 mr-1" />
                  <span>{_t("Reply")}</span>
                </button>
              )}
              <ResourceReaction
                resource_type="COMMENT"
                resource_id={props.comment.id}
              />
            </div>
          )}

          {/* Reply Box */}
          {showReplyBox && (
            <div className="mb-4 ml-4">
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
              />
            </div>
          )}

          {/* Nested Replies */}
          {replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              mutating={mutation.isPending}
            />
          ))}
        </>
      )}
    </div>
  );
};
