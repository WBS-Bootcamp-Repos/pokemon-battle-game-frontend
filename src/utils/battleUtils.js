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

    // Check if attacker is an enemy (non-player) Pokemon
    // Enemy Pokemon have no currentHp property set by the player
    const isEnemyAttacker = !attacker.hasOwnProperty("currentHp");

    // Enemy difficulty multiplier - makes enemy attacks more threatening
    const enemyMultiplier = isEnemyAttacker ? 1.75 : 1;

    // Extract relevant stats
    const attackerLevel = attacker.level || 1;
    const attackType = move.type || attacker.type || "normal";
    const movePower = move.power || Math.floor(5 + attackerLevel * 1.5);

    // Get attack and defense stats (with fallbacks)
    // Enemies get better attack stats relative to their level
    let attackStat;
    if (isEnemyAttacker) {
      // Enemy attack scales more aggressively with level
      attackStat = attackerLevel * 4 + 10;
      // Boss enemies (high level) get extra attack boost
      if (attackerLevel >= 20) {
        attackStat = Math.floor(attackStat * 1.2);
      }
    } else {
      // Player attack scales better now to balance against tough enemies
      attackStat = attackerLevel * 3.5 + 8;
    }
    const defenseStat = defender.stats?.defense || defender.level * 2 + 5;

    // Calculate base damage using enhanced Pokémon-like formula
    let baseDamage = Math.floor(
      (((2 * attackerLevel) / 5 + 2) * movePower * (attackStat / defenseStat)) /
        50 +
        2
    );

    // Apply level difference scaling for more realistic battles
    // If attacker level > defender level, they do more damage
    // This makes higher level enemies more threatening
    const levelDifference = attackerLevel - (defender.level || 1);
    let levelMultiplier = 1;

    if (levelDifference > 0) {
      // Higher level attackers do more damage (scaled by difference)
      // Enemy high-level attackers get an extra multiplier
      if (isEnemyAttacker) {
        levelMultiplier = 1 + levelDifference * 0.2; // Enemies get 20% boost per level difference
      } else {
        levelMultiplier = 1 + levelDifference * 0.25; // Players get 25% boost per level difference
      }
    } else if (levelDifference < 0) {
      // Lower level attackers do less damage
      // Enemies still do decent damage even at lower level
      if (isEnemyAttacker) {
        levelMultiplier = Math.max(0.7, 1 + levelDifference * 0.03);
      } else {
        // Player Pokémon are less penalized when attacking higher level enemies
        levelMultiplier = Math.max(0.6, 1 + levelDifference * 0.04);
      }
    }

    baseDamage = Math.floor(baseDamage * levelMultiplier);

    // Calculate type effectiveness
    const effectiveness = getTypeEffectiveness(
      attackType,
      defender.type || "normal"
    );

    // Determine if critical hit (enemies have higher chance)
    const critChance = isEnemyAttacker ? 0.15 : 0.12; // 15% for enemies, 12% for player
    const critMultiplier = isEnemyAttacker ? 2.0 : 1.8; // Stronger crits for everyone
    const isCritical = Math.random() < critChance;

    if (isCritical) {
      baseDamage = Math.floor(baseDamage * critMultiplier);
    }

    // Apply type effectiveness - make it more impactful
    // Stronger bonus for super effective moves
    let typedDamage;
    if (effectiveness > 1) {
      // Players get more bonus for super effective hits
      typedDamage = Math.floor(
        baseDamage * (effectiveness * (isEnemyAttacker ? 1.5 : 1.7))
      );
    } else if (effectiveness < 1) {
      typedDamage = Math.floor(baseDamage * effectiveness); // Standard reduction
    } else {
      typedDamage = baseDamage; // Normal effectiveness
    }

    // Apply enemy difficulty multiplier (but now players get a small boost too)
    const finalMultiplier = isEnemyAttacker ? enemyMultiplier : 1.15;
    typedDamage = Math.floor(typedDamage * finalMultiplier);

    // Apply randomness (85-100% of calculated damage for player, 90-110% for enemies)
    const randomMin = isEnemyAttacker ? 0.9 : 0.85;
    const randomMax = isEnemyAttacker ? 0.2 : 0.15;
    const randomFactor = randomMin + Math.random() * randomMax;

    // Ensure minimum damage is higher for enemies
    const finalDamage = Math.max(
      isEnemyAttacker ? 3 : 2,
      Math.floor(typedDamage * randomFactor)
    );

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
 * @param {boolean} isEnemy - Whether this is an enemy Pokemon (optional)
 * @returns {Object} Move object with name, power, and type properties
 */
