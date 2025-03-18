import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

// Function to format stats
const formatStats = (statsArray) => {
  const stats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };

  statsArray.forEach((stat) => {
    switch (stat.stat.name) {
      case "hp":
        stats.hp = stat.base_stat;
        break;
      case "attack":
        stats.attack = stat.base_stat;
        break;
      case "defense":
        stats.defense = stat.base_stat;
        break;
      case "special-attack":
        stats.specialAttack = stat.base_stat;
        break;
      case "special-defense":
        stats.specialDefense = stat.base_stat;
        break;
      case "speed":
        stats.speed = stat.base_stat;
        break;
      default:
        break;
    }
  });

  return stats;
};

// Function to get all Pokémon with detailed data
export const getAllPokemon = async () => {
  try {
    const response = await axios.get(`${BASE_URL}?limit=120`);
    const pokemonDetails = await Promise.all(
      response.data.results.map(async (pokemon) => {
        const details = await axios.get(pokemon.url);
        return {
          ...details.data,
          stats: formatStats(details.data.stats), // Normalize stats
        };
      })
    );
    return pokemonDetails;
  } catch (error) {
    console.error("Error fetching all Pokémon:", error);
    return null;
  }
};

// Get a single Pokémon with formatted stats
export const getPokemonById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return {
      ...response.data,
      stats: formatStats(response.data.stats), // Normalize stats
    };
  } catch (error) {
    console.error(`Error fetching Pokémon with ID ${id}:`, error);
    return null;
  }
};
