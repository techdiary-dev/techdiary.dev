import DashboardArticleList from "./_components/DashboardArticleList";
import MatrixReport from "./_components/MatrixReport";
// import ViewsChart from "./_components/ViewsChart";

const page = () => {
  return (
    <>
      {/* <ViewsChart /> */}
      <MatrixReport />
      <DashboardArticleList />
    </>
  );
};

export default page;
