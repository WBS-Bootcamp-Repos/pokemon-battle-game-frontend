import { useState, useEffect } from "react";
import { RosterContext } from "./context";

const RosterContextProvider = ({ children }) => {
  const [rosterPokemon, setRosterPokemon] = useState(() => {
    return JSON.parse(localStorage.getItem("roster")) || [];
  });

  useEffect(() => {
    localStorage.setItem("roster", JSON.stringify(rosterPokemon));
  }, [rosterPokemon]);

  return (
    <RosterContext.Provider
      value={{
        rosterPokemon,
        setRosterPokemon,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export default RosterContextProvider;
