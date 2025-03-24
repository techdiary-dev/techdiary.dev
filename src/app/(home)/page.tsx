import HomepageLayout from "@/components/layout/HomepageLayout";
import { Metadata } from "next";
import ArticleFeed from "./_components/ArticleFeed";
import HomeLeftSidebar from "./_components/HomeLeftSidebar";
import HomeRightSidebar from "./_components/HomeRightSidebar";
import SidebarToggleButton from "./_components/SidebarToggleButton";

export const metadata: Metadata = {
  title: "Home",
};

const Page = async () => {
  // const articles = await articleRepository.articleFeed({ limit: 30, page: 1 });

  return (
    <HomepageLayout
      LeftSidebar={<HomeLeftSidebar />}
      RightSidebar={<HomeRightSidebar />}
      NavbarTrailing={<SidebarToggleButton />}
    >
      <ArticleFeed />
    </HomepageLayout>
  );
};

export default Page;
