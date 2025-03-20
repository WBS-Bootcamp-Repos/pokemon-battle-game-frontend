/**
 * Sprite Utility Functions
 *
 * Provides helper functions for handling Pokemon sprite URLs with multiple fallback methods.
 * Includes functions for extracting Pokemon IDs, normalizing names, and generating
 * appropriate sprite URLs for both player and enemy Pokemon.
 */

/**
 * Maps common Pokémon names to their IDs for reliable sprite loading
 */
const POKEMON_NAME_TO_ID = {
  bulbasaur: 1,
  ivysaur: 2,
  venusaur: 3,
  charmander: 4,
  charmeleon: 5,
  charizard: 6,
  squirtle: 7,
  wartortle: 8,
  blastoise: 9,
  caterpie: 10,
  metapod: 11,
  butterfree: 12,
  weedle: 13,
  kakuna: 14,
  beedrill: 15,
  pidgey: 16,
  pidgeotto: 17,
  pidgeot: 18,
  rattata: 19,
  raticate: 20,
  pikachu: 25,
  raichu: 26,
  sandshrew: 27,
  sandslash: 28,
  nidoran: 29,
  nidorina: 30,
  nidoqueen: 31,
  nidorino: 33,
  nidoking: 34,
  clefairy: 35,
  clefable: 36,
  vulpix: 37,
  ninetales: 38,
  jigglypuff: 39,
  wigglytuff: 40,
  zubat: 41,
  golbat: 42,
  oddish: 43,
  gloom: 44,
  vileplume: 45,
  paras: 46,
  parasect: 47,
  venonat: 48,
  venomoth: 49,
  diglett: 50,
  dugtrio: 51,
  meowth: 52,
  persian: 53,
  psyduck: 54,
  golduck: 55,
  mankey: 56,
  primeape: 57,
  growlithe: 58,
  arcanine: 59,
  poliwag: 60,
  poliwhirl: 61,
  poliwrath: 62,
  abra: 63,
  kadabra: 64,
  alakazam: 65,
  machop: 66,
  machoke: 67,
  machamp: 68,
  bellsprout: 69,
  weepinbell: 70,
  victreebel: 71,
  tentacool: 72,
  tentacruel: 73,
  geodude: 74,
  graveler: 75,
  golem: 76,
  ponyta: 77,
  rapidash: 78,
  slowpoke: 79,
  slowbro: 80,
  magnemite: 81,
  magneton: 82,
  farfetchd: 83,
  doduo: 84,
  dodrio: 85,
  seel: 86,
  dewgong: 87,
  grimer: 88,
  muk: 89,
  shellder: 90,
  cloyster: 91,
  gastly: 92,
  haunter: 93,
  gengar: 94,
  onix: 95,
  drowzee: 96,
  hypno: 97,
  krabby: 98,
  kingler: 99,
  voltorb: 100,
  electrode: 101,
  exeggcute: 102,
  exeggutor: 103,
  cubone: 104,
  marowak: 105,
  hitmonlee: 106,
  hitmonchan: 107,
  lickitung: 108,
  koffing: 109,
  weezing: 110,
  rhyhorn: 111,
  rhydon: 112,
  chansey: 113,
  tangela: 114,
  kangaskhan: 115,
  horsea: 116,
  seadra: 117,
  goldeen: 118,
  seaking: 119,
  staryu: 120,
  starmie: 121,
  mrmime: 122,
  scyther: 123,
  jynx: 124,
  electabuzz: 125,
  magmar: 126,
  pinsir: 127,
  tauros: 128,
  magikarp: 129,
  gyarados: 130,
  lapras: 131,
  ditto: 132,
  eevee: 133,
  vaporeon: 134,
  jolteon: 135,
  flareon: 136,
  porygon: 137,
  omanyte: 138,
  omastar: 139,
  kabuto: 140,
  kabutops: 141,
  aerodactyl: 142,
  snorlax: 143,
  articuno: 144,
  zapdos: 145,
  moltres: 146,
  dratini: 147,
  dragonair: 148,
  dragonite: 149,
  mewtwo: 150,
  mew: 151,
};

/**
 * Extracts a Pokémon ID from its URL
 * @param {string} url - The Pokémon's API URL
 * @returns {string|null} - The extracted ID or null if extraction fails
 */
