/**
 * Roster Utility Functions
 *
 * Provides functions for managing the player's Pokemon roster including:
 * - Adding Pokemon with proper initialization of stats
 * - Removing Pokemon from the roster
 * - Generating appropriate attack names based on type
 */
import { toast } from "react-toastify";

/**
 * Determines an appropriate attack name for a Pokemon based on its type
 * Falls back to "Tackle" if type information is missing
 *
 * @param {Object} pokemon - Pokemon data object from API or storage
 * @returns {string} Appropriate attack name for the Pokemon's type
 */
function getPokemonAttackName(pokemon) {
  // Check if pokemon or types is undefined or empty
  if (
    !pokemon ||
    !pokemon.types ||
    !pokemon.types.length ||
    !pokemon.types[0] ||
    !pokemon.types[0].type
  ) {
    return "Tackle"; // Default attack if type information is missing
  }

  const type = pokemon.types[0].type.name;
  const attacks = {
    normal: "Tackle",
    fire: "Ember",
    water: "Water Gun",
    grass: "Vine Whip",
    electric: "Thunder Shock",
    ice: "Ice Beam",
    fighting: "Karate Chop",
    poison: "Poison Sting",
    ground: "Sand Attack",
    flying: "Gust",
    psychic: "Confusion",
    bug: "Bug Bite",
    rock: "Rock Throw",
    ghost: "Shadow Ball",
    dragon: "Dragon Rage",
    dark: "Bite",
    steel: "Metal Claw",
    fairy: "Fairy Wind",
  };

  return attacks[type] || "Tackle";
}

/**
 * Adds a Pokemon to the player's roster with proper stat initialization
 * Validates roster size limits and prevents duplicates
 *
 * @param {Object} pokemon - Pokemon data to add to roster
 * @param {Function} setRosterPokemon - State setter function to update roster
 * @returns {boolean} Whether the addition was successful
 */
export const addToRoster = (pokemon, setRosterPokemon) => {
  // Skip if not a valid pokemon object
  if (!pokemon || !pokemon.id) {
    toast.error("Invalid Pokémon data");
    return false;
  }

  // Get roster from localStorage
  const currentRoster = JSON.parse(localStorage.getItem("roster") || "[]");

  // Check if Pokemon is already in roster
  if (currentRoster.some((p) => p.id === pokemon.id)) {
    toast.info(`${pokemon.name} is already in your roster!`);
    return false;
  }

  // Check roster size limit
  if (currentRoster.length >= 6) {
    toast.error("Your roster is full! (6 Pokémon maximum)");
    return false;
  }

  // Initialize or normalize the Pokemon's stats
  const level = pokemon.level || 1;
  const initialHp =
    pokemon.stats?.hp ||
    pokemon.stats?.find((s) => s.stat.name === "hp")?.base_stat ||
    50;

  // Properly prepare Pokemon object with stats
  const preparedPokemon = {
    ...pokemon,
    level: level,
    xp: pokemon.xp || 0,
    currentHp: initialHp, // Set current HP to max HP initially
    maxHp: initialHp,
    stats: {
      ...(pokemon.stats || {}),
      hp: initialHp,
    },
    attack: {
      name: getPokemonAttackName(pokemon),
      power: 40 + level * 2,
      type:
        pokemon.types && pokemon.types.length > 0
          ? pokemon.types[0].type.name
          : "normal",
    },
  };

  // Add the Pokemon to roster
  const updatedRoster = [...currentRoster, preparedPokemon];
  localStorage.setItem("roster", JSON.stringify(updatedRoster));
  setRosterPokemon(updatedRoster);

  // Provide feedback to user
  toast.success(`${pokemon.name} was added to your roster!`);
  return true;
};

/**
 * Removes a Pokemon from the player's roster
 *
 * @param {string|number} pokemonId - ID of the Pokemon to remove
 * @param {Function} setRosterPokemon - State setter function to update roster
 */
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
    // Remove this console.error
  }
};
