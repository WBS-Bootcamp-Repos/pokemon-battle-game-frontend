/**
 * Battle Utility Functions
 * 
 * This module provides calculation functions for the Pokemon battle system including:
 * - Damage calculation with type effectiveness and critical hits
 * - Experience and currency rewards
 * - Type matchup effectiveness
 * - Default move generation
 */

/**
 * Calculates damage for an attack between two Pokemon
 * Includes type effectiveness, critical hits, and randomness factors
 * 
 * @param {Object} attacker - The attacking Pokémon with level and stats
 * @param {Object} defender - The defending Pokémon with type and stats
 * @param {Object} move - The move being used with type and power
 * @returns {Object} Damage result with damage amount, effectiveness, critical flag, and message
 */
export const calculateDamage = (attacker, defender, move) => {
    try {
      // Validate inputs
      if (!attacker || !defender || !move) {
        console.error("Missing required parameters for damage calculation", {
          attacker,
          defender,
          move,
        });
        return {
          damage: 0,
          effectiveness: 1,
          isCritical: false,
          message: "Attack missed!",
        };
      }
  
      // Extract relevant stats
      const attackerLevel = attacker.level || 1;
      const attackType = move.type || attacker.type || "normal";
      const movePower = move.power || Math.floor(5 + attackerLevel * 1.5);
  
      // Get attack and defense stats (with fallbacks)
      const attackStat = attacker.stats?.attack || attackerLevel * 2 + 5;
      const defenseStat = defender.stats?.defense || defender.level * 2 + 5;
  
      // Calculate base damage using Pokémon-like formula
      let baseDamage = Math.floor(
        (((2 * attackerLevel) / 5 + 2) * movePower * (attackStat / defenseStat)) /
          50 +
          2
      );
  
      // Calculate type effectiveness
      const effectiveness = getTypeEffectiveness(
        attackType,
        defender.type || "normal"
      );
  
      // Determine if critical hit (6.25% chance)
      const isCritical = Math.random() < 0.0625;
      if (isCritical) {
        baseDamage = Math.floor(baseDamage * 1.5);
      }
  
      // Apply type effectiveness - make it more impactful
      // Stronger bonus for super effective moves
      let typedDamage;
      if (effectiveness > 1) {
        typedDamage = Math.floor(baseDamage * (effectiveness * 1.3)); // Enhanced bonus
      } else if (effectiveness < 1) {
        typedDamage = Math.floor(baseDamage * effectiveness); // Standard reduction
      } else {
        typedDamage = baseDamage; // Normal effectiveness
      }
  
      // Apply randomness (85-100% of calculated damage)
      const randomFactor = 0.85 + Math.random() * 0.15;
      const finalDamage = Math.max(1, Math.floor(typedDamage * randomFactor));
  
      // Generate appropriate message with more detail
      let message = "";
      if (effectiveness > 1.5) {
        message = `It's super effective! ${attackType}-type moves are strong against ${defender.type}-type Pokémon!`;
      } else if (effectiveness > 1) {
        message = `It's effective! ${attackType}-type moves work well against ${defender.type}-type Pokémon.`;
      } else if (effectiveness < 0.5) {
        message = `It's not very effective... ${attackType}-type moves are weak against ${defender.type}-type Pokémon.`;
      } else if (effectiveness < 1) {
        message = `It's somewhat ineffective. ${attackType}-type moves aren't ideal against ${defender.type}-type Pokémon.`;
      } else if (effectiveness === 0) {
        message = `It had no effect... ${defender.type}-type Pokémon are immune to ${attackType}-type moves!`;
      }
  
      if (isCritical) {
        message = message ? `Critical hit! ${message}` : "Critical hit!";
      }
  
      return {
        damage: finalDamage,
        effectiveness: effectiveness,
        isCritical: isCritical,
        message: message,
      };
    } catch (error) {
      console.error("Error calculating damage:", error);
      return {
        damage: 1,
        effectiveness: 1,
        isCritical: false,
        message: "",
      };
    }
  };
  
  /**
   * Determines type effectiveness multiplier between attack and defender types
   * Based on Pokemon type chart with multipliers for super effective (2x), 
   * not very effective (0.5x), and immune (0x) interactions
   * 
   * @param {string} attackType - The elemental type of the attack
   * @param {string} defenderType - The elemental type of the defending Pokémon
   * @returns {number} Effectiveness multiplier (0, 0.5, 1, or 2)
   */
  export const getTypeEffectiveness = (attackType, defenderType) => {
    // Simplified type chart
    const typeChart = {
      normal: {
        rock: 0.5,
        ghost: 0,
        steel: 0.5,
      },
      fire: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 2,
        bug: 2,
        rock: 0.5,
        dragon: 0.5,
        steel: 2,
      },
      water: {
        fire: 2,
        water: 0.5,
        grass: 0.5,
        ground: 2,
        rock: 2,
        dragon: 0.5,
      },
      grass: {
        fire: 0.5,
        water: 2,
        grass: 0.5,
        poison: 0.5,
        ground: 2,
        flying: 0.5,
        bug: 0.5,
        rock: 2,
        dragon: 0.5,
        steel: 0.5,
      },
      electric: {
        water: 2,
        electric: 0.5,
        grass: 0.5,
        ground: 0,
        flying: 2,
        dragon: 0.5,
      },
      ice: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 0.5,
        ground: 2,
        flying: 2,
        dragon: 2,
        steel: 0.5,
      },
      fighting: {
        normal: 2,
        ice: 2,
        poison: 0.5,
        flying: 0.5,
        psychic: 0.5,
        bug: 0.5,
        rock: 2,
        ghost: 0,
        dark: 2,
        steel: 2,
        fairy: 0.5,
      },
      poison: {
        grass: 2,
        poison: 0.5,
        ground: 0.5,
        rock: 0.5,
        ghost: 0.5,
        steel: 0,
        fairy: 2,
      },
      ground: {
        fire: 2,
        electric: 2,
        grass: 0.5,
        poison: 2,
        flying: 0,
        bug: 0.5,
        rock: 2,
        steel: 2,
      },
      flying: {
        electric: 0.5,
        grass: 2,
        fighting: 2,
        bug: 2,
        rock: 0.5,
        steel: 0.5,
      },
      psychic: {
        fighting: 2,
        poison: 2,
        psychic: 0.5,
        dark: 0,
        steel: 0.5,
      },
      bug: {
        fire: 0.5,
        grass: 2,
        fighting: 0.5,
        poison: 0.5,
        flying: 0.5,
        psychic: 2,
        ghost: 0.5,
        dark: 2,
        steel: 0.5,
        fairy: 0.5,
      },
      rock: {
        fire: 2,
        ice: 2,
        fighting: 0.5,
        ground: 0.5,
        flying: 2,
        bug: 2,
        steel: 0.5,
      },
      ghost: {
        normal: 0,
        psychic: 2,
        ghost: 2,
        dark: 0.5,
      },
      dragon: {
        dragon: 2,
        steel: 0.5,
        fairy: 0,
      },
      dark: {
        fighting: 0.5,
        psychic: 2,
        ghost: 2,
        dark: 0.5,
        fairy: 0.5,
      },
      steel: {
        fire: 0.5,
        water: 0.5,
        electric: 0.5,
        ice: 2,
        rock: 2,
        steel: 0.5,
        fairy: 2,
      },
      fairy: {
        fighting: 2,
        poison: 0.5,
        bug: 1,
        dragon: 2,
        dark: 2,
        steel: 0.5,
      },
    };
  
    // Default to neutral effectiveness
    if (!attackType || !defenderType) return 1;
  
    // Normalize types to lowercase
    const attack = attackType.toLowerCase();
    const defender = defenderType.toLowerCase();
  
    // If we have data for this matchup, return it
    if (typeChart[attack] && typeChart[attack][defender] !== undefined) {
      return typeChart[attack][defender];
    }
  
    // Default to neutral effectiveness
    return 1;
  };
  
  /**
   * Calculates experience points gained from defeating an enemy Pokémon
   * Bosses provide significantly more XP with bonus multipliers
   * 
   * @param {Object} enemyPokemon - The defeated enemy Pokémon
   * @param {boolean} isBoss - Whether the enemy is a boss Pokémon
   * @returns {number} Amount of XP gained
   */
  export const calculateXp = (enemyPokemon, isBoss = false) => {
    try {
      if (!enemyPokemon) return 0;
  
      // Base XP calculation
      const baseXp =
        (enemyPokemon.level || 1) * (isBoss || enemyPokemon.isBoss ? 10 : 5);
  
      // Multiply by 2-3x for boss Pokémon
      const bossMultiplier =
        isBoss || enemyPokemon.isBoss
          ? 2 + Math.random() // Random value between 2-3
          : 1;
  
      // Add randomness (90-110% of calculated XP)
      const randomFactor = 0.9 + Math.random() * 0.2;
  
      return Math.floor(baseXp * bossMultiplier * randomFactor);
    } catch (error) {
      console.error("Error calculating XP:", error);
      return 10; // Fallback value
    }
  };
  
  /**
   * Calculates currency (Poké Dollars) gained from defeating an enemy Pokémon
   * Bosses provide significantly more currency with bonus multipliers
   * 
   * @param {Object} enemyPokemon - The defeated enemy Pokémon
   * @param {boolean} isBoss - Whether the enemy is a boss Pokémon
   * @returns {number} Amount of currency gained
   */
  export const calculateCurrency = (enemyPokemon, isBoss = false) => {
    try {
      if (!enemyPokemon) return 0;
  
      // Base currency calculation
      const baseCurrency =
        (enemyPokemon.level || 1) * (isBoss || enemyPokemon.isBoss ? 25 : 10);
  
      // Multiply by 3-5x for boss Pokémon
      const bossMultiplier =
        isBoss || enemyPokemon.isBoss
          ? 3 + Math.random() * 2 // Random value between 3-5
          : 1;
  
      // Add randomness (80-120% of calculated currency)
      const randomFactor = 0.8 + Math.random() * 0.4;
  
      return Math.floor(baseCurrency * bossMultiplier * randomFactor);
    } catch (error) {
      console.error("Error calculating currency:", error);
      return 50; // Fallback value
    }
  };
  
  /**
   * Generates a default move for a Pokémon based on its type
   * Provides appropriate move name, power, and type for battle calculations
   * 
   * @param {string} type - The Pokémon's elemental type
   * @param {number} level - The Pokémon's level (affects move power)
   * @returns {Object} Move object with name, power, and type properties
   */
  export const generateDefaultMove = (type = "normal", level = 1) => {
    const movesByType = {
      normal: { name: "Tackle", power: 40 },
      fire: { name: "Ember", power: 40 },
      water: { name: "Water Gun", power: 40 },
      grass: { name: "Vine Whip", power: 45 },
      electric: { name: "Thunder Shock", power: 40 },
      ice: { name: "Ice Shard", power: 40 },
      fighting: { name: "Karate Chop", power: 50 },
      poison: { name: "Poison Sting", power: 15 },
      ground: { name: "Sand Attack", power: 20 },
      flying: { name: "Gust", power: 40 },
      psychic: { name: "Confusion", power: 50 },
      bug: { name: "Bug Bite", power: 60 },
      rock: { name: "Rock Throw", power: 50 },
      ghost: { name: "Lick", power: 30 },
      dragon: { name: "Dragon Rage", power: 40 },
      dark: { name: "Bite", power: 60 },
      steel: { name: "Metal Claw", power: 50 },
      fairy: { name: "Fairy Wind", power: 40 },
    };
  
    const normalizedType = type.toLowerCase();
    const move = movesByType[normalizedType] || movesByType.normal;
  
    // Scale power slightly based on level
    const scaledPower = Math.floor(move.power + level / 10);
  
    return {
      name: move.name,
      power: scaledPower,
      type: normalizedType,
    };
  };