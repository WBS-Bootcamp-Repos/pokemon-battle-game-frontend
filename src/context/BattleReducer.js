/**
 * BattleReducer - State management for Pokemon battles
 * 
 * This module handles battle state transitions, damage calculations,
 * and manages the flow of battle including attacks, item usage, and
 * Pokemon switching.
 */
import { calculateDamage, generateDefaultMove } from "../utils/battleUtils";

/**
 * Action types for battle state management
 */
export const BATTLE_ACTIONS = {
  START_BATTLE: "START_BATTLE",
  SELECT_POKEMON: "SELECT_POKEMON",
  ATTACK: "ATTACK",
  ATTACK_COMPLETE: "ATTACK_COMPLETE",
  ENEMY_ATTACK: "ENEMY_ATTACK",
  ENEMY_ATTACK_COMPLETE: "ENEMY_ATTACK_COMPLETE",
  CHANGE_POKEMON: "CHANGE_POKEMON",
  USE_ITEM: "USE_ITEM",
  UPDATE_PLAYER_POKEMON: "UPDATE_PLAYER_POKEMON",
  FLEE: "FLEE",
  BATTLE_END: "BATTLE_END",
  UPDATE_ENEMY: "UPDATE_ENEMY",
  UPDATE_BATTLE_LOG: "UPDATE_BATTLE_LOG",
  UPDATE_ITEMS: "UPDATE_ITEMS",
  UPDATE_ROSTER: "UPDATE_ROSTER",
};

/**
 * Possible states during a battle
 */
export const BATTLE_STATES = {
  IDLE: "idle",
  STARTING: "starting",
  SELECT_POKEMON: "selectPokemon",
  PLAYER_TURN: "playerTurn",
  SELECTING_MOVE: "selectingMove",
  ATTACKING: "attacking",
  ENEMY_TURN: "enemyTurn",
  VICTORY: "victory",
  DEFEAT: "defeat",
  FLEEING: "fleeing",
  USING_ITEM: "usingItem",
  CHANGING_POKEMON: "changingPokemon",
  USE_ITEM: "useItem",
};

/**
 * Checks if the enemy Pokemon has been defeated
 * @param {Object} enemy - The enemy Pokemon
 * @returns {boolean} True if enemy is defeated or null
 */
export const isEnemyDefeated = (enemy) => {
  return !enemy || enemy.currentHp <= 0;
};

/**
 * Checks if the player's active Pokemon has been defeated
 * @param {Object} playerPokemon - The player's active Pokemon
 * @returns {boolean} True if player Pokemon is defeated or null
 */
export const isPlayerDefeated = (playerPokemon) => {
  return !playerPokemon || playerPokemon.currentHp <= 0;
};

/**
 * Checks if all Pokemon in the player's roster are defeated
 * @param {Array} roster - The player's roster of Pokemon
 * @returns {boolean} True if all Pokemon are defeated
 */
export const isAllPlayerPokemonDefeated = (roster) => {
  if (!roster || roster.length === 0) return true;
  return roster.every((pokemon) => pokemon.currentHp <= 0);
};

/**
 * Initial state for the battle reducer
 */
export const initialBattleState = {
  enemy: null,
  playerPokemon: null,
  playerRoster: [],
  battleState: BATTLE_STATES.IDLE,
  battleLog: [],
  isPlayerTurn: true,
  playerMove: null,
  enemyMove: null,
  activeItem: null,
  items: [],
};

/**
 * Battle reducer - Manages state transitions during Pokemon battles
 * 
 * @param {Object} state - Current battle state
 * @param {Object} action - Action to process
 * @returns {Object} New battle state
 */
