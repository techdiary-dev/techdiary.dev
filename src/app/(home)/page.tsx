import HomepageLayout from "@/components/layout/HomepageLayout";
import { Metadata } from "next";
import ArticleFeed from "./_components/ArticleFeed";
import HomeLeftSidebar from "./_components/HomeLeftSidebar";
import HomeRightSidebar from "./_components/HomeRightSidebar";
import SidebarToggleButton from "./_components/SidebarToggleButton";
import FakeEditor from "./_components/FakeEditor";
import { getSession } from "@/auth/auth";

export const metadata: Metadata = {
  title: "Home",
};

const Page = async () => {
  // const session = await getSession();
  return (
    <HomepageLayout
      LeftSidebar={<HomeLeftSidebar />}
      RightSidebar={<HomeRightSidebar />}
      NavbarTrailing={<SidebarToggleButton />}
    >
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      <div className="px-4 my-2 md:m-0">
        <FakeEditor />
      </div>
      <ArticleFeed />
    </HomepageLayout>
  );
};

export default Page;
