import DashboardAnalyticsOverview from "./_components/DashboardAnalyticsOverview";
import DashboardArticleList from "./_components/DashboardArticleList";
import MatrixReport from "./_components/MatrixReport";

const page = () => {
  return (
    <>
      <DashboardAnalyticsOverview />
      <MatrixReport />
      <DashboardArticleList />
    </>
  );
};

export default page;
