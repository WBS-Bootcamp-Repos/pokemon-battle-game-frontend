/**
 * BattleScene Component
 * 
 * Renders the battle arena with Pokemon sprites, health bars, platforms,
 * and battle animations. Provides visual representation of the battle state
 * including attack animations and item use effects.
 */
import React from "react";
import { motion } from "framer-motion";
import { BattlePokemon, AttackAnimation } from "./BattleComponents";

/**
 * Determines a Pokemon's type based on available data
 * Uses multiple fallback strategies to ensure a type is always returned
 * 
 * @param {Object} pokemon - The Pokemon object
 * @returns {string} The Pokemon's type (lowercase)
 */
const getPokemonType = (pokemon) => {
  if (!pokemon) return "normal";

  // Handle special cases for starters and other common Pokémon
  if (pokemon.name) {
    const name = pokemon.name.toLowerCase();
    // Force type for well-known Pokémon
    if (name === "venusaur" || name === "bulbasaur" || name === "ivysaur") {
      return "grass";
    }
    if (
      name === "charizard" ||
      name === "charmander" ||
      name === "charmeleon"
    ) {
      return "fire";
    }
    if (name === "blastoise" || name === "squirtle" || name === "wartortle") {
      return "water";
    }
    if (name === "pikachu" || name === "raichu") {
      return "electric";
    }
    if (name === "gengar" || name === "gastly" || name === "haunter") {
      return "ghost";
    }
    if (
      name === "mewtwo" ||
      name === "mew" ||
      name === "abra" ||
      name === "kadabra" ||
      name === "alakazam"
    ) {
      return "psychic";
    }
  }

  // First check if Pokémon has a defined attack with type
  if (pokemon.attack && pokemon.attack.type) {
    return pokemon.attack.type.toLowerCase();
  }
  // Check for first move in moves array
  else if (pokemon.moves && pokemon.moves.length > 0 && pokemon.moves[0].type) {
    return pokemon.moves[0].type.toLowerCase();
  }

  // Enhanced type extraction
  let pokemonType = "normal"; // Default fallback

  // Direct type property as string
  if (typeof pokemon.type === "string") {
    pokemonType = pokemon.type;
  }
  // Type object with name
  else if (pokemon.type && pokemon.type.name) {
    pokemonType = pokemon.type.name;
  }
  // Check types array - various formats
  else if (pokemon.types && pokemon.types.length > 0) {
    // String format in array
    if (typeof pokemon.types[0] === "string") {
      pokemonType = pokemon.types[0];
    }
    // PokeAPI format
    else if (pokemon.types[0].type && pokemon.types[0].type.name) {
      pokemonType = pokemon.types[0].type.name;
    }
    // Object with name property
    else if (pokemon.types[0].name) {
      pokemonType = pokemon.types[0].name;
    }
  }

  return pokemonType.toLowerCase(); // Return lowercase for consistency
};

/**
 * Displays animated effects when items are used in battle
 * 
 * @param {Object} item - The item being used
 * @param {boolean} isActive - Whether the animation should be active
 */
