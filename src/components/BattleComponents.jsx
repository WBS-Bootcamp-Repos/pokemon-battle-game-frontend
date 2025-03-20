/**
 * Battle Component Collection - Core components for the Pokemon battle system
 * 
 * This file contains all UI components related to the battle system including:
 * - Pokemon sprites with animations
 * - Battle controls and menus
 * - Battle log for messages
 * - Attack animations
 * - Victory/defeat screens
 * - Pokemon selection interfaces
 * - Item management
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  getPokemonSpriteUrl,
  handleSpriteError,
  getProperSprite,
} from "../utils/spriteUtils";

/**
 * Renders a Pokémon in the battle scene with animations
 * 
 * @param {Object} pokemon - Pokemon data object
 * @param {boolean} isEnemy - Whether this is an enemy Pokemon (true) or player Pokemon (false)
 * @param {boolean} isHit - Whether the Pokemon is currently being hit (for animation)
 */
export const BattlePokemon = ({ pokemon, isEnemy, isHit }) => {
  const [spriteError, setSpriteError] = useState(false);

  // Handle case when no pokemon is provided
  if (!pokemon) return null;

  // Use getProperSprite to get the correct view (front for enemy, back for player)
  const spriteUrl = getProperSprite(pokemon, isEnemy);

  return (
    <motion.div
      className={`relative ${isEnemy ? "enemy-pokemon" : "player-pokemon"}`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: isHit ? (isEnemy ? -20 : 20) : 0,
        y: [0, isEnemy ? -5 : 5, 0], // Subtle bounce animation
      }}
      transition={{
        opacity: { duration: 0.5 },
        x: isHit ? { type: "spring", stiffness: 300, damping: 10 } : {},
        y: { repeat: Infinity, duration: 2, ease: "easeInOut" }, // Continuous bounce
      }}
    >
      <img
        src={spriteError ? "/fallback-pokemon.png" : spriteUrl}
        alt={pokemon.name}
        className={`pokemon-sprite ${
          isEnemy ? "enemy pixelated" : "player pixelated"
        }`}
        style={{
          width: isEnemy ? "120px" : "140px",
          height: "auto",
          imageRendering: "pixelated",
          filter:
            "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3)) contrast(1.1) brightness(1.1)",
          transformOrigin: isEnemy ? "center" : "bottom center",
        }}
        onError={(e) => {
          console.warn(
            `Sprite loading error for ${pokemon?.name || "unknown"}`,
            e
          );
          setSpriteError(true);
        }}
      />
      {isHit && (
        <div className="hit-effect absolute inset-0 bg-black bg-opacity-30 animate-flash"></div>
      )}
    </motion.div>
  );
};

/**
 * Battle controls component - Main interface for player actions during battle
 * 
 * @param {Function} onAttack - Handler for when player attacks
 * @param {Function} onUseItem - Handler for when player uses an item
 * @param {Function} onChangePokemon - Handler for when player switches Pokemon
 * @param {Function} onFlee - Handler for when player tries to flee
 * @param {boolean} disabled - Whether controls should be disabled
 * @param {Array} items - Array of available items
 * @param {Array} playerRoster - Array of player's Pokemon
 * @param {boolean} isPlayerTurn - Whether it's currently the player's turn
 */
