"use client";

import React from "react";
import { ResourceReactionable } from "./render-props/ResourceReactionable";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { FaceIcon } from "@radix-ui/react-icons";

interface ResourceReactionProps {
  resource_type: "ARTICLE" | "COMMENT";
  resource_id: string;
}
const ResourceReaction = ({
  resource_type,
  resource_id,
}: ResourceReactionProps) => {
  return (
    <>
      <ResourceReactionable
        resource_type={resource_type}
        resource_id={resource_id}
        render={({ reactions, toggle }) => {
          return (
            <div className="flex gap-2">
              {reactions
                .filter((r) => r.count)
                .map((reaction) => (
                  <button
                    key={reaction.reaction_type}
                    onClick={() => toggle(reaction.reaction_type!)}
                    className={`p-1 w-10 h-6 flex items-center gap-1 cursor-pointer rounded-sm hover:bg-primary/20 ${
                      reaction.is_reacted ? "bg-primary/20" : ""
                    }`}
                  >
                    <img
                      src={`/reactions/${reaction.reaction_type}.svg`}
                      alt={`reaction-${resource_id}-${reaction.reaction_type}`}
                      className="flex-none size-4"
                    />
                    <span>{reaction.count}</span>
                  </button>
                ))}
              <HoverCard openDelay={0}>
                {reactions.length !==
                  reactions.filter((r) => r.count).length && (
                  <HoverCardTrigger asChild>
                    <button className="p-1 border w-10 h-6 flex-none grid place-content-center cursor-pointer rounded-sm hover:bg-primary/20">
                      <FaceIcon />
                    </button>
                  </HoverCardTrigger>
                )}

                <HoverCardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {reactions.map((reaction) => (
                      <button
                        onClick={() => toggle(reaction.reaction_type!)}
                        key={reaction.reaction_type}
                        className={`p-1 flex items-center gap-1 cursor-pointer rounded-sm hover:bg-primary/20 ${
                          reaction.is_reacted ? "bg-primary/20" : ""
                        }`}
                      >
                        <img
                          src={`/reactions/${reaction.reaction_type}.svg`}
                          alt={`reaction-${resource_id}-${reaction.reaction_type}`}
                          className="size-5"
                        />
                      </button>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          );
        }}
      />
    </>
  );
};

export default ResourceReaction;
