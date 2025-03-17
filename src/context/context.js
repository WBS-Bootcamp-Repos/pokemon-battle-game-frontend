import { createContext, useContext } from "react";

const RosterContext = createContext();

const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context)
    throw new Error("useRoster must be used inside of a RosterContextProvider");
  // console.log('context: ', context);

  return context;
};

export { RosterContext, useRoster };
