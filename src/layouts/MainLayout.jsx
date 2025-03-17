import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";
import RosterContextProvider from "../context/RosterContextProvider";

const MainLayout = () => {
  return (
    <RosterContextProvider>
      <div className="flex flex-row min-h-screen overflow-x-hidden font-jersey">
        <Sidebar />
        <main className="flex flex-col p-16 w-full">
          <Outlet />
        </main>
      </div>
    </RosterContextProvider>
  );
};

export default MainLayout;
