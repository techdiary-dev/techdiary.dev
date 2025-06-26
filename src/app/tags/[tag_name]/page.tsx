import HomeLeftSidebar from "@/app/(home)/_components/HomeLeftSidebar";
import HomeRightSidebar from "@/app/(home)/_components/HomeRightSidebar";
import SidebarToggleButton from "@/app/(home)/_components/SidebarToggleButton";
import HomepageLayout from "@/components/layout/HomepageLayout";
import TagArticleFeed from "./_components/TagArticleFeed";
import { getTag, getTags } from "@/backend/services/tag.action";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: Promise<{
    tag_name: string;
  }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag_name } = await params;
  const tag = await getTag({ name: tag_name });

  if (!tag?.success) {
    throw notFound();
  }

  return (
    <HomepageLayout
      LeftSidebar={<HomeLeftSidebar />}
      RightSidebar={<HomeRightSidebar />}
      NavbarTrailing={<SidebarToggleButton />}
    >
      <TagArticleFeed tag={tag?.data} />
    </HomepageLayout>
  );
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag_name } = await params;

  // For now, use tag_id in the title. Later we can fetch the tag name if needed
  return {
    title: `Tag ${tag_name} - Tech Diary`,
    description: `Browse all articles with this tag on Tech Diary`,
    openGraph: {
      title: `Tag ${tag_name} - Tech Diary`,
      description: `Browse all articles with this tag on Tech Diary`,
    },
  };
}