export const extractPokemonId = (url) => {
  try {
    if (!url) return null;

    // Handle cases where we have a full URL
    if (url.includes("pokemon/")) {
      const matches = url.match(/\/pokemon\/(\d+)\/?/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }

    // Handle cases where we just have an ID
    if (/^\d+$/.test(url)) {
      return url;
    }

    return null;
  } catch (error) {
    console.error("Error extracting Pokémon ID:", error);
    return null;
  }
};

/**
 * Normalizes a Pokémon name for URL generation
 * @param {string} name - The Pokémon's name
 * @returns {string} - The normalized name
 */
export const normalizePokemonName = (name) => {
  try {
    if (!name) return "missingno";

    // Convert to lowercase
    let normalizedName = name.toLowerCase();

    // Remove special forms indicators
    normalizedName = normalizedName
      .replace(/\s*-\s*mega/i, "")
      .replace(/\s*-\s*gmax/i, "")
      .replace(/\s*-\s*alola/i, "")
      .replace(/\s*-\s*galar/i, "")
      .replace(/\s*-\s*hisui/i, "")
      .replace(/\s*-\s*paldea/i, "")
      .replace(/\s*-\s*f$/i, "")
      .replace(/\s*-\s*m$/i, "");

    // Replace spaces with dashes and remove special characters
    normalizedName = normalizedName
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return normalizedName;
  } catch (error) {
    console.error("Error normalizing Pokémon name:", error);
    return "missingno";
  }
};

/**
 * Gets the proper sprite URL for a Pokémon
 * @param {Object} pokemon - The Pokémon object
 * @param {boolean} isEnemy - Whether the Pokémon is an enemy
 * @returns {string} - The sprite URL
 */
export const getPokemonSpriteUrl = (pokemon, isEnemy = false) => {
  try {
    if (!pokemon) {
      console.warn("No Pokémon provided to getPokemonSpriteUrl");
      return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
    }

    // For enemies, prioritize using the name-based approach
    if (isEnemy) {
      const normalizedName = normalizePokemonName(pokemon.name);
      return `https://img.pokemondb.net/sprites/home/normal/${normalizedName}.png`;
    }

    // For player Pokémon, try to use the ID-based approach first
    const id = extractPokemonId(pokemon.url);
    if (id) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }

    // Fallback to name-based approach
    const normalizedName = normalizePokemonName(pokemon.name);
    return `https://img.pokemondb.net/sprites/home/normal/${normalizedName}.png`;
  } catch (error) {
    console.error("Error getting Pokémon sprite URL:", error, pokemon);
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
  }
};

/**
 * Handles sprite loading errors by providing fallback options
 * @param {Event} event - The error event
 * @param {boolean} isEnemy - Whether the sprite is for an enemy Pokémon
 * @param {Object} pokemon - The Pokémon object
 * @returns {string} - A fallback sprite URL
 */
export const handleSpriteError = (event, isEnemy, pokemon) => {
  try {
    console.warn(
      `Sprite loading error for ${pokemon?.name || "unknown Pokémon"}:`,
      event
    );

    // If the current URL is from pokemondb, try pokeapi
    if (event.target.src.includes("pokemondb.net")) {
      const id = extractPokemonId(pokemon.url) || "0";
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }

    // If the current URL is from the official artwork, try the basic sprite
    if (event.target.src.includes("official-artwork")) {
      const id = extractPokemonId(pokemon.url) || "0";
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }

    // Last resort fallback
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
  } catch (error) {
    console.error("Error handling sprite failure:", error);
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
  }
};

/**
 * Clean a Pokémon name for reliable matching
 * @param {string} name - The raw Pokémon name
 * @return {string} - Cleaned name
 */
export const cleanPokemonName = (name) => {
  if (!name) return "";

  // First, specially handle the "Boss " prefix that appears in boss Pokemon
  let cleanName = name.replace(/^Boss\s+/i, "");

  // Convert to lowercase
  cleanName = cleanName.toLowerCase();

  // Remove spaces, hyphens, periods, and underscores
  cleanName = cleanName.replace(/[\s\-_.]/g, "");

  return cleanName;
};

/**
 * Helper function to determine Pokemon ID from various sources
 *
 * @param {Object} pokemon - Pokemon object
 * @returns {string|null} - Pokemon ID or null if not found
 */
