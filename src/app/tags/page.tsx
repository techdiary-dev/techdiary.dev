import HomeLeftSidebar from "@/app/(home)/_components/HomeLeftSidebar";
import HomeRightSidebar from "@/app/(home)/_components/HomeRightSidebar";
import SidebarToggleButton from "@/app/(home)/_components/SidebarToggleButton";
import { getTagsWithArticleCounts } from "@/backend/services/tag.action";
import HomepageLayout from "@/components/layout/HomepageLayout";
import Link from "next/link";

export default async function TagsIndexPage() {
  const result = await getTagsWithArticleCounts();

  const tags = result.success ? result.data : [];

  return (
    <HomepageLayout
      LeftSidebar={<HomeLeftSidebar />}
      RightSidebar={<HomeRightSidebar />}
      NavbarTrailing={<SidebarToggleButton />}
    >
      <div className="px-4 py-6 md:py-8 w-full max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tags
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tags with the most articles first. Counts include published articles only.
          </p>
        </header>

        {!result.success && (
          <p className="text-sm text-destructive" role="alert">
            {result.error}
          </p>
        )}

        {result.success && tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}

        {tags.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Link
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="font-medium text-foreground truncate">
                    #{tag.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {tag.article_count}{" "}
                    {tag.article_count === 1 ? "article" : "articles"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HomepageLayout>
  );
}

export async function generateMetadata() {
  return {
    title: "Tags — TechDiary",
    description:
      "Browse all topics on TechDiary with article counts for each tag.",
    openGraph: {
      title: "Tags — TechDiary",
      description:
        "Browse all topics on TechDiary with article counts for each tag.",
    },
  };
}
