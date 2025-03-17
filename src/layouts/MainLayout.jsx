import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="flex flex-row min-h-screen justify-between overflow-x-hidden font-jersey">
      <Sidebar />
      <main className="flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
