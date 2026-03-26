import HomeLeftSidebar from "@/app/(home)/_components/HomeLeftSidebar";
import HomeRightSidebar from "@/app/(home)/_components/HomeRightSidebar";
import SidebarToggleButton from "@/app/(home)/_components/SidebarToggleButton";
import HomepageLayout from "@/components/layout/HomepageLayout";
import TagArticleFeed from "./_components/TagArticleFeed";
import { getTag } from "@/backend/services/tag.action";
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
    title: `#${tag_name}`,
    description: `Browse all ${tag_name} articles on TechDiary`,
    openGraph: {
      title: `#${tag_name} — TechDiary`,
      description: `Browse all ${tag_name} articles on TechDiary`,
    },
  };
}
