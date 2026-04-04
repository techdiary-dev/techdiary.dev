import HomepageLayout from "@/components/layout/HomepageLayout";
import ArticleFeed from "./_components/ArticleFeed";
import FakeEditor from "./_components/FakeEditor";
import HomeLeftSidebar from "./_components/HomeLeftSidebar";
import HomeRightSidebar from "./_components/HomeRightSidebar";
import SidebarToggleButton from "./_components/SidebarToggleButton";

const Page = () => {
  return (
    <HomepageLayout
      LeftSidebar={<HomeLeftSidebar />}
      RightSidebar={<HomeRightSidebar />}
      NavbarTrailing={<SidebarToggleButton />}
    >
      <div className="flex flex-col gap-3 p-2">
        <div className="pb-2 md:m-0">
          <FakeEditor />
        </div>
        <ArticleFeed />
      </div>
    </HomepageLayout>
  );
};

export default Page;