const determinePokemonId = (pokemon) => {
  // Try to get the ID from the URL
  let pokemonId = extractPokemonId(pokemon.url);

  // If no ID from URL, try to get ID from the name
  if (!pokemonId && pokemon.name) {
    // Handle boss Pokemon names first
    let nameToCheck = pokemon.name;
    if (nameToCheck.startsWith("Boss ")) {
      nameToCheck = nameToCheck.substring(5);
    }

    // Check if it's in our map of common Pokemon names
    const cleanName = cleanPokemonName(nameToCheck);
    pokemonId = POKEMON_NAME_TO_ID[cleanName];

    // If we found an ID for a boss, log it
    if (pokemonId && pokemon.name.startsWith("Boss ")) {
      console.log(`Found ID ${pokemonId} for boss Pokemon: ${pokemon.name}`);
    }

    // If not in our map, try to extract ID from name if it contains numbers
    if (!pokemonId) {
      const idMatch = pokemon.name.match(/(\d+)/);
      if (idMatch) {
        pokemonId = idMatch[1];
      }
    }
  }

  // If ID is still not available and we have a raw ID directly on the pokemon object
  if (!pokemonId && pokemon.id) {
    pokemonId = pokemon.id;
  }

  return pokemonId;
};

/**
 * Get the front sprite URL for a Pokémon (enemy-facing)
 * @param {Object} pokemon - The Pokémon object
 * @return {string} - The sprite URL
 */
export const getFrontSprite = (pokemon) => {
  try {
    // Check if the pokemon has sprites object with front view first
    if (pokemon.sprites && pokemon.sprites.front_default) {
      return pokemon.sprites.front_default;
    }

    // Try to determine the Pokemon's ID
    let pokemonId = determinePokemonId(pokemon);

    // Handle the case where the Pokemon is a boss
    if (!pokemonId && pokemon.name && pokemon.name.includes("Boss")) {
      // Extract the actual Pokemon name from the boss name
      const baseName = pokemon.name.replace(/^Boss\s+/i, "");

      // Look up the ID using the base name
      pokemonId = POKEMON_NAME_TO_ID[cleanPokemonName(baseName)];

      console.log(`Resolved Boss ${baseName} to ID: ${pokemonId}`);
    }

    // If we have an ID, use it to construct the front sprite URL
    if (pokemonId) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    }

    // Fall back to Ditto as a last resort
    console.warn(
      `Could not determine ID for ${pokemon.name}, using fallback sprite`
    );
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png";
  } catch (error) {
    console.error("Error getting front sprite:", error);
    // Fall back to Ditto as a last resort
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png";
  }
};

/**
 * Get the back sprite URL for a Pokémon (player-facing)
 * @param {Object} pokemon - The Pokémon object
 * @return {string} - The sprite URL
 */
export const getBackSprite = (pokemon) => {
  try {
    // Check if the pokemon has sprites object with back view first
    if (pokemon.sprites && pokemon.sprites.back_default) {
      return pokemon.sprites.back_default;
    }

    // Try to determine the Pokemon's ID
    const pokemonId = determinePokemonId(pokemon);

    // If we have an ID, use it to construct the back sprite URL
    if (pokemonId) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`;
    }

    // Fall back to Ditto as a last resort
    console.warn(
      `Could not determine ID for ${pokemon.name}, using fallback sprite`
    );
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png";
  } catch (error) {
    console.error("Error getting back sprite:", error);
    // Fall back to Ditto as a last resort
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png";
  }
};

/**
 * Get the proper sprite URL based on whether it's an enemy or player Pokémon
 * @param {Object} pokemon - The Pokémon object
 * @param {boolean} isEnemy - Whether this is an enemy Pokémon
 * @return {string} - The sprite URL
 */
export const getProperSprite = (pokemon, isEnemy) => {
  if (!pokemon)
    return isEnemy
      ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
      : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png";

  return isEnemy ? getFrontSprite(pokemon) : getBackSprite(pokemon);
};

/**
 * Gets Pokemon ID from a name using the ID mapping
 * @param {string} name - Pokemon name to look up
 * @returns {number} Pokedex ID or 132 (Ditto) as fallback
 */
export const getPokemonId = (name) => {
  if (!name) return 132; // Default to Ditto (ID 132)

  // Handle boss Pokemon names
  if (name.startsWith("Boss ")) {
    const baseName = name.substring(5);
    const baseId = getPokemonId(baseName); // Recursive call with the base name
    if (baseId !== 132) {
      // If we found a valid ID (not the fallback)
      return baseId;
    }
  }

  // Clean the name (remove spaces, dashes, convert to lowercase)
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Return the ID if found, otherwise a fallback ID
  return POKEMON_NAME_TO_ID[cleanName] || 132;
};
