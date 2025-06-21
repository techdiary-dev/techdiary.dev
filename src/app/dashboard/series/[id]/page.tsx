"use client";

import * as seriesActions from "@/backend/services/series.action";
import { SortableArticleItem } from "@/components/series/SortableArticleItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
}

interface SeriesItem {
  id: string;
  type: string;
  title: string;
  article_id?: string;
  index: number;
  article?: Article;
}

interface Series {
  id: string;
  title: string;
  description?: string;
  handle: string;
  cover_image?: any;
  owner_id: string;
  items: SeriesItem[];
}

const SeriesEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const seriesId = params.id as string;
  const isNewSeries = seriesId === "new";

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Local state for form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seriesItems, setSeriesItems] = useState<SeriesItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch series data using server actions
  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useQuery({
    queryKey: ["series", seriesId],
    queryFn: () => seriesActions.getSeriesById(seriesId),
    enabled: !isNewSeries && Boolean(seriesId),
  });

  // Fetch available articles using server actions
  const { data: availableArticles = [], isLoading: isArticlesLoading } =
    useQuery({
      queryKey: ["articles", "own"],
      queryFn: () => seriesActions.getUserArticles(),
    });

  // Initialize form with series data when available
  useEffect(() => {
    if (seriesData) {
      setTitle(seriesData.title || "");
      setDescription(seriesData.description || "");
      setSeriesItems(seriesData.items || []);
    }
  }, [seriesData]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSeriesItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          index: index,
        }));
      });
    }
  };

  // Add article to series
  const addArticleToSeries = (article: Article) => {
    // Check if article already exists in series
    if (seriesItems.some((item) => item.article_id === article.id)) {
      console.log("This article is already part of the series.");
      return;
    }

    const newItem: SeriesItem = {
      id: `temp-${Date.now()}`,
      type: "article",
      title: article.title,
      article_id: article.id,
      index: seriesItems.length,
      article,
    };

    setSeriesItems((prev) => [...prev, newItem]);
  };

  // Remove article from series
  const removeArticleFromSeries = (itemId: string) => {
    setSeriesItems((prev) =>
      prev
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({
          ...item,
          index,
        }))
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      console.log("Please provide a title for the series");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");

      // Add series items data
      formData.append("items", JSON.stringify(seriesItems));

      if (isNewSeries) {
        const result = await seriesActions.createSeries(formData);
        if (result?.id) {
          // Navigate to the edit page for the newly created series
          router.push(`/dashboard/series/${result.id}`);
        }
      } else {
        await seriesActions.updateSeries(seriesId, formData);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["series"] });
        queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
      }

      console.log(
        `Series ${isNewSeries ? "created" : "updated"} successfully!`
      );
    } catch (error) {
      console.error(
        `Error ${isNewSeries ? "creating" : "updating"} series:`,
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  if ((isSeriesLoading || isArticlesLoading) && !isNewSeries) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  if (seriesError && !isNewSeries) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/30">
        {(seriesError as Error).message || "Error loading series data"}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 text-foreground">
      <div className="mb-6">
        <Link
          href="/dashboard/series"
          className="flex items-center text-sm hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to series
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-foreground">
        {isNewSeries ? "Create New Series" : "Edit Series"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="title"
                  className="block font-medium mb-1 text-foreground"
                >
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter series title"
                  required
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block font-medium mb-1 text-foreground"
                >
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter series description"
                  rows={4}
                  className="bg-background border-border"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Articles in this Series
            </h2>
            <div className="mb-6 bg-card dark:bg-card rounded-lg p-4 border border-border">
              {seriesItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No articles added to this series yet. Add articles from the
                  panel on the right.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={seriesItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {seriesItems.map((item) => (
                        <SortableArticleItem
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          onRemove={() => removeArticleFromSeries(item.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Series
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card dark:bg-card rounded-lg p-4 sticky top-6 border border-border">
            <h3 className="text-lg font-medium mb-4 text-foreground">
              Your Articles
            </h3>
            {!availableArticles || availableArticles.length === 0 ? (
              <p className="text-muted-foreground mb-4">
                You don't have any articles yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {availableArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-background dark:bg-card/80 p-3 rounded-md flex justify-between items-center border border-border"
                  >
                    <div className="overflow-hidden text-sm">
                      <p className="truncate text-foreground">
                        {article.title}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addArticleToSeries(article)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesEditPage;
