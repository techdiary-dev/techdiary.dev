"use client";

import * as seriesActions from "@/backend/services/series.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  GripVertical,
  Loader,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// SortableArticleItem component for drag-and-drop functionality
const SortableArticleItem = ({ id, title, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-background dark:bg-card p-3 rounded-md border border-border mb-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <span className="flex-1 truncate text-foreground">{title}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="ml-2 text-muted-foreground hover:text-destructive"
        aria-label="Remove article from series"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

const NewSeriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user's articles
  const {
    data: userArticles = [],
    isLoading: isArticlesLoading,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ["user-articles"],
    queryFn: () => seriesActions.getUserArticles(),
  });

  // Filtered articles based on search term
  const filteredArticles = userArticles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create series mutation
  const createSeriesMutation = useMutation({
    mutationFn: (formData) => seriesActions.createSeries(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      if (data && data.id) {
        router.push(`/dashboard/series/${data.id}`);
      } else {
        // If there's no ID, just redirect to the series list
        console.warn(
          "Created series returned no ID, redirecting to series list"
        );
        router.push(`/dashboard/series`);
      }
    },
    onError: (error) => {
      console.error("Error creating series:", error);
    },
  });

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedArticles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Add article to series
  const addArticleToSeries = (article) => {
    // Check if article already exists in series
    if (selectedArticles.some((item) => item.id === article.id)) {
      return;
    }

    setSelectedArticles((prev) => [
      ...prev,
      {
        id: article.id,
        title: article.title,
        article_id: article.id,
        type: "article",
      },
    ]);
  };

  // Remove article from series
  const removeArticleFromSeries = (articleId) => {
    setSelectedArticles((prev) =>
      prev.filter((article) => article.id !== articleId)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");

      // Add selected articles data with index
      formData.append(
        "items",
        JSON.stringify(
          selectedArticles.map((article, index) => ({
            ...article,
            index,
          }))
        )
      );

      createSeriesMutation.mutate(formData);
    } catch (error) {
      console.error("Error preparing form data:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
        Create New Series
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
              {selectedArticles.length === 0 ? (
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
                    items={selectedArticles.map((article) => article.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedArticles.map((article) => (
                        <SortableArticleItem
                          key={article.id}
                          id={article.id}
                          title={article.title}
                          onRemove={() => removeArticleFromSeries(article.id)}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Series
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
            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  placeholder="Search your articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-background border-border"
                />
              </div>
            </div>

            {isArticlesLoading ? (
              <div className="flex justify-center p-4">
                <Loader className="animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <p className="text-muted-foreground p-2">
                {searchTerm
                  ? "No articles matching your search."
                  : "You don't have any articles yet."}
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className={`hover:border-primary transition-colors ${
                      selectedArticles.some((a) => a.id === article.id)
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <CardContent className="p-3 flex justify-between items-center">
                      <div className="overflow-hidden text-sm">
                        <p className="truncate text-foreground">
                          {article.title}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addArticleToSeries(article)}
                        disabled={selectedArticles.some(
                          (a) => a.id === article.id
                        )}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSeriesPage;
