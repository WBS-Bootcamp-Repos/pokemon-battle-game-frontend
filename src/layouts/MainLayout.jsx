import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="flex flex-row min-h-screen overflow-x-hidden font-jersey">
      <Sidebar />
      <main className="flex flex-col p-16 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
