export const addToRoster = (pokemon, setRosterPokemon) => {
  try {
    setRosterPokemon((prevRoster) => {
      if (prevRoster.some((p) => p.id === pokemon.id)) {
        console.log(`${pokemon.name} is already in the roster!`);
        return prevRoster;
      }
      if (prevRoster.length >= 6) {
        console.log("Your roster is full! Remove a Pokémon first.");
        return prevRoster;
      }
      const { id, name, stats } = pokemon;
      const newPokemon = { id, name, stats };
      return [...prevRoster, newPokemon];
    });
  } catch (error) {
    console.error(error);
  }
};

export const removeFromRoster = (pokemonId, setRosterPokemon) => {
  try {
    setRosterPokemon((prevRoster) =>
      prevRoster.filter((p) => p.id !== pokemonId)
    );
  } catch (error) {
    console.error(error);
  }
};
