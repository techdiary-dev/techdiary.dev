"use client";

import { useTranslation } from "@/i18n/use-translation";
import { meilisearchClient } from "@/lib/meilisearch.client";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useAtom } from "jotai";
import { searchBarAtom } from "@/store/search-bar.atom";

const SearchInput = () => {
  const { _t } = useTranslation();
  const router = useRouter();
  const index = meilisearchClient.index("articles");

  const [open, setOpen] = useAtom(searchBarAtom);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    mutation.mutate(query);
  }, 500);

  const mutation = useMutation({
    mutationKey: ["searchIndex"],
    mutationFn: async (query: string) => {
      const response = await index.search(query, {
        limit: 10,
        attributesToRetrieve: ["id", "title", "user", "handle"],
      });
      return response.hits;
    },
  });

  const handleSelect = (hit: any) => {
    // Handle the selection of a search result
    console.log("Selected hit:", hit);
    router.push(`/@${hit?.user?.username}/${hit.handle}`);
    setOpen(false);
  };

  return (
    <>
      <div className="hidden w-full max-w-xl lg:block">
        <button
          className="w-full h-9 rounded border border-border bg-muted p-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
          onClick={() => setOpen(true)}
        >
          <p className="text-muted-foreground text-sm">
            {_t("Type to search")}...
          </p>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          onValueChange={(value) => debouncedSearch(value)}
          placeholder={_t("Search...")}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {mutation.data?.map((hit) => (
              <CommandItem onSelect={() => handleSelect(hit)} key={hit.id}>
                <span>{hit.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchInput;
