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
  
      // Calculate level and if this is a boss battle
      const level = Math.min(5 + Math.floor(battleIndex * 1.5), 25);
      const isBoss = battleIndex === maxBattles - 1;
      const multiplier = isBoss ? 2 : 1;
  
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
  
      // Create enemy Pokemon
      return {
        id: `enemy-${battleIndex}`,
        name: isBoss ? `Boss ${name}` : name,
        level: level,
        type: type,
        currentHp: 50 * multiplier,
        maxHp: 50 * multiplier,
        stats: {
          attack: 10 + level * 0.5 * multiplier,
          defense: 8 + level * 0.3 * multiplier,
          speed: 7 + level * 0.2 * multiplier,
          hp: 50 * multiplier,
        },
        moves: [
          {
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Attack`,
            type: type,
            power: 40 + level * 0.5 * multiplier,
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
        // Track if we've already processed this victory to prevent multiple calls
        const victoryKey = `${state.playerPokemon.id}-${state.enemy.id}-victory`;
        const alreadyProcessed = sessionStorage.getItem(victoryKey) === "true";
  
        if (!alreadyProcessed) {
          sessionStorage.setItem(victoryKey, "true");
  
          const handleVictory = async () => {
            try {
              // Calculate XP gain - boss battles give more XP
              const xpGained = calculateXp(state.enemy, state.enemy.isBoss);
  
              // Calculate money gain - boss battles give more money
              const moneyGained = calculateCurrency(
                state.enemy,
                state.enemy.isBoss
              );
  
              // Show boss victory message if applicable
              if (state.enemy.isBoss) {
                dispatch({
                  type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
                  message: `You defeated Boss ${state.enemy.name}!`,
                });
                toast.success(`You defeated Boss ${state.enemy.name}!`, {
                  autoClose: 5000,
                });
              }
  
              // Update player Pokémon XP
              const updatedPokemon = {
                ...state.playerPokemon,
                xp: (state.playerPokemon.xp || 0) + xpGained,
              };
  
              // Check for level up
              const xpNeeded = updatedPokemon.level * 100;
              if (updatedPokemon.xp >= xpNeeded) {
                // Level up!
                updatedPokemon.level = updatedPokemon.level + 1;
                updatedPokemon.xp = updatedPokemon.xp - xpNeeded;
  
                // Increase stats
                updatedPokemon.stats = {
                  ...updatedPokemon.stats,
                  hp: Math.floor(updatedPokemon.stats.hp * 1.1),
                  attack: Math.floor(updatedPokemon.stats.attack * 1.1),
                  defense: Math.floor(updatedPokemon.stats.defense * 1.1),
                  speed: Math.floor(updatedPokemon.stats.speed * 1.1),
                };
  
                // Update current HP to match new max HP
                updatedPokemon.currentHp = updatedPokemon.stats.hp;
  
                // Add level up message to battle log
                dispatch({
                  type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
                  message: `${updatedPokemon.name} grew to level ${updatedPokemon.level}!`,
                });
  
                toast.success(
                  `${updatedPokemon.name} leveled up to ${updatedPokemon.level}!`
                );
              }
  
              // Update the Pokémon in roster
              updatePokemonStats(updatedPokemon.id, updatedPokemon);
  
              // Add money if supported
              if (updateCurrency && moneyGained > 0) {
                updateCurrency(moneyGained);
  
                dispatch({
                  type: BATTLE_ACTIONS.UPDATE_BATTLE_LOG,
                  message: `You got ${moneyGained} Poké Dollars!`,
                });
              }
            } catch (error) {
              console.error("Error processing victory rewards:", error);
            }
          };
  
          handleVictory();
        }
      } else {
        // Clear session storage for victory tracking when not in victory state
        sessionStorage.removeItem(
          `${state.playerPokemon?.id}-${state.enemy?.id}-victory`
        );
      }
    }, [
      state.battleState,
      state.enemy,
      state.playerPokemon,
      updateCurrency,
      updatePokemonStats,
      addPokemonToRoster,
    ]);
  
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
            state.playerPokemon.level || 1
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
    const changePokemon = useCallback((pokemon) => {
      dispatch({
        type: BATTLE_ACTIONS.CHANGE_POKEMON,
        pokemon,
      });
    }, []);
  
    /**
     * Attempts to flee from the current battle
     */
    const flee = useCallback(() => {
      dispatch({ type: BATTLE_ACTIONS.FLEE });
  
      // End battle after fleeing animation
      setTimeout(() => {
        dispatch({ type: BATTLE_ACTIONS.BATTLE_END });
      }, 1000);
    }, []);
  
    /**
     * Ends the current battle and resets battle state
     */
    const endBattle = useCallback(() => {
      dispatch({ type: BATTLE_ACTIONS.BATTLE_END });
    }, []);
  
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