const BattleControls = ({
  onAttack,
  onUseItem,
  onChangePokemon,
  onFlee,
  disabled = false,
  items = [],
  playerRoster = [],
  isPlayerTurn = false,
}) => {
  const [activeTab, setActiveTab] = useState("attack");
  const [showItemModal, setShowItemModal] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-3 font-pixel">
      {/* Main battle options menu in classic black/white style */}
      <div className="bg-white border-2 border-[#383030] rounded p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`p-2 rounded ${
              activeTab === "attack"
                ? "bg-[#383030] text-white border-2 border-[#202020]"
                : "bg-[#f0f0f0] border-2 border-[#a0a0a0] hover:bg-[#e8e8e8]"
            }`}
            onClick={() => setActiveTab("attack")}
            disabled={disabled || !isPlayerTurn}
          >
            FIGHT
          </button>
          <button
            className={`p-2 rounded ${
              activeTab === "pokemon"
                ? "bg-[#383030] text-white border-2 border-[#202020]"
                : "bg-[#f0f0f0] border-2 border-[#a0a0a0] hover:bg-[#e8e8e8]"
            }`}
            onClick={() => setActiveTab("pokemon")}
            disabled={disabled || !isPlayerTurn}
          >
            POKéMON
          </button>
          <button
            className={`p-2 rounded ${
              activeTab === "items"
                ? "bg-[#383030] text-white border-2 border-[#202020]"
                : "bg-[#f0f0f0] border-2 border-[#a0a0a0] hover:bg-[#e8e8e8]"
            }`}
            onClick={() => setActiveTab("items")}
            disabled={disabled || !isPlayerTurn}
          >
            ITEM
          </button>
          <button
            className={`p-2 rounded ${
              activeTab === "flee"
                ? "bg-[#383030] text-white border-2 border-[#202020]"
                : "bg-[#f0f0f0] border-2 border-[#a0a0a0] hover:bg-[#e8e8e8]"
            }`}
            onClick={() => setActiveTab("flee")}
            disabled={disabled || !isPlayerTurn}
          >
            RUN
          </button>
        </div>
      </div>

      {/* Dynamic action panel that changes based on selected tab */}
      <div className="bg-white border-2 border-[#383030] rounded p-2 min-h-[120px] flex flex-col">
        {activeTab === "attack" && (
          <div className="flex flex-col h-full justify-center">
            <button
              className={`p-2 rounded-md text-center ${
                disabled || !isPlayerTurn
                  ? "bg-[#a0a0a0] text-[#e0e0e0] border-2 border-[#707070] cursor-not-allowed"
                  : "bg-[#383030] text-white border-2 border-[#202020] hover:brightness-105"
              }`}
              onClick={onAttack}
              disabled={disabled || !isPlayerTurn}
            >
              {playerRoster[0]?.attack?.name || "ATTACK"}
            </button>
            <div className="text-xs mt-2 text-center text-[#707070]">
              {playerRoster[0]?.attack?.type || "normal"} type
            </div>
          </div>
        )}

        {activeTab === "pokemon" && (
          <div className="max-h-[150px] overflow-y-auto grid grid-cols-1 gap-1 text-xs">
            {playerRoster.length > 0 ? (
              playerRoster.map((p) => (
                <button
                  key={p.id}
                  className={`p-1 rounded flex items-center ${
                    p.currentHp <= 0
                      ? "bg-[#d0d0d0] opacity-50 cursor-not-allowed"
                      : "bg-[#f0f0f0] hover:bg-[#e0e0e0] border border-[#a0a0a0]"
                  }`}
                  onClick={() => onChangePokemon(p)}
                  disabled={disabled || p.currentHp <= 0 || !isPlayerTurn}
                >
                  <img
                    src={
                      p.sprites && p.sprites.front_default
                        ? p.sprites.front_default
                        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                            p.id || 132
                          }.png`
                    }
                    alt={p.name}
                    className="w-8 h-8 mr-1 pixelated"
                  />
                  <div className="text-left flex-1 overflow-hidden">
                    <p className="uppercase truncate">{p.name}</p>
                    <div className="flex items-center">
                      <span className="mr-1">HP:</span>
                      <div className="w-12 h-2 bg-[#a0a0a0] rounded-sm overflow-hidden">
                        <div
                          className={`h-full ${
                            (p.currentHp / p.stats.hp) * 100 > 50
                              ? "bg-[#383030]"
                              : (p.currentHp / p.stats.hp) * 100 > 20
                              ? "bg-[#606060]"
                              : "bg-[#909090]"
                          }`}
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, (p.currentHp / p.stats.hp) * 100)
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-1">Lv{p.level}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-[#707070]">
                No Pokémon available
              </div>
            )}
          </div>
        )}

        {activeTab === "items" && (
          <div className="max-h-[150px] overflow-y-auto grid grid-cols-1 gap-1 text-xs">
            {items && items.filter((i) => i?.quantity > 0).length > 0 ? (
              items
                .filter((i) => i?.quantity > 0)
                .map((item) => (
                  <button
                    key={item.id}
                    className={`p-1 rounded flex items-center ${
                      disabled || !isPlayerTurn
                        ? "bg-[#d0d0d0] opacity-50 cursor-not-allowed"
                        : "bg-[#f0f0f0] hover:bg-[#e0e0e0] border border-[#a0a0a0]"
                    }`}
                    onClick={() => onUseItem(item)}
                    disabled={disabled || !isPlayerTurn}
                  >
                    <div className="w-7 h-7 bg-[#f0f0f0] rounded-full flex items-center justify-center mr-2 border border-[#383030]">
                      <span
                        role="img"
                        aria-label={item.effect}
                        className="text-sm"
                      >
                        {item.effect === "heal" ? "💊" : "💫"}
                      </span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="uppercase truncate">{item.name}</p>
                      <p className="text-[10px] text-[#707070]">
                        x{item.quantity}
                      </p>
                    </div>
                  </button>
                ))
            ) : (
              <div className="text-center py-4 text-[#707070]">
                No items available
              </div>
            )}
          </div>
        )}

        {activeTab === "flee" && (
          <div className="flex flex-col h-full justify-center items-center">
            <p className="mb-2 text-xs text-center">
              Run away from this battle?
            </p>
            <button
              className={`p-2 rounded-md text-center ${
                disabled || !isPlayerTurn
                  ? "bg-[#a0a0a0] text-[#e0e0e0] border-2 border-[#707070] cursor-not-allowed"
                  : "bg-[#383030] text-white border-2 border-[#202020] hover:brightness-105"
              }`}
              onClick={onFlee}
              disabled={disabled || !isPlayerTurn}
            >
              RUN AWAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Battle log component - Displays battle messages with auto-scrolling
 * 
 * @param {Array} messages - Array of text messages to display
 */
const BattleLog = ({ messages = [] }) => {
  const logRef = useRef();

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="border-2 border-[#383030] rounded bg-white p-2 relative h-32">
      {/* Dialog arrow indicator in the corner */}
      <div className="absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center">
        <div className="animate-pulse">▼</div>
      </div>
      <div
        className="font-pixel text-xs h-full overflow-y-auto pr-4"
        ref={logRef}
      >
        {messages.map((message, index) => (
          <div key={index} className="py-1 text-black leading-tight">
            {message}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-[#707070] italic">
            The battle is about to begin!
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Renders an attack animation with type-specific styling
 * 
 * @param {string} type - The type of attack (fire, water, etc.)
 * @param {boolean} isActive - Whether the animation should be visible
 * @param {boolean} isEnemy - Whether this is an enemy attack
 */
export const AttackAnimation = ({ type, isActive, isEnemy }) => {
  if (!isActive) return null;

  /**
   * Maps Pokemon attack types to visual styles
   * @returns {string} CSS classes for the attack animation
   */
  const getAttackStyles = () => {
    switch (type?.toLowerCase()) {
      case "fire":
        return "bg-[#F08030] rounded-full";
      case "water":
        return "bg-[#6890F0] rounded-full";
      case "grass":
        return "bg-[#78C850] rounded-lg";
      case "electric":
        return "bg-[#F8D030] zigzag";
      case "psychic":
        return "bg-[#F85888] rounded-full";
      case "ice":
        return "bg-[#98D8D8] rounded-lg";
      case "fighting":
        return "bg-[#C03028] rounded-md";
      case "poison":
        return "bg-[#A040A0] rounded-md";
      case "ground":
        return "bg-[#E0C068] rounded-md";
      case "flying":
        return "bg-[#A890F0] rounded-full";
      case "bug":
        return "bg-[#A8B820] rounded-lg";
      case "rock":
        return "bg-[#B8A038] rounded-md";
      case "ghost":
        return "bg-[#705898] rounded-full";
      case "dragon":
        return "bg-[#7038F8] rounded-lg";
      case "dark":
        return "bg-[#705848] rounded-md";
      case "steel":
        return "bg-[#B8B8D0] rounded-md";
      case "fairy":
        return "bg-[#EE99AC] rounded-full";
      default:
        return "bg-[#A8A878] rounded-md"; // Normal type
    }
  };

  return (
    <motion.div
      className={`attack-animation ${getAttackStyles()} absolute`}
      style={{
        width: "50px",
        height: "50px",
        zIndex: 10,
        boxShadow: "0 0 15px 4px rgba(255, 255, 255, 0.7)",
        bottom: isEnemy ? "25%" : "15%",
        left: isEnemy ? "60%" : "30%", // Attack starts from the attacker's position
      }}
      initial={{
        x: 0,
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        // For player attacks, move rightwards (positive x)
        // For enemy attacks, move leftwards (negative x)
        x: isEnemy ? -200 : 200,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.5, 1.5, 0.5],
      }}
      transition={{
        duration: 0.8,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut",
      }}
    />
  );
};

/**
 * Victory screen component - Displayed when player wins a battle
 * 
 * @param {Object} pokemon - Player's active Pokemon
 * @param {Object} enemy - Defeated enemy Pokemon
 * @param {number} xpGained - Experience points gained
 * @param {number} currencyGained - Currency gained
 * @param {boolean} isBossBattle - Whether this was a boss battle
 * @param {number} currentBattle - Current battle index
 * @param {number} maxBattles - Maximum number of battles
 * @param {Function} onNextBattle - Handler for continuing to next battle
 * @param {Function} onReturn - Handler for returning to map/menu
 */
const VictoryScreen = ({
  pokemon = null,
  enemy = null,
  xpGained = 0,
  currencyGained = 0,
  isBossBattle = false,
  currentBattle = 0,
  maxBattles = 1,
  onNextBattle = () => {},
  onReturn = () => {},
}) => {
  // Safely determine if this is the final battle
  const isFinalBattle = currentBattle >= maxBattles - 1;

  // Safe display values with defaults
  const displayXp = xpGained || 0;
  const displayCurrency = currencyGained || 0;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Black/white styled victory screen */}
        <div className="bg-[#383030] p-4 rounded-xl border-8 border-[#202020] shadow-2xl">
          {/* Screen content */}
          <div className="bg-[#f0f0f0] p-4 rounded-lg border-4 border-[#383030]">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold font-pixel mb-1 text-[#383030]">
                {isFinalBattle ? "ADVENTURE COMPLETE!" : "VICTORY!"}
              </h2>
              <p className="text-sm font-pixel text-[#383030]">
                You defeated {enemy?.name || "the enemy"}!
              </p>
            </div>
            <div className="bg-white rounded-lg border-4 border-[#383030] p-3 mb-4">
              <div className="flex justify-between items-center py-2">
                <span className="font-pixel text-sm text-[#383030]">
                  EXPERIENCE:
                </span>
                <span className="font-pixel text-sm font-bold text-[#383030]">
                  +{displayXp} EXP
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-pixel text-sm text-[#383030]">
                  CURRENCY:
                </span>
                <span className="font-pixel text-sm font-bold text-[#383030]">
                  +{displayCurrency} ¥
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="py-2 px-6 bg-[#383030] text-white font-pixel rounded-md border-4 border-[#202020] hover:bg-[#202020] transition-colors"
                onClick={isFinalBattle ? onReturn : onNextBattle}
              >
                {isFinalBattle ? "COMPLETE" : "CONTINUE"}
              </button>
            </div>
          </div>
          {/* Decorative buttons - GBA style */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-[#202020] rounded-full"></div>
              <div className="w-8 h-8 bg-[#202020] rounded-full"></div>
            </div>
            <div className="w-12 h-4 bg-[#202020] rounded-md"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Defeat screen component - Displayed when player loses a battle
 * 
 * @param {Function} onRetry - Handler for retrying the battle
 * @param {Function} onQuit - Handler for quitting to map/menu
 */
const DefeatScreen = ({ onRetry, onQuit }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Black/white styled defeat screen */}
        <div className="bg-[#383030] p-4 rounded-xl border-8 border-[#202020] shadow-2xl">
          {/* Screen content */}
          <div className="bg-[#f0f0f0] p-4 rounded-lg border-4 border-[#383030]">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold font-pixel mb-1 text-[#383030]">
                DEFEAT!
              </h2>
              <p className="text-sm font-pixel text-[#383030]">
                Your POKéMON fainted!
              </p>
            </div>
            <div className="bg-white rounded-lg border-4 border-[#383030] p-3 mb-4">
              <p className="font-pixel text-sm text-center py-2 text-[#383030]">
                You have no more POKéMON that can fight!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="py-2 px-4 bg-[#383030] text-white font-pixel rounded-md border-4 border-[#202020] hover:bg-[#202020] transition-colors"
                onClick={onRetry}
              >
                RETRY
              </button>
              <button
                className="py-2 px-4 bg-[#606060] text-white font-pixel rounded-md border-4 border-[#383030] hover:bg-[#505050] transition-colors"
                onClick={onQuit}
              >
                QUIT
              </button>
            </div>
          </div>
          {/* Decorative buttons */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-[#202020] rounded-full"></div>
              <div className="w-8 h-8 bg-[#202020] rounded-full"></div>
            </div>
            <div className="w-12 h-4 bg-[#202020] rounded-md"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Choose Pokemon screen component - Interface for selecting a Pokemon from roster
 * 
 * @param {Array} pokemon - Array of available Pokemon
 * @param {Function} onSelect - Handler for when a Pokemon is selected
 * @param {string} adventureTitle - Title of the current adventure/battle
 */
const ChoosePokemonScreen = ({ pokemon = [], onSelect, adventureTitle }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 font-pixel">
        {adventureTitle}: Choose Your Pokémon
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
        {pokemon
          .filter((p) => p.currentHp > 0)
          .map((p) => (
            <button
              key={p.id}
              className="p-4 border-4 border-[#383030] rounded hover:bg-[#f0f0f0] flex items-center bg-white"
              onClick={() => onSelect(p)}
            >
              <img
                src={
                  p.sprites && p.sprites.front_default
                    ? p.sprites.front_default
                    : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
                }
                alt={p.name}
                className="w-16 h-16 mr-4 pixelated"
              />
              <div className="text-left flex-1">
                <p className="text-lg capitalize font-bold font-pixel">
                  {p.name}
                </p>
                <p className="font-pixel">Level: {p.level}</p>
                <div className="mt-1">
                  <div className="flex justify-between text-sm font-pixel">
                    <span>
                      HP: {p.currentHp}/{p.stats.hp}
                    </span>
                    <span>Attack: {p.stats.attack}</span>
                  </div>
                  <div className="flex justify-between text-sm font-pixel">
                    <span>Defense: {p.stats.defense}</span>
                    <span>Speed: {p.stats.speed}</span>
                  </div>
                  <div className="text-sm mt-1 font-pixel">
                    <span className="font-semibold">Move: </span>
                    <span className="capitalize">
                      {p.attack.name} ({p.attack.type} type)
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        {pokemon.filter((p) => p.currentHp > 0).length === 0 && (
          <div className="col-span-2 p-8 text-center bg-[#f0f0f0] rounded border-4 border-[#383030]">
            <p className="text-xl text-[#383030] font-bold font-pixel">
              No available Pokémon!
            </p>
            <p className="mt-2 font-pixel">
              All your Pokémon have fainted. Use Revive items to restore them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Item selection modal component - Interface for selecting and using items
 * 
 * @param {Array} items - Array of available items
 * @param {Function} onUseItem - Handler for using an item on a Pokemon
 * @param {Function} onClose - Handler for closing the modal
 * @param {Array} pokemon - Array of player's Pokemon
 */
const ItemSelectionModal = ({
  items = [],
  onUseItem,
  onClose,
  pokemon = [],
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-lg border-4 border-[#383030] p-6 max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-pixel">Use Item</h3>
          <button
            className="text-[#383030] hover:text-black font-pixel"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {/* Initial item selection screen */}
        {!selectedItem ? (
          <div>
            <p className="mb-4 font-pixel">Select an item to use:</p>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {items
                .filter((i) => i.quantity > 0)
                .map((item) => (
                  <button
                    key={item.id}
                    className="p-2 border-2 border-[#383030] rounded hover:bg-[#f0f0f0] flex items-center"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="w-8 h-8 bg-[#f0f0f0] rounded-full border-2 border-[#383030] flex items-center justify-center mr-2">
                      <span
                        role="img"
                        aria-label={item.effect}
                        className="font-pixel"
                      >
                        {item.effect === "heal" ? "💊" : "💫"}
                      </span>
                    </div>
                    <div className="text-left flex-1 font-pixel">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs">
                        {item.effect === "heal"
                          ? `Restores ${item.amount} HP`
                          : `Revives with ${item.amount * 100}% HP`}
                      </p>
                    </div>
                    <div className="text-sm font-pixel">
                      Qty: {item.quantity}
                    </div>
                  </button>
                ))}
              {items.filter((i) => i.quantity > 0).length === 0 && (
                <p className="text-center text-[#383030] py-4 font-pixel">
                  No items available
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Pokemon selection screen after item is chosen */
          <div>
            <p className="mb-4 font-pixel">
              Select a Pokémon to use {selectedItem.name} on:
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {pokemon.map((p) => (
                <button
                  key={p.id}
                  className={`p-2 border-2 border-[#383030] rounded flex items-center ${
                    (selectedItem.effect === "heal" &&
                      p.currentHp >= p.stats.hp) ||
                    (selectedItem.effect === "revive" && p.currentHp > 0)
                      ? "opacity-50 bg-[#f0f0f0] cursor-not-allowed"
                      : "hover:bg-[#f0f0f0]"
                  }`}
                  onClick={() => {
                    if (
                      (selectedItem.effect === "heal" &&
                        p.currentHp < p.stats.hp) ||
                      (selectedItem.effect === "revive" && p.currentHp <= 0)
                    ) {
                      onUseItem(selectedItem, p);
                    }
                  }}
                  disabled={
                    (selectedItem.effect === "heal" &&
                      p.currentHp >= p.stats.hp) ||
                    (selectedItem.effect === "revive" && p.currentHp > 0)
                  }
                >
                  <img
                    src={
                      p.sprites && p.sprites.front_default
                        ? p.sprites.front_default
                        : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
                    }
                    alt={p.name}
                    className="w-12 h-12 mr-2 pixelated"
                  />
                  <div className="text-left flex-1 font-pixel">
                    <p className="capitalize font-bold">{p.name}</p>
                    <p className="text-xs">
                      Lv.{p.level} - HP: {p.currentHp}/{p.stats.hp}
                    </p>
                    {selectedItem.effect === "heal" &&
                      p.currentHp >= p.stats.hp && (
                        <p className="text-xs text-[#a83030]">
                          HP is already full
                        </p>
                      )}
                    {selectedItem.effect === "revive" && p.currentHp > 0 && (
                      <p className="text-xs text-[#a83030]">
                        Pokémon is not fainted
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              className="mt-4 py-1 px-4 bg-[#383030] text-white rounded text-sm hover:bg-[#202020] transition-colors font-pixel"
              onClick={() => setSelectedItem(null)}
            >
              Back to Items
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Export all components
export {
  BattleControls,
  BattleLog,
  VictoryScreen,
  DefeatScreen,
  ChoosePokemonScreen,
  ItemSelectionModal,
};