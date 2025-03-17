import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

// Function to get all Pokémon with detailed data
export const getAllPokemon = async () => {
  try {
    const response = await axios.get(`${BASE_URL}?limit=120`);
    const pokemonDetails = await Promise.all(
      response.data.results.map(async (pokemon) => {
        const details = await axios.get(pokemon.url);
        return details.data;
      })
    );
    return pokemonDetails;
  } catch (error) {
    console.error("Error fetching all Pokémon:", error);
    return null;
  }
};

export const getPokemonById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pokémon with ID ${id}:`, error);
    return null;
  }
};
