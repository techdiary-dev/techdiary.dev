"use client";

import * as seriesActions from "@/backend/services/series.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";

const SeriesPage = () => {
  const queryClient = useQueryClient();

  // Use TanStack Query to fetch series data with server actions
  const {
    data: series,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["series"],
    queryFn: () => seriesActions.getSeriesDetailByHandle(),
  });

  // Use mutation for delete operation
  const deleteMutation = useMutation({
    mutationFn: (seriesId: string) => seriesActions.deleteSeries(seriesId),
    onSuccess: () => {
      // Invalidate series query to refetch updated list
      queryClient.invalidateQueries({ queryKey: ["series"] });
      console.log("Series deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting series:", error);
      console.log("Failed to delete series. Please try again.");
    },
  });

  const handleDeleteSeries = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this series?")) {
      return;
    }
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Series</h1>
        <Link href="/dashboard/series/new" passHref>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Series
          </Button>
        </Link>
      </div>

      {!series || series.meta.totalCount === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-6">
            You don't have any series yet.
          </p>
          <Link href="/dashboard/series/new" passHref>
            <Button>Create your first series</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.nodes.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.cover_image && (
                <div className="h-40 overflow-hidden">
                  {/* <img
                    src={item.cover_image.}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  /> */}
                </div>
              )}
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                {/* <CardDescription>
                  {item.items ? `${item.items.length} articles` : "0 articles"}
                </CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Link href={`/dashboard/series/${item.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSeries(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesPage;
