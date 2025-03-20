/**
 * BattleContext - Provides global state management for Pokemon battles
 *
 * This context manages the battle state, player and enemy Pokemon,
 * battle actions (attack, use item, change Pokemon, flee), and
 * victory/defeat handling with rewards.
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useRoster } from "./context";
import { toast } from "react-toastify";
import {
  battleReducer,
  initialBattleState,
  BATTLE_ACTIONS,
  BATTLE_STATES,
  isEnemyDefeated,
  isPlayerDefeated,
} from "./BattleReducer";
import {
  calculateXp,
  calculateCurrency,
  generateDefaultMove,
} from "../utils/battleUtils";
import {
  VictoryScreen,
  DefeatScreen,
} from "../components/battle/BattleResults";

/**
 * Generates an enemy Pokemon with appropriate stats for the current adventure
 *
 * @param {string} adventureType - Type of adventure (random, plant, psychic-ghost, legendary)
 * @param {number} battleIndex - Current battle number in the adventure
 * @param {number} maxBattles - Total battles in the adventure
 * @returns {Object} Enemy Pokemon data object
 */
const generateEnemyPokemon = (
  adventureType = "random",
  battleIndex = 0,
  maxBattles = 10
) => {
  try {
    // Ensure parameters have safe values
    adventureType =
      typeof adventureType === "string" ? adventureType : "random";
    battleIndex = Number(battleIndex) || 0;
    maxBattles = Number(maxBattles) || 10;

    // Adventure difficulty tiers - used to scale level progression
    const difficultyTiers = {
      random: { baseLevel: 1, increment: 1.0, maxLevel: 15, bossBonus: 5 }, // Beginner adventure
      plant: { baseLevel: 10, increment: 1.5, maxLevel: 30, bossBonus: 7 }, // Easy difficulty
      "psychic-ghost": {
        baseLevel: 20,
        increment: 2.0,
        maxLevel: 40,
        bossBonus: 8,
      }, // Medium difficulty
      legendary: { baseLevel: 30, increment: 2.5, maxLevel: 50, bossBonus: 10 }, // Hard difficulty
      cave: { baseLevel: 15, increment: 1.8, maxLevel: 35, bossBonus: 8 }, // Added cave adventure
      safari: { baseLevel: 25, increment: 2.2, maxLevel: 45, bossBonus: 9 }, // Added safari adventure
    };

    // Get difficulty settings for this adventure type, default to random if not found
    const difficulty =
      difficultyTiers[adventureType] || difficultyTiers["random"];

    // Calculate level with better scaling based on adventure difficulty
    // Early battles are easier, progression becomes steeper as you advance
    const progressionFactor = (battleIndex / (maxBattles - 1)) * 0.8 + 0.2; // 0.2 to 1.0 scale factor
    const calculatedLevel = Math.floor(
      difficulty.baseLevel +
        battleIndex * difficulty.increment * progressionFactor
    );

    // Apply level cap and determine if this is a boss battle
    const isBoss = battleIndex === maxBattles - 1;
    const level = isBoss
      ? Math.min(calculatedLevel + difficulty.bossBonus, difficulty.maxLevel)
      : Math.min(calculatedLevel, difficulty.maxLevel - difficulty.bossBonus);

    // Boss multiplier for stats - makes bosses significantly stronger
    const multiplier = isBoss ? 1.5 : 1;

    // Default values
    let type = "normal";
    let name = "Pikachu";

    // Select type and name based on adventure type
    if (adventureType === "plant") {
      type = Math.random() > 0.5 ? "grass" : "bug";
      name = ["Bulbasaur", "Oddish", "Bellsprout", "Caterpie"][
        Math.floor(Math.random() * 4)
      ];
    } else if (adventureType === "psychic-ghost") {
      type = Math.random() > 0.5 ? "psychic" : "ghost";
      name = ["Abra", "Gastly", "Drowzee", "Misdreavus"][
        Math.floor(Math.random() * 4)
      ];
    } else if (adventureType === "legendary") {
      type = Math.random() > 0.5 ? "dragon" : "rock";
      name = isBoss
        ? Math.random() > 0.5
          ? "Dragonite"
          : "Tyranitar"
        : ["Dratini", "Larvitar", "Bagon"][Math.floor(Math.random() * 3)];
    } else {
      // Random type for any other adventure type
      type = ["normal", "fire", "water", "electric", "grass"][
        Math.floor(Math.random() * 5)
      ];
      name = ["Rattata", "Charmander", "Squirtle", "Pikachu", "Bulbasaur"][
        Math.floor(Math.random() * 5)
      ];
    }

    // Calculate HP - now more balanced but still challenging
    const baseHp = 40 + level * 3;
    const maxHp = Math.floor(baseHp * multiplier);

    // Create enemy Pokemon with better balanced stats
    return {
      id: `enemy-${battleIndex}`,
      name: isBoss ? `Boss ${name}` : name,
      level: level,
      type: type,
      currentHp: maxHp,
      maxHp: maxHp,
      stats: {
        // More balanced stats that scale with level but don't get overwhelming
        hp: maxHp,
        attack: Math.floor((7 + level * 1.2) * multiplier),
        defense: Math.floor((6 + level * 0.8) * multiplier),
        speed: Math.floor((6 + level * 0.7) * multiplier),
      },
      moves: [
        {
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Attack`,
          type: type,
          power: Math.floor((35 + level * 0.8) * multiplier),
        },
      ],
      isBoss: isBoss,
    };
  } catch (error) {
    console.error("Error generating enemy Pokemon:", error);
    // Return a default Pokemon in case of any error
    return {
      id: "default-enemy",
      name: "Default Pokemon",
      level: 5,
      type: "normal",
      currentHp: 50,
      maxHp: 50,
      stats: { attack: 10, defense: 8, speed: 7, hp: 50 },
      moves: [{ name: "Normal Attack", type: "normal", power: 40 }],
      isBoss: false,
    };
  }
};

// Create context
const BattleContext = createContext();

/**
 * BattleProvider Component
 *
 * Manages battle state and provides battle-related functions to children.
 * Handles turn logic, rewards, and integration with the roster system.
 */
export const BattleProvider = ({ children }) => {
  const {
    rosterPokemon,
    updatePokemonStats,
    addPokemonToRoster,
    updateCurrency,
    items,
  } = useRoster();

  // Initialize reducer with initial state
  const [state, dispatch] = useReducer(battleReducer, {
    ...initialBattleState,
    playerRoster: rosterPokemon,
    items: items,
  });

  // Update playerRoster whenever roster changes
  useEffect(() => {
    if (rosterPokemon) {
      // Avoid dispatching unnecessarily - only update if the roster has actually changed
      if (
        JSON.stringify(state.playerRoster) !== JSON.stringify(rosterPokemon)
      ) {
        // Update state.playerRoster with latest roster
        dispatch({
          type: "UPDATE_ROSTER",
          roster: rosterPokemon,
        });
      }
    }
  }, [rosterPokemon, state.playerRoster]);

  // Update items whenever items change
  useEffect(() => {
    if (items && JSON.stringify(state.items) !== JSON.stringify(items)) {
      dispatch({
        type: "UPDATE_ITEMS",
        items: items,
      });
    }
  }, [items, state.items]);

  // Effect to handle enemy attack after player attacks
  useEffect(() => {
    if (state.battleState === BATTLE_STATES.ENEMY_TURN) {
      // Delay enemy attack for better gameplay
      const timer = setTimeout(() => {
        // Enemy performs attack
        dispatch({ type: BATTLE_ACTIONS.ENEMY_ATTACK });

        // Process attack result after animation
        setTimeout(() => {
          dispatch({ type: BATTLE_ACTIONS.ENEMY_ATTACK_COMPLETE });
        }, 1000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.battleState]);

  // Effect to handle victory rewards
  useEffect(() => {
    if (
      state.battleState === BATTLE_STATES.VICTORY &&
      state.enemy &&
      state.playerPokemon
    ) {
      // Commented out automatic reward processing - now handled by VictoryScreen
      // Using toast only to notify the player of victory
      toast.success(`You won against ${state.enemy.name}!`);

      // We'll still log the victory in the battle log
      dispatch({
        type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
        message: `You defeated ${state.enemy.name}!`,
      });
    }
  }, [state.battleState, state.enemy, state.playerPokemon]);

  /**
   * Starts a battle with the specified enemy
   * @param {Object} enemy - Enemy Pokemon data
   */
  const startBattle = useCallback((enemy) => {
    if (!enemy) {
      console.error("Cannot start battle: No enemy provided");
      return;
    }

    // Ensure enemy has proper stats
    const preparedEnemy = {
      ...enemy,
      currentHp: enemy.currentHp || enemy.stats?.hp || 50,
      stats: enemy.stats || {
        hp: 50,
        attack: 10 * (enemy.level || 1),
        defense: 10 * (enemy.level || 1),
        speed: 10 * (enemy.level || 1),
      },
      level: enemy.level || 5,
    };

    dispatch({
      type: BATTLE_ACTIONS.START_BATTLE,
      enemy: preparedEnemy,
    });
  }, []);

  /**
   * Selects a Pokemon from the player's roster to use in battle
   * @param {Object} pokemon - Pokemon to select
   */
  const selectPokemon = useCallback((pokemon) => {
    if (!pokemon) {
      console.error("Cannot select Pokémon: No Pokémon provided");
      return;
    }

    // Ensure proper capitalization of Pokémon name
    if (pokemon.name) {
      pokemon = {
        ...pokemon,
        name:
          pokemon.name.charAt(0).toUpperCase() +
          pokemon.name.slice(1).toLowerCase(),
      };
    }

    dispatch({
      type: BATTLE_ACTIONS.SELECT_POKEMON,
      pokemon,
    });
  }, []);

  /**
   * Executes an attack with the current Pokemon
   * @param {Object} move - Move data (optional, will generate default if not provided)
   */
  const attack = useCallback(
    (move) => {
      if (!state.playerPokemon || !state.enemy) {
        console.error("Cannot attack: Missing player Pokémon or enemy");
        return;
      }

      if (!move) {
        // Generate default move if none provided using battleUtils for consistency
        move = generateDefaultMove(
          state.playerPokemon.type || "normal",
          state.playerPokemon.level || 1,
          false // Explicitly set isEnemy to false for player attacks
        );
      }

      // Initiate attack
      dispatch({
        type: BATTLE_ACTIONS.ATTACK,
        move,
      });

      // Process attack result after animation
      setTimeout(() => {
        dispatch({ type: BATTLE_ACTIONS.ATTACK_COMPLETE });
      }, 1000);
    },
    [state.playerPokemon, state.enemy]
  );

  /**
   * Uses an item on the active Pokemon
   * @param {Object} item - Item to use
   */
  const useItem = useCallback(
    (item) => {
      if (!item) {
        console.error("Cannot use item: No item provided");
        return;
      }

      if (!item.battleUsable) {
        dispatch({
          type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
          message: `${item.name} cannot be used in battle!`,
        });
        return;
      }

      // Log the item use
      dispatch({
        type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
        message: `Used ${item.name}!`,
      });

      // Apply item effect
      let resultMessage = "";

      switch (item.effect) {
        case "heal":
        case "fullheal":
          if (state.playerPokemon.currentHp >= state.playerPokemon.stats.hp) {
            resultMessage = `${state.playerPokemon.name}'s HP is already full!`;
            break;
          }

          const healAmount =
            item.effect === "fullheal"
              ? state.playerPokemon.stats.hp - state.playerPokemon.currentHp
              : Math.min(
                  item.amount,
                  state.playerPokemon.stats.hp - state.playerPokemon.currentHp
                );

          const newHp =
            item.effect === "fullheal"
              ? state.playerPokemon.stats.hp
              : state.playerPokemon.currentHp + healAmount;

          const updatedPokemon = {
            ...state.playerPokemon,
            currentHp: newHp,
          };

          // Update Pokémon in roster
          updatePokemonStats(state.playerPokemon.id, updatedPokemon);

          // Update player Pokémon in battle
          dispatch({
            type: BATTLE_ACTIONS.UPDATE_PLAYER_POKEMON,
            pokemon: updatedPokemon,
          });

          resultMessage =
            item.effect === "fullheal"
              ? `${state.playerPokemon.name} fully recovered ${healAmount} HP!`
              : `${state.playerPokemon.name} recovered ${healAmount} HP!`;
          break;

        case "boost":
          const statName = item.stat || "attack";
          const currentStat = state.playerPokemon.stats[statName] || 0;
          const boostedStat = Math.floor(currentStat * (1 + item.amount));

          // Apply boost
          const boostPercentage = item.amount * 100;
          const boostedPokemon = {
            ...state.playerPokemon,
            stats: {
              ...state.playerPokemon.stats,
              [statName]: boostedStat,
            },
            // Add markers for the boost
            [`${statName}Boost`]: boostedStat,
            [`${statName}BoostOriginal`]: currentStat,
            [`${statName}BoostEndsAfterBattle`]: true,
          };

          // Update Pokémon in roster
          updatePokemonStats(state.playerPokemon.id, boostedPokemon);

          // Update player Pokémon in battle
          dispatch({
            type: BATTLE_ACTIONS.UPDATE_PLAYER_POKEMON,
            pokemon: boostedPokemon,
          });

          resultMessage = `${state.playerPokemon.name}'s ${statName} increased by ${boostPercentage}%!`;
          break;

        case "status":
          // Since status effects aren't fully implemented, just show the message
          resultMessage = `${state.playerPokemon.name} was cured of ${item.statusEffect}!`;
          break;

        default:
          resultMessage = `Used ${item.name} on ${state.playerPokemon.name}!`;
      }

      // Show the result message
      dispatch({
        type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
        message: resultMessage,
      });

      // Consume the item
      const newItems = [...(state.items || [])];
      const itemIndex = newItems.findIndex((i) => i.id === item.id);
      if (itemIndex >= 0) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          quantity: newItems[itemIndex].quantity - 1,
        };
      }

      // Update animation state for showing item effect
      dispatch({
        type: BATTLE_ACTIONS.USE_ITEM,
        item,
      });

      // Enemy turn after item use (after a delay for animation)
      setTimeout(() => {
        dispatch({ type: BATTLE_ACTIONS.ENEMY_ATTACK });
      }, 1500);
    },
    [state.playerPokemon, updatePokemonStats, state.items]
  );

  /**
   * Switches to a different Pokemon during battle
   * @param {Object} pokemon - Pokemon to switch to
   */
  const changePokemon = useCallback(
    (pokemon) => {
      // Save the current Pokemon's HP before switching
      if (state.playerPokemon) {
        updatePokemonStats(state.playerPokemon.id, {
          currentHp: state.playerPokemon.currentHp,
        });
      }

      dispatch({
        type: BATTLE_ACTIONS.CHANGE_POKEMON,
        pokemon,
      });
    },
    [state.playerPokemon, updatePokemonStats]
  );

  /**
   * Attempts to flee from the current battle
   */
  const flee = useCallback(() => {
    dispatch({ type: BATTLE_ACTIONS.FLEE });

    // Save current Pokemon HP before ending the battle
    if (state.playerPokemon) {
      updatePokemonStats(state.playerPokemon.id, {
        currentHp: state.playerPokemon.currentHp,
      });
    }

    // End battle after fleeing animation
    setTimeout(() => {
      dispatch({ type: BATTLE_ACTIONS.BATTLE_END });
    }, 1000);
  }, [state.playerPokemon, updatePokemonStats]);

  /**
   * Ends the current battle and resets battle state
   */
  const endBattle = useCallback(() => {
    // Before ending the battle, ensure any HP changes are persisted to the roster
    if (state.playerPokemon) {
      // Update the current Pokemon's HP in the roster
      updatePokemonStats(state.playerPokemon.id, {
        currentHp: state.playerPokemon.currentHp,
      });
    }

    dispatch({ type: BATTLE_ACTIONS.BATTLE_END });
  }, [state.playerPokemon, updatePokemonStats]);

  /**
   * Handles battle completion and victory screen
   * @param {boolean} playerWon - Whether the player won the battle
   */
  const finishBattle = (playerWon = true) => {
    dispatch({ type: BATTLE_ACTIONS.FINISH_BATTLE, payload: { playerWon } });

    // If player won, show victory screen
    if (playerWon) {
      setShowVictory(true);
    } else {
      setShowDefeat(true);
    }
  };

  /**
   * Renders battle results screens (victory or defeat)
   */
  const renderBattleResults = () => {
    if (showVictory) {
      return (
        <VictoryScreen
          pokemon={activePokemon}
          enemy={enemy}
          xpGained={xpReward}
          currencyGained={currencyReward}
          isBossBattle={enemy?.isBoss}
          currentBattle={battleIndex}
          maxBattles={totalBattles}
          adventureType={adventureType}
          onNextBattle={() => {
            setShowVictory(false);
            nextBattle();
          }}
          onReturn={() => {
            setShowVictory(false);
            onComplete(true);
          }}
        />
      );
    } else if (showDefeat) {
      return (
        <DefeatScreen
          onRetry={() => {
            setShowDefeat(false);
            restartBattle();
          }}
          onQuit={() => {
            setShowDefeat(false);
            onComplete(false);
          }}
        />
      );
    }

    return null;
  };

  // Exposed context value
  const contextValue = {
    ...state,
    startBattle,
    selectPokemon,
    attack,
    useItem,
    changePokemon,
    flee,
    endBattle,
    finishBattle,
    renderBattleResults,
  };

  return (
    <BattleContext.Provider value={contextValue}>
      {children}
    </BattleContext.Provider>
  );
};

/**
 * Custom hook to access battle state and actions
 * @returns {Object} Battle context value
 * @throws {Error} If used outside of BattleProvider
 */
export const useBattle = () => {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error("useBattle must be used within a BattleProvider");
  }
  return context;
};

export default BattleContext;
