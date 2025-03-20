/**
 * Pokemon Type Utility Functions
 *
 * Provides helper functions for detecting and working with Pokemon types.
 * Centralizes type detection logic to avoid duplication across components.
 */

/**
 * Map of common Pokemon names to their primary types
 * Used for reliable type detection when API data is incomplete
 */
export const KNOWN_POKEMON_TYPES = {
  // Grass types
  bulbasaur: "grass",
  ivysaur: "grass",
  venusaur: "grass",
  oddish: "grass",
  gloom: "grass",
  vileplume: "grass",
  bellsprout: "grass",
  weepinbell: "grass",
  victreebel: "grass",
  exeggcute: "grass",
  exeggutor: "grass",
  tangela: "grass",

  // Fire types
  charmander: "fire",
  charmeleon: "fire",
  charizard: "fire",
  vulpix: "fire",
  ninetales: "fire",
  growlithe: "fire",
  arcanine: "fire",
  ponyta: "fire",
  rapidash: "fire",
  magmar: "fire",
  flareon: "fire",
  moltres: "fire",

  // Water types
  squirtle: "water",
  wartortle: "water",
  blastoise: "water",
  psyduck: "water",
  golduck: "water",
  poliwag: "water",
  poliwhirl: "water",
  poliwrath: "water",
  staryu: "water",
  starmie: "water",
  magikarp: "water",
  gyarados: "water",
  lapras: "water",
  vaporeon: "water",

  // Electric types
  pikachu: "electric",
  raichu: "electric",
  magnemite: "electric",
  magneton: "electric",
  voltorb: "electric",
  electrode: "electric",
  electabuzz: "electric",
  jolteon: "electric",
  zapdos: "electric",

  // Psychic types
  abra: "psychic",
  kadabra: "psychic",
  alakazam: "psychic",
  slowpoke: "psychic",
  slowbro: "psychic",
  drowzee: "psychic",
  hypno: "psychic",
  exeggcute: "psychic",
  exeggutor: "psychic",
  starmie: "psychic",
  "mr. mime": "psychic",
  mrmime: "psychic",
  jynx: "psychic",
  mewtwo: "psychic",
  mew: "psychic",

  // Ghost types
  gastly: "ghost",
  haunter: "ghost",
  gengar: "ghost",

  // Ice types
  jynx: "ice",
  articuno: "ice",

  // Dragon types
  dratini: "dragon",
  dragonair: "dragon",
  dragonite: "dragon",

  // Normal types
  pidgey: "normal",
  rattata: "normal",
  eevee: "normal",
  snorlax: "normal",
  ditto: "normal",
};

/**
 * Map of Pokemon types to their signature moves
 */
export const TYPE_TO_MOVE = {
  normal: "Tackle",
  fire: "Ember",
  water: "Water Gun",
  grass: "Vine Whip",
  electric: "Thunder Shock",
  poison: "Poison Sting",
  psychic: "Confusion",
  fighting: "Karate Chop",
  rock: "Rock Throw",
  ground: "Sand Attack",
  flying: "Gust",
  ice: "Ice Shard",
  bug: "Bug Bite",
  dragon: "Dragon Rage",
  ghost: "Shadow Ball",
  fairy: "Fairy Wind",
  dark: "Bite",
  steel: "Metal Claw",
};

/**
 * Cleans a Pokemon name for reliable matching
 * @param {string} name - Pokemon name to clean
 * @returns {string} Cleaned name in lowercase with special characters removed
 */
export const cleanPokemonName = (name) => {
  if (!name) return "";

  // Convert to lowercase and remove special characters
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Determines a Pokemon's type based on available data
 * Uses multiple fallback strategies to ensure a type is always returned
 *
 * @param {Object} pokemon - The Pokemon object
 * @returns {string} The Pokemon's type (lowercase)
 */
export const getPokemonType = (pokemon) => {
  if (!pokemon) return "normal";

  // Check by name first - most reliable for known pokemon
  if (pokemon.name) {
    const cleanName = cleanPokemonName(pokemon.name);
    if (KNOWN_POKEMON_TYPES[cleanName]) {
      return KNOWN_POKEMON_TYPES[cleanName];
    }
  }

  // Check if Pokémon has a defined attack with type
  if (pokemon.attack && pokemon.attack.type) {
    return pokemon.attack.type.toLowerCase();
  }

  // Check for first move in moves array
  else if (pokemon.moves && pokemon.moves.length > 0 && pokemon.moves[0].type) {
    return pokemon.moves[0].type.toLowerCase();
  }

  // Enhanced type extraction
  let pokemonType = "normal"; // Default fallback

  // Direct type property as string
  if (typeof pokemon.type === "string") {
    pokemonType = pokemon.type;
  }
  // Type object with name
  else if (pokemon.type && pokemon.type.name) {
    pokemonType = pokemon.type.name;
  }
  // Check types array - various formats
  else if (pokemon.types && pokemon.types.length > 0) {
    // String format in array
    if (typeof pokemon.types[0] === "string") {
      pokemonType = pokemon.types[0];
    }
    // PokeAPI format
    else if (pokemon.types[0].type && pokemon.types[0].type.name) {
      pokemonType = pokemon.types[0].type.name;
    }
    // Object with name property
    else if (pokemon.types[0].name) {
      pokemonType = pokemon.types[0].name;
    }
  }

  return pokemonType.toLowerCase(); // Return lowercase for consistency
};

/**
 * Generates a type-appropriate move for a Pokemon
 * @param {Object} pokemon - The Pokemon object
 * @returns {Object|null} A move object with name, type, and power
 */
export const generateTypeBasedMove = (pokemon) => {
  if (!pokemon) return null;

  const pokemonType = getPokemonType(pokemon);
  const moveName = TYPE_TO_MOVE[pokemonType] || "Tackle";

  return {
    name: moveName,
    type: pokemonType,
    power: Math.floor(5 + (pokemon.level || 1) * 1.5),
  };
};