const ItemAnimation = ({ item, isActive }) => {
  if (!item || !isActive) return null;

  /**
   * Determines animation style based on item effect type
   * @returns {Object} Style configuration for the animation
   */
  const getItemAnimationStyle = () => {
    switch (item.effect) {
      case "heal":
      case "fullheal":
        return {
          animation: "healing",
          color: item.color || "#99ff99",
          icon: item.icon || "💊",
          size: "80px",
        };
      case "boost":
        return {
          animation: "boost",
          color: item.color || "#ffff99",
          icon: item.icon || "⚡",
          size: "70px",
        };
      case "revive":
        return {
          animation: "revive",
          color: item.color || "#ffff99",
          icon: item.icon || "✨",
          size: "90px",
        };
      default:
        return {
          animation: "default",
          color: item.color || "#ffffff",
          icon: item.icon || "🎒",
          size: "60px",
        };
    }
  };

  const style = getItemAnimationStyle();

  return (
    <motion.div
      className="absolute z-20 flex items-center justify-center"
      style={{
        left: "30%",
        bottom: "25%",
        width: style.size,
        height: style.size,
        color: style.color,
        textShadow: `0 0 10px ${style.color}`,
      }}
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1.5, 0.8],
        y: [50, 0, -50, -100],
        rotate: style.animation === "boost" ? [0, 15, -15, 0] : 0,
      }}
      transition={{
        duration: 1.5,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut",
      }}
    >
      <span style={{ fontSize: style.size }}>{style.icon}</span>
    </motion.div>
  );
};

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

        {/* Platform for enemy Pokémon */}
        <div
          className="absolute bottom-[28%] right-[20%] w-40 h-8 bg-[#615b4b] rounded-full transform rotate-[-5deg] shadow-lg"
          style={{ zIndex: 3 }}
        ></div>

        {/* Platform for player Pokémon */}
        <div
          className="absolute bottom-[10%] left-[20%] w-40 h-8 bg-[#615b4b] rounded-full transform rotate-[5deg] shadow-lg"
          style={{ zIndex: 3 }}
        ></div>

        {/* Enemy Pokémon info panel - TOP LEFT */}
        {enemyPokemon && (
          <div
            className="absolute top-3 left-3 bg-[#f0f0f0] p-2 rounded-lg border-4 border-[#383030] shadow-md"
            style={{ zIndex: 10, minWidth: "180px" }}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-pixel text-lg text-[#383030]">
                {enemyPokemon.name || "Enemy"}
              </h3>
              <span className="font-pixel text-sm bg-[#383030] text-white px-2 py-0.5 rounded-md">
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

        {/* Player Pokémon info panel - BOTTOM RIGHT */}
        {playerPokemon && (
          <div
            className="absolute bottom-3 right-3 bg-[#f0f0f0] p-2 rounded-lg border-4 border-[#383030] shadow-md"
            style={{ zIndex: 10, minWidth: "180px" }}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-pixel text-lg text-[#383030]">
                {playerPokemon.name || "Your Pokémon"}
              </h3>
              <span className="font-pixel text-sm bg-[#383030] text-white px-2 py-0.5 rounded-md">
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
                <div className="flex-1 h-4 bg-[#a0a0a0] rounded-sm overflow-hidden border border-[#383030]">
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

        {/* Battle content - Pokemon placement */}
        <div className="relative h-full flex justify-between items-end pb-[15%]">
          {/* Enemy Pokemon - Positioned on platform */}
          <div
            className="absolute bottom-[30%] right-[20%] transform translate-x-1/2 scale-[2.0]"
            style={{ zIndex: 4 }}
          >
            {enemyPokemon && (
              <BattlePokemon
                pokemon={enemyPokemon}
                isEnemy={true}
                animateAttack={battleState === "enemyTurn"}
              />
            )}
          </div>

          {/* Player Pokemon - Positioned on platform */}
          <div
            className="absolute bottom-[12%] left-[20%] transform -translate-x-1/2 scale-[1.75]"
            style={{ zIndex: 4 }}
          >
            {playerPokemon && (
              <BattlePokemon
                pokemon={playerPokemon}
                isEnemy={false}
                animateAttack={battleState === "attacking"}
              />
            )}
          </div>
        </div>

        {/* Battle animations */}
        {battleState === "attacking" && playerPokemon && enemyPokemon && (
          <AttackAnimation
            type={getPokemonType(playerPokemon)}
            isActive={true}
            isEnemy={false}
          />
        )}

        {battleState === "enemyTurn" && playerPokemon && enemyPokemon && (
          <AttackAnimation
            type={getPokemonType(enemyPokemon)}
            isActive={true}
            isEnemy={true}
          />
        )}

        {/* Item use animation */}
        {battleState === "useItem" && activeItem && (
          <ItemAnimation item={activeItem} isActive={true} />
        )}
      </div>
    </div>
  );
};

export default BattleScene;