export const battleReducer = (state, action) => {
  switch (action.type) {
    // Initiate a new battle with an enemy
    case BATTLE_ACTIONS.START_BATTLE:
      return {
        ...state,
        enemy: action.enemy,
        battleState: BATTLE_STATES.SELECT_POKEMON,
        battleLog: ["A wild " + action.enemy.name + " appeared!"],
        isPlayerTurn: true,
      };

    // Select a Pokemon to use in battle
    case BATTLE_ACTIONS.SELECT_POKEMON:
      return {
        ...state,
        playerPokemon: action.pokemon,
        battleState: BATTLE_STATES.PLAYER_TURN,
        battleLog: [...state.battleLog, "Go " + action.pokemon.name + "!"],
      };

    // Player initiates an attack
    case BATTLE_ACTIONS.ATTACK:
      return {
        ...state,
        battleState: BATTLE_STATES.ATTACKING,
        battleLog: [
          ...state.battleLog,
          `${state.playerPokemon.name} used ${action.move.name}!`,
        ],
        playerMove: action.move,
      };

    // Complete player's attack and process damage
    case BATTLE_ACTIONS.ATTACK_COMPLETE: {
      // Calculate damage and effectiveness
      const damageResult = calculateDamage(
        state.playerPokemon,
        state.enemy,
        state.playerMove || { type: state.playerPokemon.type, power: 40 }
      );

      // Update enemy HP
      const updatedEnemy = {
        ...state.enemy,
        currentHp: Math.max(0, state.enemy.currentHp - damageResult.damage),
        isHit: true,
      };

      // Check if enemy is defeated
      if (isEnemyDefeated(updatedEnemy)) {
        return {
          ...state,
          enemy: updatedEnemy,
          battleState: BATTLE_STATES.VICTORY,
          battleLog: [
            ...state.battleLog,
            `It did ${damageResult.damage} damage!`,
            damageResult.message,
            `Enemy ${state.enemy.name} fainted!`,
            `${state.playerPokemon.name} gained ${state.enemy.level * 2} XP!`,
          ],
        };
      }

      // Enemy survives, switch to enemy turn
      return {
        ...state,
        enemy: updatedEnemy,
        battleState: BATTLE_STATES.ENEMY_TURN,
        battleLog: [
          ...state.battleLog,
          `It did ${damageResult.damage} damage!`,
          damageResult.message,
        ],
        isPlayerTurn: false,
      };
    }

    // Enemy initiates an attack
    case BATTLE_ACTIONS.ENEMY_ATTACK:
      // Generate a move based on the enemy's type
      const enemyMove = generateDefaultMove(
        state.enemy.type || "normal",
        state.enemy.level || 5
      );

      return {
        ...state,
        battleState: BATTLE_STATES.ENEMY_TURN,
        activeItem: null,
        battleLog: [
          ...state.battleLog,
          `Enemy ${state.enemy.name} used ${enemyMove.name}!`,
        ],
        enemyMove: enemyMove,
      };

    // Complete enemy's attack and process damage
    case BATTLE_ACTIONS.ENEMY_ATTACK_COMPLETE: {
      // Calculate damage and effectiveness
      const damageResult = calculateDamage(
        state.enemy,
        state.playerPokemon,
        state.enemyMove || { type: state.enemy.type, power: 40 }
      );

      // Update player Pokemon HP
      const updatedPlayerPokemon = {
        ...state.playerPokemon,
        currentHp: Math.max(
          0,
          state.playerPokemon.currentHp - damageResult.damage
        ),
        isHit: true,
      };

      // Check if player is defeated
      if (isPlayerDefeated(updatedPlayerPokemon)) {
        // Check if all player Pokemon are defeated
        if (isAllPlayerPokemonDefeated(state.playerRoster)) {
          return {
            ...state,
            playerPokemon: updatedPlayerPokemon,
            battleState: BATTLE_STATES.DEFEAT,
            battleLog: [
              ...state.battleLog,
              `It did ${damageResult.damage} damage!`,
              damageResult.message,
              `${state.playerPokemon.name} fainted!`,
              "You have no usable Pokémon left!",
            ],
          };
        }

        // Still have other Pokemon, prompt to change
        return {
          ...state,
          playerPokemon: updatedPlayerPokemon,
          battleState: BATTLE_STATES.CHANGING_POKEMON,
          battleLog: [
            ...state.battleLog,
            `It did ${damageResult.damage} damage!`,
            damageResult.message,
            `${state.playerPokemon.name} fainted!`,
            "Choose another Pokémon!",
          ],
          isPlayerTurn: true,
        };
      }

      // Player survives, return to player turn
      return {
        ...state,
        playerPokemon: updatedPlayerPokemon,
        battleState: BATTLE_STATES.PLAYER_TURN,
        battleLog: [
          ...state.battleLog,
          `It did ${damageResult.damage} damage!`,
          damageResult.message,
        ],
        isPlayerTurn: true,
      };
    }

    // Change active Pokemon
    case BATTLE_ACTIONS.CHANGE_POKEMON:
      if (action.pokemon) {
        return {
          ...state,
          playerPokemon: action.pokemon,
          battleState: BATTLE_STATES.ENEMY_TURN,
          battleLog: [
            ...state.battleLog,
            `${
              state.playerPokemon
                ? state.playerPokemon.name + ", return!"
                : "Come back!"
            }`,
            `Go ${action.pokemon.name}!`,
          ],
          isPlayerTurn: false,
        };
      } else {
        return {
          ...state,
          battleState: BATTLE_STATES.CHANGING_POKEMON,
          battleLog: [
            ...state.battleLog,
            `${state.playerPokemon.name}, return!`,
            "Choose another Pokémon!",
          ],
        };
      }

    // Use an item
    case BATTLE_ACTIONS.USE_ITEM:
      return {
        ...state,
        battleState: BATTLE_STATES.USE_ITEM,
        activeItem: action.item,
      };

    // Flee from battle
    case BATTLE_ACTIONS.FLEE:
      return {
        ...state,
        battleState: BATTLE_STATES.FLEEING,
        battleLog: [...state.battleLog, "Got away safely!"],
      };

    // End battle and reset state
    case BATTLE_ACTIONS.BATTLE_END:
      return {
        ...state,
        enemy: null,
        playerPokemon: null,
        battleState: BATTLE_STATES.IDLE,
        battleLog: [],
        isPlayerTurn: true,
      };

    // Update enemy Pokemon
    case BATTLE_ACTIONS.UPDATE_ENEMY:
      return {
        ...state,
        enemy: {
          ...state.enemy,
          ...action.updates,
        },
      };

    // Add message to battle log
    case BATTLE_ACTIONS.UPDATE_BATTLE_LOG:
      return {
        ...state,
        battleLog: [...state.battleLog, action.message],
      };

    // Update player Pokemon
    case BATTLE_ACTIONS.UPDATE_PLAYER_POKEMON:
      return {
        ...state,
        playerPokemon: action.pokemon,
      };

    // Update player roster
    case BATTLE_ACTIONS.UPDATE_ROSTER:
      return {
        ...state,
        playerRoster: action.roster,
      };

    // Update items
    case BATTLE_ACTIONS.UPDATE_ITEMS:
      return {
        ...state,
        items: action.items,
      };

    // Default case - return current state
    default:
      return state;
  }
};