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
    pikachu: 25,
    raichu: 26,
    eevee: 133,
    vaporeon: 134,
    jolteon: 135,
    flareon: 136,
    ditto: 132,
    mewtwo: 150,
    mew: 151,
    lugia: 249,
    hooh: 250,
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
  
    // Convert to lowercase
    let cleanName = name.toLowerCase();
  
    // Remove spaces, hyphens, periods, and underscores
    cleanName = cleanName.replace(/[\s\-_.]/g, "");
  
    // Remove prefixes like "boss", "enemy", etc.
    if (cleanName.startsWith("boss")) cleanName = cleanName.substring(4);
  
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
      // First check if it's in our map of common Pokemon names
      const cleanName = cleanPokemonName(pokemon.name);
      pokemonId = POKEMON_NAME_TO_ID[cleanName];
  
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
      const pokemonId = determinePokemonId(pokemon);
  
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