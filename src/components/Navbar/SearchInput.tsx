"use client";

import { useTranslation } from "@/i18n/use-translation";
import {
  algoliaSearchClient,
  ARTICLES_INDEX,
} from "@/lib/algolia.client";

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

type ArticleHit = {
  objectID: string;
  id?: string;
  title?: string;
  handle?: string;
  user?: { username?: string };
};

const SearchInput = () => {
  const { _t } = useTranslation();
  const router = useRouter();

  const [open, setOpen] = useAtom(searchBarAtom);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    mutation.mutate(query);
  }, 500);

  const mutation = useMutation({
    mutationKey: ["searchIndex"],
    mutationFn: async (query: string): Promise<ArticleHit[]> => {
      if (!query.trim()) return [];
      const { results } = await algoliaSearchClient.searchForHits({
        requests: [
          {
            indexName: ARTICLES_INDEX,
            query,
            hitsPerPage: 10,
            attributesToRetrieve: ["id", "title", "user", "handle"],
          },
        ],
      });
      return (results[0]?.hits ?? []) as ArticleHit[];
    },
  });

  const handleSelect = (hit: ArticleHit) => {
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
              <CommandItem
                onSelect={() => handleSelect(hit)}
                key={hit.id ?? hit.objectID}
              >
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
