import { createContext, useContext } from "react";

const RosterContext = createContext();

const useRoster = () => {
  const context = useContext(RosterContext);
  if (!context)
    throw new Error("useRoster must be used inside of a RosterContextProvider");
  // console.log('context: ', context);

  return context;
};

// Item hooks
const useItems = () => {
  const { items, updateItemQuantity, buyItem, useItem } = useRoster();
  return { items, updateItemQuantity, buyItem, useItem };
};

// Currency hooks
const useCurrency = () => {
  const { currency, updateCurrency } = useRoster();
  return { currency, updateCurrency };
};

export { RosterContext, useRoster, useItems, useCurrency };
