/**
 * BattleControls Component
 *
 * Provides the main battle interface for player actions during Pokemon battles.
 * Includes attack functionality with dynamic move generation based on Pokemon type,
 * item usage interface, and Pokemon switching capabilities.
 */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getPokemonType,
  generateTypeBasedMove,
} from "../utils/pokemonTypeUtils";
import { getPokemonId } from "../utils/spriteUtils";
import { ItemSelectionModal, ChoosePokemonScreen } from "./battle";

/**
 * Gets a CSS class for styling type badges based on Pokemon type
 * @param {string} type - The Pokemon type
 * @returns {string} CSS class for styling
 */
const getTypeColorClass = (type) => {
  const typeColors = {
    normal: "bg-[#A8A878]",
    fire: "bg-[#F08030]",
    water: "bg-[#6890F0]",
    grass: "bg-[#78C850]",
    electric: "bg-[#F8D030]",
    ice: "bg-[#98D8D8]",
    fighting: "bg-[#C03028]",
    poison: "bg-[#A040A0]",
    ground: "bg-[#E0C068]",
    flying: "bg-[#A890F0]",
    psychic: "bg-[#F85888]",
    bug: "bg-[#A8B820]",
    rock: "bg-[#B8A038]",
    ghost: "bg-[#705898]",
    dragon: "bg-[#7038F8]",
    dark: "bg-[#705848]",
    steel: "bg-[#B8B8D0]",
    fairy: "bg-[#EE99AC]",
  };

  return typeColors[type.toLowerCase()] || "bg-[#A8A878]";
};

