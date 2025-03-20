import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";
import RosterContextProvider from "../context/RosterContextProvider";
import { BattleProvider } from "../context/BattleContext";

const MainLayout = () => {
  return (
    <RosterContextProvider>
      <BattleProvider>
        <div className="flex flex-row min-h-screen overflow-x-hidden font-jersey bg-white text-black">
          <Sidebar />
          <main className="flex flex-col p-16 w-full">
            <Outlet />
          </main>
        </div>
      </BattleProvider>
    </RosterContextProvider>
  );
};

export default MainLayout;
