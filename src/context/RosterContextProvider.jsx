/**
 * RosterContext Provider
 * 
 * Manages the player's Pokemon roster, items, and currency with localStorage persistence.
 * Provides functions for Pokemon management (add, remove, level up), item usage,
 * and currency transactions.
 */
import { useState, useEffect } from "react";
import { RosterContext } from "./context";

const RosterContextProvider = ({ children }) => {
  // Initialize roster state from localStorage with data validation
  const [rosterPokemon, setRosterPokemon] = useState(() => {
    const savedRoster = JSON.parse(localStorage.getItem("roster")) || [];
    // Ensure all roster Pokémon have level, xp, and currentHp properties
    return savedRoster.map((pokemon) => ({
      ...pokemon,
      level: pokemon.level || 1,
      xp: pokemon.xp || 0,
      currentHp: pokemon.currentHp || pokemon.stats.hp,
      attack: pokemon.attack || {
        name: getPokemonAttackName(pokemon),
        power: 50 + (pokemon.level || 1) * 2,
        type:
          pokemon.types && pokemon.types.length > 0 && pokemon.types[0].type
            ? pokemon.types[0].type.name
            : "normal", // Default to normal type if missing
      },
    }));
  });

  // Initialize currency from localStorage
  const [currency, setCurrency] = useState(() => {
    return parseInt(localStorage.getItem("currency")) || 100;
  });

  // Initialize items with versioning for future updates
  const [items, setItems] = useState(() => {
    // Define the current version of the items structure
    const CURRENT_ITEMS_VERSION = 2;

    // Get stored items and version
    const storedItems = JSON.parse(localStorage.getItem("items"));
    const storedVersion = parseInt(localStorage.getItem("items_version")) || 1;

    // Default items array with all the items
    const defaultItems = [
      {
        id: "potion",
        name: "Potion",
        description: "Restores 20 HP to a Pokémon",
        effect: "heal",
        amount: 20,
        quantity: 3,
        price: 50,
        icon: "🧪",
        category: "healing",
        battleUsable: true,
        color: "#ff9999",
      },
      {
        id: "super-potion",
        name: "Super Potion",
        description: "Restores 50 HP to a Pokémon",
        effect: "heal",
        amount: 50,
        quantity: 1,
        price: 150,
        icon: "🧴",
        category: "healing",
        battleUsable: true,
        color: "#9999ff",
      },
      {
        id: "hyper-potion",
        name: "Hyper Potion",
        description: "Restores 120 HP to a Pokémon",
        effect: "heal",
        amount: 120,
        quantity: 0,
        price: 300,
        icon: "🧫",
        category: "healing",
        battleUsable: true,
        color: "#99ffbb",
      },
      {
        id: "max-potion",
        name: "Max Potion",
        description: "Fully restores HP to a Pokémon",
        effect: "fullheal",
        amount: 999,
        quantity: 0,
        price: 700,
        icon: "🧬",
        category: "healing",
        battleUsable: true,
        color: "#ffbb99",
      },
      {
        id: "revive",
        name: "Revive",
        description: "Revives a fainted Pokémon with half HP",
        effect: "revive",
        amount: 0.5,
        quantity: 1,
        price: 200,
        icon: "⭐",
        category: "revival",
        battleUsable: true,
        color: "#ffff99",
      },
      {
        id: "max-revive",
        name: "Max Revive",
        description: "Revives a fainted Pokémon with full HP",
        effect: "revive",
        amount: 1.0,
        quantity: 0,
        price: 500,
        icon: "🌟",
        category: "revival",
        battleUsable: true,
        color: "#ffddaa",
      },
      {
        id: "antidote",
        name: "Antidote",
        description: "Cures a poisoned Pokémon",
        effect: "status",
        statusEffect: "poison",
        quantity: 1,
        price: 100,
        icon: "🧪",
        category: "status",
        battleUsable: true,
        color: "#bb99ff",
      },
      {
        id: "x-attack",
        name: "X Attack",
        description: "Raises Attack by 20% for the battle",
        effect: "boost",
        stat: "attack",
        amount: 0.2,
        quantity: 0,
        price: 250,
        icon: "⚔️",
        category: "battle",
        battleUsable: true,
        color: "#ff7777",
      },
      {
        id: "x-defense",
        name: "X Defense",
        description: "Raises Defense by 20% for the battle",
        effect: "boost",
        stat: "defense",
        amount: 0.2,
        quantity: 0,
        price: 250,
        icon: "🛡️",
        category: "battle",
        battleUsable: true,
        color: "#77bbff",
      },
      {
        id: "rare-candy",
        name: "Rare Candy",
        description: "Raises a Pokémon's level by 1",
        effect: "levelup",
        amount: 1,
        quantity: 0,
        price: 1000,
        icon: "🍬",
        category: "growth",
        battleUsable: false,
        color: "#ffaaff",
      },
    ];

    // If stored version is older or items don't exist, update to new structure
    if (!storedItems || storedVersion < CURRENT_ITEMS_VERSION) {
      // Store version in localStorage
      localStorage.setItem("items_version", CURRENT_ITEMS_VERSION.toString());

      // If there were old items, preserve their quantities
      if (storedItems && storedItems.length > 0) {
        // Map of old item IDs to their quantities
        const oldQuantities = {};
        storedItems.forEach((item) => {
          oldQuantities[item.id] = item.quantity;
        });

        // Apply old quantities to new items structure
        const updatedItems = defaultItems.map((item) => {
          if (oldQuantities[item.id] !== undefined) {
            return { ...item, quantity: oldQuantities[item.id] };
          }
          return item;
        });

        // Save to localStorage
        localStorage.setItem("items", JSON.stringify(updatedItems));

        return updatedItems;
      }

      // No old items, use defaults
      localStorage.setItem("items", JSON.stringify(defaultItems));
      return defaultItems;
    }

    // Return stored items if version is current
    return storedItems;
  });

  // Persist roster to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("roster", JSON.stringify(rosterPokemon));
  }, [rosterPokemon]);

  // Persist currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  // Persist items to localStorage when they change
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  /**
   * Determines an appropriate attack name based on Pokemon's type
   * @param {Object} pokemon - The Pokemon object
   * @returns {string} Attack name based on type
   */
  function getPokemonAttackName(pokemon) {
    // Normalize the type extraction
    let type = "normal"; // Default fallback type

    if (!pokemon) return "Tackle";

    // Try to extract type from different possible structures
    if (pokemon.type) {
      // Direct type property
      type = pokemon.type.toLowerCase();
    } else if (pokemon.types && pokemon.types.length > 0) {
      // PokeAPI format: types array with objects
      if (pokemon.types[0].type && pokemon.types[0].type.name) {
        type = pokemon.types[0].type.name.toLowerCase();
      } else if (typeof pokemon.types[0] === "string") {
        type = pokemon.types[0].toLowerCase();
      } else if (pokemon.types[0].name) {
        type = pokemon.types[0].name.toLowerCase();
      }
    }

    // Map of Pokemon types to signature moves
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
   * Extracts Pokemon type from various possible data structures
   * @param {Object} pokemon - The Pokemon object 
   * @returns {string} Pokemon's primary type
   */
  function extractPokemonType(pokemon) {
    if (!pokemon) return "normal";

    let pokemonType = "normal"; // Default fallback

    if (pokemon.type) {
      pokemonType = pokemon.type.toLowerCase();
    } else if (pokemon.types && pokemon.types.length > 0) {
      if (pokemon.types[0].type && pokemon.types[0].type.name) {
        pokemonType = pokemon.types[0].type.name.toLowerCase();
      } else if (typeof pokemon.types[0] === "string") {
        pokemonType = pokemon.types[0].toLowerCase();
      } else if (pokemon.types[0].name) {
        pokemonType = pokemon.types[0].name.toLowerCase();
      }
    }

    return pokemonType;
  }

  /**
   * Adds a Pokemon to the player's roster with initialized stats
   * @param {Object} pokemon - Pokemon to add 
   */
  const addPokemonToRoster = (pokemon) => {
    // Initialize default values if missing
    if (!pokemon.level) {
      pokemon.level = 1;
    }
    if (!pokemon.xp) {
      pokemon.xp = 0;
    }
    if (!pokemon.currentHp) {
      pokemon.currentHp = pokemon.stats.hp;
    }

    // Extract type and assign default attack if missing
    if (!pokemon.attack) {
      const pokemonType = extractPokemonType(pokemon);
      const attackName = getPokemonAttackName(pokemon);
      pokemon.attack = {
        name: attackName,
        power: 50 + pokemon.level * 2,
        type: pokemonType,
      };
    }

    setRosterPokemon([...rosterPokemon, pokemon]);
  };

  /**
   * Removes a Pokemon from the roster by ID
   * @param {string|number} pokemonId - ID of Pokemon to remove
   */
  const removePokemonFromRoster = (pokemonId) => {
    setRosterPokemon(rosterPokemon.filter((p) => p.id !== pokemonId));
  };

  /**
   * Updates a Pokemon's stats with new values
   * @param {string|number} pokemonId - ID of Pokemon to update
   * @param {Object} updatedStats - New stat values to apply
   */
  const updatePokemonStats = (pokemonId, updatedStats) => {
    setRosterPokemon(
      rosterPokemon.map((pokemon) =>
        pokemon.id === pokemonId ? { ...pokemon, ...updatedStats } : pokemon
      )
    );
  };

  /**
   * Levels up a Pokemon, increasing its stats
   * @param {string|number} pokemonId - ID of Pokemon to level up
   */
  const levelUpPokemon = (pokemonId) => {
    setRosterPokemon(
      rosterPokemon.map((pokemon) => {
        if (pokemon.id === pokemonId && pokemon.level < 25) {
          const newLevel = pokemon.level + 1;
          return {
            ...pokemon,
            level: newLevel,
            xp: 0,
            stats: {
              hp: Math.floor(pokemon.stats.hp * 1.1),
              attack: Math.floor(pokemon.stats.attack * 1.1),
              defense: Math.floor(pokemon.stats.defense * 1.1),
              specialAttack: Math.floor(pokemon.stats.specialAttack * 1.1),
              specialDefense: Math.floor(pokemon.stats.specialDefense * 1.1),
              speed: Math.floor(pokemon.stats.speed * 1.1),
            },
            currentHp: Math.floor(pokemon.stats.hp * 1.1),
            attack: {
              ...pokemon.attack,
              power: 50 + newLevel * 2,
            },
          };
        }
        return pokemon;
      })
    );
  };

  /**
   * Adds experience to a Pokemon, leveling up if threshold is reached
   * @param {string|number} pokemonId - ID of Pokemon to add experience to
   * @param {number} amount - Amount of experience to add
   */
  const addExperience = (pokemonId, amount) => {
    setRosterPokemon(
      rosterPokemon.map((pokemon) => {
        if (pokemon.id === pokemonId) {
          const xpToNextLevel = pokemon.level * 100;
          const newXp = pokemon.xp + amount;

          if (newXp >= xpToNextLevel && pokemon.level < 25) {
            // Level up the Pokémon
            const newLevel = pokemon.level + 1;
            return {
              ...pokemon,
              level: newLevel,
              xp: newXp - xpToNextLevel,
              stats: {
                hp: Math.floor(pokemon.stats.hp * 1.1),
                attack: Math.floor(pokemon.stats.attack * 1.1),
                defense: Math.floor(pokemon.stats.defense * 1.1),
                specialAttack: Math.floor(pokemon.stats.specialAttack * 1.1),
                specialDefense: Math.floor(pokemon.stats.specialDefense * 1.1),
                speed: Math.floor(pokemon.stats.speed * 1.1),
              },
              currentHp: Math.floor(pokemon.stats.hp * 1.1),
              attack: {
                ...pokemon.attack,
                power: 50 + newLevel * 2,
              },
            };
          }

          return {
            ...pokemon,
            xp: newXp,
          };
        }
        return pokemon;
      })
    );
  };

  /**
   * Updates player currency (adds or subtracts amount)
   * @param {number} amount - Amount to add (positive) or subtract (negative)
   */
  const updateCurrency = (amount) => {
    setCurrency((prev) => Math.max(0, prev + amount));
  };

  /**
   * Updates the quantity of an item
   * @param {string} itemId - ID of the item to update
   * @param {number} change - Amount to change quantity by (can be negative)
   */
  const updateItemQuantity = (itemId, change) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity + change),
          };
        }
        return item;
      })
    );
  };

  /**
   * Attempts to buy an item with player currency
   * @param {string} itemId - ID of the item to buy
   * @returns {boolean} Whether purchase was successful
   */
  const buyItem = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;

    if (currency >= item.price) {
      updateCurrency(-item.price);
      updateItemQuantity(itemId, 1);
      return true;
    }

    return false;
  };

  /**
   * Uses an item on a Pokemon
   * @param {string} itemId - ID of the item to use
   * @param {string|number} pokemonId - ID of Pokemon to use item on
   * @returns {Object|boolean} Result with success status and message
   */
  const useItem = (itemId, pokemonId) => {
    const item = items.find((i) => i.id === itemId);
    const pokemon = rosterPokemon.find((p) => p.id === pokemonId);

    if (!item || !pokemon || item.quantity <= 0) return false;

    // Check if item can be used in the current context
    if (pokemon.currentHp <= 0 && item.effect !== "revive") {
      return { success: false, message: `Cannot use ${item.name} on fainted Pokémon` };
    }

    // Apply item effect
    let updated = false;
    let message = "";

    switch (item.effect) {
      case "heal":
        if (pokemon.currentHp < pokemon.stats.hp) {
          const healAmount = Math.min(
            item.amount,
            pokemon.stats.hp - pokemon.currentHp
          );
          const newHp = pokemon.currentHp + healAmount;
          updatePokemonStats(pokemonId, { currentHp: newHp });
          message = `${pokemon.name} recovered ${healAmount} HP!`;
          updated = true;
        } else {
          message = `${pokemon.name}'s HP is already full!`;
        }
        break;

      case "fullheal":
        if (pokemon.currentHp < pokemon.stats.hp) {
          const healAmount = pokemon.stats.hp - pokemon.currentHp;
          updatePokemonStats(pokemonId, { currentHp: pokemon.stats.hp });
          message = `${pokemon.name} fully recovered ${healAmount} HP!`;
          updated = true;
        } else {
          message = `${pokemon.name}'s HP is already full!`;
        }
        break;

      case "revive":
        if (pokemon.currentHp <= 0) {
          const newHp = Math.floor(pokemon.stats.hp * item.amount);
          updatePokemonStats(pokemonId, { currentHp: newHp });
          message = `${pokemon.name} was revived with ${newHp} HP!`;
          updated = true;
        } else {
          message = `${pokemon.name} is not fainted!`;
        }
        break;

      case "status":
        // For now, just say we cured status since status effects aren't implemented yet
        message = `${pokemon.name} was cured of ${item.statusEffect}!`;
        updated = true;
        break;

      case "boost":
        const statName = item.stat || "attack";
        const boostPercentage = item.amount * 100;
        // For battle-only boosts, we'll add a temporary boost flag
        // Store the original stat value and boosted value
        const currentStat = pokemon.stats[statName] || 0;
        const boostedStat = Math.floor(currentStat * (1 + item.amount));

        // Apply boost temporarily through marker
        updatePokemonStats(pokemonId, {
          [`${statName}Boost`]: boostedStat,
          [`${statName}BoostOriginal`]: currentStat,
          [`${statName}BoostEndsAfterBattle`]: true,
        });

        message = `${pokemon.name}'s ${statName} increased by ${boostPercentage}%!`;
        updated = true;
        break;

      case "levelup":
        // Level up the Pokémon
        levelUpPokemon(pokemonId, item.amount);
        message = `${pokemon.name} leveled up to Lv ${
          pokemon.level + item.amount
        }!`;
        updated = true;
        break;

      default:
        message = `Used ${item.name} on ${pokemon.name}!`;
        updated = true;
    }

    if (updated) {
      // Consume item
      updateItemQuantity(itemId, -1);
      // Return result with message
      return { success: true, message };
    }

    return { success: false, message };
  };

  // Provide context value to consumers
  return (
    <RosterContext.Provider
      value={{
        rosterPokemon,
        setRosterPokemon,
        addPokemonToRoster,
        removePokemonFromRoster,
        updatePokemonStats,
        levelUpPokemon,
        addExperience,
        currency,
        updateCurrency,
        items,
        updateItemQuantity,
        buyItem,
        useItem,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export default RosterContextProvider;