const BattleControls = ({
  playerPokemon,
  enemyPokemon,
  battleState,
  onAttack,
  onUseItem,
  onChangePokemon,
  onFlee,
  isPlayerTurn,
  playerRoster,
  inventory,
}) => {
  // UI state management
  const [showItems, setShowItems] = useState(false);
  const [showPokemon, setShowPokemon] = useState(false);
  const [currentMove, setCurrentMove] = useState(null);

  // Update current move when player Pokemon changes
  useEffect(() => {
    if (playerPokemon) {
      const move = generateTypeBasedMove(playerPokemon);
      setCurrentMove(move);
    }
  }, [playerPokemon]);

  // Auto-show Pokemon switch menu when the active Pokemon faints
  useEffect(() => {
    if (playerPokemon && playerPokemon.currentHp <= 0) {
      // Show Pokemon switch menu automatically when Pokemon faints
      setShowPokemon(true);
      setShowItems(false);
    }
  }, [playerPokemon]);

  // Reset all submenus to return to main battle controls
  const resetMenus = () => {
    // Don't reset Pokemon menu if current Pokemon is fainted
    if (playerPokemon && playerPokemon.currentHp <= 0) {
      setShowItems(false);
      return;
    }

    setShowItems(false);
    setShowPokemon(false);
  };

  // Check if current Pokémon can fight
  const canFight = playerPokemon && playerPokemon.currentHp > 0;

  /**
   * Handle player's attack action
   */
  const handleAttack = () => {
    // Get the move based on the Pokémon's type
    const move = generateTypeBasedMove(playerPokemon);

    // Update the current move state
    setCurrentMove(move);

    // If we successfully generated a move and have a Pokémon
    if (move && playerPokemon) {
      // Update the Pokémon's attack property for future reference
      if (playerPokemon.attack && typeof playerPokemon.attack === "object") {
        playerPokemon.attack.name = move.name;
        playerPokemon.attack.type = move.type;
      } else {
        playerPokemon.attack = {
          name: move.name,
          type: move.type,
          power: move.power,
        };
      }

      // Execute the attack
      onAttack(move);
    } else {
      // Fallback to a normal attack if something went wrong
      onAttack({ name: "Tackle", type: "normal", power: 40 });
    }
  };

  return (
    <div className="bg-[#e0e0e0] border-4 border-[#303030] rounded-lg p-3 shadow-md">
      {/* Main control panel - GBA style */}
      {!showItems && !showPokemon && (
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn || !canFight ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleAttack}
            disabled={!isPlayerTurn || !canFight}
          >
            ATTACK
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setShowItems(true)}
            disabled={!isPlayerTurn}
          >
            ITEM
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setShowPokemon(true)}
            disabled={!isPlayerTurn}
          >
            POKÉMON
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              onFlee();
              resetMenus();
            }}
            disabled={!isPlayerTurn}
          >
            RUN
          </button>
        </div>
      )}

      {/* Items submenu */}
      {showItems && (
        <div className="flex flex-col space-y-2">
          <h3 className="font-pixel text-lg mb-1">Items:</h3>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {inventory && inventory.length > 0 ? (
              inventory
                .filter((item) => item.quantity > 0) // Only show items with quantity > 0
                .map((item, index) => (
                  <button
                    key={index}
                    className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner flex justify-between items-center ${
                      !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
                    } hover:brightness-110`}
                    onClick={() => {
                      onUseItem(item);
                      resetMenus();
                    }}
                    disabled={!isPlayerTurn || item.battleUsable === false}
                    style={{ borderColor: item.color || "#202020" }}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{item.icon || "🎒"}</span>
                      <div className="flex flex-col items-start">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-300">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs">x{item.quantity}</span>
                      {item.battleUsable === false && (
                        <span className="text-xs text-red-300">
                          Not usable in battle
                        </span>
                      )}
                    </div>
                  </button>
                ))
            ) : (
              <div className="col-span-2 text-center font-pixel text-gray-600 py-2">
                No items available
              </div>
            )}
          </div>
          <button
            className="font-pixel bg-[#606060] text-white py-1 px-4 rounded border-2 border-[#505050] shadow-inner hover:brightness-110 mt-2"
            onClick={resetMenus}
          >
            Back
          </button>
        </div>
      )}

      {/* Pokémon submenu */}
      {showPokemon && (
        <div className="flex flex-col space-y-2">
          <h3 className="font-pixel text-lg mb-1">Pokémon:</h3>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {playerRoster && playerRoster.length > 0 ? (
              playerRoster.map((mon, index) => (
                <button
                  key={index}
                  className={`font-pixel flex justify-between items-center ${
                    mon.id === playerPokemon?.id
                      ? "bg-[#383030] border-[#202020]"
                      : mon.currentHp <= 0
                      ? "bg-[#707070] border-[#606060]"
                      : "bg-[#383030] border-[#202020] hover:brightness-110"
                  } text-white py-2 px-4 rounded border-2 shadow-inner ${
                    !isPlayerTurn ||
                    mon.id === playerPokemon?.id ||
                    mon.currentHp <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (mon.id !== playerPokemon?.id && mon.currentHp > 0) {
                      onChangePokemon(mon);
                      resetMenus();
                    } else if (mon.currentHp <= 0) {
                      toast.error(`${mon.name} is fainted and cannot battle!`);
                    }
                  }}
                  disabled={
                    !isPlayerTurn ||
                    mon.id === playerPokemon?.id ||
                    mon.currentHp <= 0
                  }
                >
                  <div className="flex items-center">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                        mon.name
                      )}.png`}
                      alt={mon.name}
                      className="w-10 h-10 mr-2 pixelated"
                      onError={(e) => {
                        e.target.src =
                          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                      }}
                    />
                    <div>
                      <span className="capitalize">{mon.name}</span>
                      <span className="text-xs block">Lv{mon.level}</span>
                      <span
                        className={`text-xs px-1 rounded capitalize mt-1 inline-block text-white ${getTypeColorClass(
                          getPokemonType(mon)
                        )}`}
                      >
                        {getPokemonType(mon)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs block">
                      HP: {mon.currentHp}/{mon.stats?.hp}
                    </span>
                    {mon.id === playerPokemon?.id && (
                      <span className="text-xs block font-bold">ACTIVE</span>
                    )}
                    {mon.currentHp <= 0 && (
                      <span className="text-xs block font-bold text-red-300">
                        FAINTED
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center font-pixel text-gray-600 py-2">
                No Pokémon available
              </div>
            )}
          </div>
          <button
            className="font-pixel bg-[#606060] text-white py-1 px-4 rounded border-2 border-[#505050] shadow-inner hover:brightness-110 mt-2"
            onClick={resetMenus}
          >
            Back
          </button>
        </div>
      )}

      {/* Pokémon type and move info */}
      {!showItems && !showPokemon && playerPokemon && (
        <div className="mt-3 bg-[#d0d0d0] p-2 rounded-md border-2 border-[#303030]">
          <div className="text-center font-pixel">
            <div className="font-bold capitalize">
              {playerPokemon.name}'s Move:
            </div>
            <div className="flex items-center justify-center mt-1">
              <span className="mr-1">{currentMove?.name || "Attack"}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded capitalize text-white ${getTypeColorClass(
                  currentMove?.type || "normal"
                )}`}
              >
                {currentMove?.type || "normal"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleControls;
