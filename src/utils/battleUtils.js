/**
 * Battle Utility Functions
 *
 * Provides calculations for damage, experience, currency rewards,
 * type effectiveness, and move generation for the battle system.
 */

/**
 * Calculates damage for an attack between two Pokemon
 * @param {Object} attacker - The attacking Pokémon with level and stats
 * @param {Object} defender - The defending Pokémon with type and stats
 * @param {Object} move - The move being used with type and power
 * @returns {Object} Damage result with damage amount, effectiveness text, and critical flag
 */
export const calculateDamage = (attacker, defender, move) => {
  if (!attacker || !defender || !move) {
    return 1; // Default minimum damage
  }

  // Get base stats for calculation
  const attackerLevel = attacker.level || 1;
  const movePower = move.power || 40;

  // Improved stat scaling with level
  const attackStat = attacker.stats?.attack || 15 + attackerLevel * 3;
  const defenseStat = defender.stats?.defense || 10 + defender.level * 2;

  // Enhanced base damage formula for faster, more impactful battles
  const baseDamage = Math.floor(
    (((2 * attackerLevel) / 5 + 5) * movePower * (attackStat / defenseStat)) /
      40 +
      5
  );

  // Improved critical hit chances
  const critChance = attacker.isEnemy ? 0.08 : 0.12;
  const isCritical = Math.random() < critChance;
  const criticalMultiplier = isCritical ? 1.8 : 1.0;

  // Calculate type effectiveness
  const effectivenessMultiplier = calculateTypeEffectiveness(
    move.type,
    defender.type
  );

  // Apply randomness factor (90% to 110% of calculated damage for more consistent results)
  const randomFactor = 0.9 + Math.random() * 0.2;

  // Final damage calculation with improved scaling
  let finalDamage = Math.floor(
    baseDamage * effectivenessMultiplier * criticalMultiplier * randomFactor
  );

  // Ensure minimum damage of 1
  finalDamage = Math.max(1, finalDamage);

  return {
    damage: finalDamage,
    isCritical: isCritical,
    effectiveness: getEffectivenessText(effectivenessMultiplier),
  };
};

/**
 * Determines type effectiveness multiplier between attack and defender types
 * @param {string} attackType - The attack's elemental type
 * @param {string} defenderType - The defender's elemental type
 * @returns {number} Effectiveness multiplier (0, 0.5, 1, or 2)
 */
export const calculateTypeEffectiveness = (attackType, defenderType) => {
  // Type effectiveness chart
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

  // Default to neutral effectiveness if types aren't provided
  if (!attackType || !defenderType) return 1;

  // Normalize types to lowercase
  const attack = attackType.toLowerCase();
  const defender = defenderType.toLowerCase();

  // Return effectiveness from chart or default to neutral
  if (typeChart[attack] && typeChart[attack][defender] !== undefined) {
    return typeChart[attack][defender];
  }

  return 1;
};

/**
 * Calculates experience points from defeating an enemy
 * @param {Object} enemyPokemon - The defeated Pokemon
 * @param {boolean} isBoss - Whether the enemy was a boss
 * @returns {number} Experience points gained
 */
export const calculateXp = (enemyPokemon, isBoss = false) => {
  if (!enemyPokemon) return 0;

  const enemyLevel = enemyPokemon.level || 1;
  let baseXp;

  // Enhanced level-based scaling tiers with better progression
  if (enemyLevel <= 10) {
    baseXp = enemyLevel * 10; // 10-100 XP
  } else if (enemyLevel <= 25) {
    baseXp = 10 * 10 + (enemyLevel - 10) * 15; // 115-325 XP
  } else if (enemyLevel <= 40) {
    baseXp = 10 * 10 + 15 * 15 + (enemyLevel - 25) * 25; // 350-725 XP
  } else {
    baseXp = 10 * 10 + 15 * 15 + 15 * 25 + (enemyLevel - 40) * 35; // 760-1185 XP
  }

  // Apply boss multiplier (increased from 3 to 4)
  const bossMultiplier = isBoss ? 4 : 1;
  return Math.floor(baseXp * bossMultiplier);
};

/**
 * Calculates currency from defeating an enemy
 * @param {Object} enemyPokemon - The defeated Pokemon
 * @param {boolean} isBoss - Whether the enemy was a boss
 * @returns {number} Currency gained
 */