export const generateDefaultMove = (
  type = "normal",
  level = 1,
  isEnemy = false
) => {
  // More powerful moves for enemies and players
  const movesByType = {
    normal: { name: "Tackle", power: 45, enemyName: "Slam", enemyPower: 50 },
    fire: {
      name: "Ember",
      power: 45,
      enemyName: "Flamethrower",
      enemyPower: 55,
    },
    water: {
      name: "Water Gun",
      power: 45,
      enemyName: "Hydro Pump",
      enemyPower: 55,
    },
    grass: {
      name: "Vine Whip",
      power: 50,
      enemyName: "Razor Leaf",
      enemyPower: 55,
    },
    electric: {
      name: "Thunder Shock",
      power: 45,
      enemyName: "Thunderbolt",
      enemyPower: 55,
    },
    ice: {
      name: "Ice Shard",
      power: 45,
      enemyName: "Ice Beam",
      enemyPower: 55,
    },
    fighting: {
      name: "Karate Chop",
      power: 55,
      enemyName: "Cross Chop",
      enemyPower: 65,
    },
    poison: {
      name: "Poison Sting",
      power: 40,
      enemyName: "Sludge Bomb",
      enemyPower: 50,
    },
    ground: {
      name: "Sand Attack",
      power: 40,
      enemyName: "Earthquake",
      enemyPower: 60,
    },
    flying: { name: "Gust", power: 45, enemyName: "Air Slash", enemyPower: 55 },
    psychic: {
      name: "Confusion",
      power: 55,
      enemyName: "Psychic",
      enemyPower: 65,
    },
    bug: {
      name: "Bug Bite",
      power: 65,
      enemyName: "X-Scissor",
      enemyPower: 70,
    },
    rock: {
      name: "Rock Throw",
      power: 55,
      enemyName: "Rock Slide",
      enemyPower: 65,
    },
    ghost: {
      name: "Lick",
      power: 40,
      enemyName: "Shadow Ball",
      enemyPower: 55,
    },
    dragon: {
      name: "Dragon Rage",
      power: 45,
      enemyName: "Dragon Claw",
      enemyPower: 60,
    },
    dark: { name: "Bite", power: 65, enemyName: "Crunch", enemyPower: 70 },
    steel: {
      name: "Metal Claw",
      power: 55,
      enemyName: "Iron Head",
      enemyPower: 65,
    },
    fairy: {
      name: "Fairy Wind",
      power: 45,
      enemyName: "Dazzling Gleam",
      enemyPower: 55,
    },
  };

  const normalizedType = type.toLowerCase();
  const move = movesByType[normalizedType] || movesByType.normal;

  // Use enemy moves if specified
  const basePower = isEnemy ? move.enemyPower || move.power : move.power;
  const moveName = isEnemy ? move.enemyName || move.name : move.name;

  // Better power scaling based on level
  // This creates a more noticeable difference between low and high level Pokemon
  // Base power + significant level bonus
  let scaledPower;

  if (level <= 5) {
    // Low level: modest scaling
    scaledPower = Math.floor(basePower * (1 + level * (isEnemy ? 0.05 : 0.04)));
  } else if (level <= 15) {
    // Mid level: better scaling
    scaledPower = Math.floor(
      basePower * (1.15 + (level - 5) * (isEnemy ? 0.06 : 0.05))
    );
  } else if (level <= 30) {
    // High level: stronger scaling
    scaledPower = Math.floor(
      basePower * (1.55 + (level - 15) * (isEnemy ? 0.07 : 0.06))
    );
  } else {
    // Very high level: powerful scaling
    scaledPower = Math.floor(
      basePower * (2.3 + (level - 30) * (isEnemy ? 0.05 : 0.04))
    );
  }

  // Boss Pokemon get extra power, but now player also gets a small power boost
  if (isEnemy && level >= 25) {
    scaledPower = Math.floor(scaledPower * 1.2); // 20% boost for high-level enemies
  } else if (!isEnemy && level >= 10) {
    // Player gets a boost as they level up to keep up with enemies
    const playerBoost = Math.min(0.15, 0.05 + (level - 10) * 0.01); // Scales from 5% at level 10 to 15% at level 20+
    scaledPower = Math.floor(scaledPower * (1 + playerBoost));
  }

  return {
    name: moveName,
    power: scaledPower,
    type: normalizedType,
  };
};
