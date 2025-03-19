import { toast } from "react-toastify";

export const addToRoster = (pokemon, setRosterPokemon) => {
  const { id, name, stats } = pokemon;

  // Determine the message BEFORE updating state
  let message = null;

  setRosterPokemon((prevRoster) => {
    if (prevRoster.some((p) => p.id === id)) {
      message = `${name} is already in the roster!`;
      return prevRoster;
    }
    if (prevRoster.length >= 6) {
      message = "Your roster is full! Remove a Pokémon first.";
      return prevRoster;
    }

    const newPokemon = { id, name, stats };
    message = `${name} added to the roster!`;
    return [...prevRoster, newPokemon];
  });

  // Show toast OUTSIDE of the state update to avoid double execution
  if (message) {
    toast(message, {
      className:
        "border-4 border-black border-x-8 rounded-none font-jersey text-black text-2xl p-8",
      closeButton: false,
    });
  }
};

export const removeFromRoster = (pokemonId, setRosterPokemon) => {
  const deleted = () =>
    toast("Pokémon removed.", {
      className:
        "border-4 border-black border-x-8 rounded-none font-jersey text-black text-2xl p-8",
      closeButton: false,
    });
  try {
    setRosterPokemon((prevRoster) =>
      prevRoster.filter((p) => p.id !== pokemonId)
    );
    deleted();
  } catch (error) {
    console.error(error);
  }
};