export const calculateCurrency = (enemyPokemon, isBoss = false) => {
  if (!enemyPokemon) return 0;

  const enemyLevel = enemyPokemon.level || 1;
  let baseCurrency;

  // Enhanced level-based scaling tiers with better progression
  if (enemyLevel <= 10) {
    baseCurrency = enemyLevel * 7; // 7-70 currency
  } else if (enemyLevel <= 25) {
    baseCurrency = 10 * 7 + (enemyLevel - 10) * 12; // 82-250 currency
  } else if (enemyLevel <= 40) {
    baseCurrency = 10 * 7 + 15 * 12 + (enemyLevel - 25) * 18; // 268-538 currency
  } else {
    baseCurrency = 10 * 7 + 15 * 12 + 15 * 18 + (enemyLevel - 40) * 25; // 563-813 currency
  }

  // Apply boss multiplier (increased from 2.5 to 3)
  const bossMultiplier = isBoss ? 3 : 1;
  return Math.floor(baseCurrency * bossMultiplier);
};

/**
 * Generates a default move for a Pokemon based on its type and level
 * @param {string} type - The Pokemon's type
 * @param {number} level - The Pokemon's level
 * @param {boolean} isEnemy - Whether this is for an enemy Pokemon
 * @returns {Object} A move object with name, power and type
 */
export const generateDefaultMove = (
  type = "normal",
  level = 1,
  isEnemy = false
) => {
  // Map of moves by type with base power values
  const movesByType = {
    normal: { name: "Tackle", basePower: 45 },
    fire: { name: "Ember", basePower: 50 },
    water: { name: "Water Gun", basePower: 50 },
    grass: { name: "Vine Whip", basePower: 50 },
    electric: { name: "Thunder Shock", basePower: 50 },
    ice: { name: "Ice Shard", basePower: 50 },
    fighting: { name: "Karate Chop", basePower: 55 },
    poison: { name: "Poison Sting", basePower: 45 },
    ground: { name: "Sand Attack", basePower: 45 },
    flying: { name: "Gust", basePower: 50 },
    psychic: { name: "Confusion", basePower: 55 },
    bug: { name: "Bug Bite", basePower: 45 },
    rock: { name: "Rock Throw", basePower: 55 },
    ghost: { name: "Shadow Ball", basePower: 55 },
    dragon: { name: "Dragon Rage", basePower: 65 },
    dark: { name: "Bite", basePower: 50 },
    steel: { name: "Metal Claw", basePower: 55 },
    fairy: { name: "Fairy Wind", basePower: 50 },
  };

  // Get the appropriate move for the type
  const move = movesByType[type.toLowerCase()] || movesByType.normal;

  // Enhanced power scaling based on level tiers with increased progression
  let powerMultiplier;

  // Scale power based on level tiers - higher multipliers for faster progression
  if (level <= 10) {
    powerMultiplier = 1 + level * 0.07; // 7% increase per level (1.07x to 1.7x)
  } else if (level <= 25) {
    powerMultiplier = 1.7 + (level - 10) * 0.09; // 9% increase per level (1.79x to 3.05x)
  } else if (level <= 40) {
    powerMultiplier = 3.05 + (level - 25) * 0.1; // 10% increase per level (3.15x to 4.55x)
  } else {
    powerMultiplier = 4.55 + (level - 40) * 0.12; // 12% increase per level (4.67x to 5.75x)
  }

  // Apply enemy bonus if applicable - make enemies slightly stronger
  const enemyBonus = isEnemy ? 1.2 : 1.0;

  // Calculate final power
  const scaledPower = Math.floor(move.basePower * powerMultiplier * enemyBonus);

  return {
    name: move.name,
    power: scaledPower,
    type: type.toLowerCase(),
  };
};

/**
 * Converts type effectiveness multiplier to battle text
 * @param {number} multiplier - The effectiveness multiplier
 * @returns {string} Text description for the battle log
 */
export const getEffectivenessText = (multiplier) => {
  if (multiplier >= 2) {
    return "It's super effective!";
  } else if (multiplier > 1) {
    return "It's effective!";
  } else if (multiplier < 0.5) {
    return "It's not very effective...";
  } else if (multiplier < 1) {
    return "It's somewhat ineffective.";
  } else if (multiplier === 0) {
    return "It had no effect...";
  }
  return "";
};
