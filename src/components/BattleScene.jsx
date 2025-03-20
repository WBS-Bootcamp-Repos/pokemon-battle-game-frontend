/**
 * BattleScene Component
 *
 * Renders the battle arena with Pokemon sprites, health bars, platforms,
 * and battle animations. Provides visual representation of the battle state
 * including attack animations and item use effects.
 */
import React from "react";
import { motion } from "framer-motion";
import {
  BattlePokemon,
  AttackAnimation,
  FaintAnimation,
  ItemAnimation,
} from "./battle";
import { getPokemonType } from "../utils/pokemonTypeUtils";

/**
 * Renders the battle arena with Pokemon sprites, status indicators, and animations
 *
 * @param {Object} playerPokemon - The player's active Pokemon
 * @param {Object} enemyPokemon - The enemy Pokemon
 * @param {string} battleState - Current state of the battle ("attacking", "enemyTurn", "useItem", etc.)
 * @param {Function} onAttack - Handler for attack actions
 * @param {Function} onUseItem - Handler for item use actions
 * @param {Function} onChangePokemon - Handler for Pokemon switching
 * @param {Function} onFlee - Handler for fleeing from battle
 * @param {boolean} isPlayerTurn - Whether it's currently the player's turn
 * @param {Object} activeItem - Currently active item being used (if any)
 */
const BattleScene = ({
  playerPokemon,
  enemyPokemon,
  battleState,
  onAttack,
  onUseItem,
  onChangePokemon,
  onFlee,
  isPlayerTurn,
  activeItem,
}) => {
  // Check if either Pokemon has fainted
  const playerFainted = playerPokemon && playerPokemon.currentHp <= 0;
  const enemyFainted = enemyPokemon && enemyPokemon.currentHp <= 0;

  // Get current move type from battle state for attack animations
  const currentMoveType = battleState?.lastMove?.type || "normal";

  // New state variables for attack animations and hit detection
  const animatePlayerAttack = battleState === "attacking";
  const animateEnemyAttack = battleState === "enemyTurn";
  const attackHitEnemy = animatePlayerAttack;
  const attackHitPlayer = animateEnemyAttack;

  return (
    <div
      className="relative bg-gradient-to-b from-[#78c8e0] to-[#98e0f8] rounded-lg overflow-hidden border-4 border-[#383030] mb-2"
      style={{ aspectRatio: "4/3" }}
    >
      {/* Battle field with platform graphics */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {/* Scenic background - sky */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#add8e6]"
          style={{ zIndex: 1 }}
        ></div>

        {/* Ground area */}
        <div
          className="absolute bottom-0 w-full h-2/5 bg-gradient-to-b from-[#7cac50] to-[#5b8c3d]"
          style={{ zIndex: 2 }}
        ></div>

        {/* Enemy Pokémon info panel - TOP LEFT (unchanged) */}
        {enemyPokemon && (
          <div
            className="absolute top-3 left-3 bg-[#f0f0f0] p-2 rounded-lg border-4 border-[#383030] shadow-md"
            style={{ zIndex: 10, width: "200px" }}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-pixel text-lg text-[#383030] truncate max-w-[120px]">
                {enemyPokemon.name || "Enemy"}
              </h3>
              <span className="font-pixel text-sm bg-[#383030] text-white px-2 py-0.5 rounded-md whitespace-nowrap ml-1">
                Lv{enemyPokemon.level || "?"}
              </span>
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-pixel text-sm mr-2">HP:</span>
                <div className="flex-1 h-4 bg-[#a0a0a0] rounded-sm overflow-hidden border border-[#383030]">
                  <div
                    className="h-full bg-[#30d030] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((enemyPokemon.currentHp || 0) /
                            (enemyPokemon.stats?.hp || 100)) *
                            100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-end font-pixel text-sm mt-1">
                {enemyPokemon.currentHp || 0}/{enemyPokemon.stats?.hp || 100}
              </div>
            </div>
          </div>
        )}

        {/* Player Pokémon info panel - BOTTOM RIGHT (unchanged) */}
        {playerPokemon && (
          <div
            className="absolute bottom-3 right-3 bg-[#f0f0f0] p-2 rounded-lg border-4 border-[#383030] shadow-md"
            style={{ zIndex: 10, width: "200px" }}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-pixel text-lg text-[#383030] truncate max-w-[120px]">
                {playerPokemon.name || "Your Pokémon"}
              </h3>
              <span className="font-pixel text-sm bg-[#383030] text-white px-2 py-0.5 rounded-md whitespace-nowrap ml-1">
                Lv{playerPokemon.level || "?"}
              </span>
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-pixel text-sm mr-2">HP:</span>
                <div className="flex-1 h-4 bg-[#a0a0a0] rounded-sm overflow-hidden border border-[#383030]">
                  <div
                    className="h-full bg-[#30d030] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((playerPokemon.currentHp || 0) /
                            (playerPokemon.stats?.hp || 100)) *
                            100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-end font-pixel text-sm mt-1">
                {playerPokemon.currentHp || 0}/{playerPokemon.stats?.hp || 100}
              </div>
            </div>
            {/* XP bar (only for player Pokémon) with GBA blue styling */}
            <div className="mt-1">
              <div className="flex items-center">
                <span className="font-pixel text-sm mr-2">EXP:</span>
                <div className="flex-1 h-3 bg-[#a0a0a0] rounded-sm overflow-hidden border border-[#383030]">
                  <div
                    className="h-full bg-[#2090f0] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((playerPokemon.xp || 0) /
                            ((playerPokemon.level || 1) * 100)) *
                            100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle content - Pokemon placement - adjusted positions without platforms */}
        <div className="relative h-full flex justify-between items-end pb-[15%]">
          {/* Enemy Pokemon - Improved positioning */}
          <div
            className="absolute bottom-[35%] right-[20%] transform scale-[1.8]"
            style={{ zIndex: 4 }}
          >
            {enemyPokemon && (
              <BattlePokemon
                pokemon={enemyPokemon}
                isEnemy={true}
                animateAttack={animateEnemyAttack}
                isHit={attackHitEnemy}
              />
            )}
          </div>

          {/* Player Pokemon - Improved positioning */}
          <div
            className="absolute bottom-[18%] left-[20%] transform scale-[1.8]"
            style={{ zIndex: 4 }}
          >
            {playerPokemon && (
              <BattlePokemon
                pokemon={playerPokemon}
                isEnemy={false}
                animateAttack={animatePlayerAttack}
                isHit={attackHitPlayer}
              />
            )}
          </div>
        </div>

        {/* Attack animations */}
        <AttackAnimation
          isActive={animatePlayerAttack}
          isEnemy={false}
          type={currentMoveType}
        />
        <AttackAnimation
          isActive={animateEnemyAttack}
          isEnemy={true}
          type={currentMoveType}
        />

        {/* Item use animation */}
        {battleState === "useItem" && activeItem && (
          <ItemAnimation item={activeItem} isActive={true} />
        )}

        {/* Faint animations */}
        {playerPokemon && playerPokemon.currentHp <= 0 && (
          <FaintAnimation isEnemy={false} />
        )}
        {enemyPokemon && enemyPokemon.currentHp <= 0 && (
          <FaintAnimation isEnemy={true} />
        )}
      </div>
    </div>
  );
};

export default BattleScene;
