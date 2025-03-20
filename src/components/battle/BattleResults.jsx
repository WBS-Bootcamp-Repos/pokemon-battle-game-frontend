/**
 * Battle Results Components
 *
 * Contains the victory and defeat screens shown at the end of a battle.
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRoster } from "../../context/context";
import { toast } from "react-toastify";

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
export const VictoryScreen = ({
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
  const { updatePokemonStats, updateCurrency } = useRoster();
  const [rewardsApplied, setRewardsApplied] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);

  // Safely determine if this is the final battle
  const isFinalBattle = currentBattle >= maxBattles - 1;

  // Safe display values with defaults
  const displayXp = xpGained || 0;
  const displayCurrency = currencyGained || 0;

  // Apply rewards when the component mounts
  useEffect(() => {
    if (!rewardsApplied && pokemon && enemy) {
      // Update Pokemon XP
      const updatedPokemon = {
        ...pokemon,
        xp: (pokemon.xp || 0) + displayXp,
      };

      // Check for level up
      const xpNeeded = updatedPokemon.level * 100;
      if (updatedPokemon.xp >= xpNeeded) {
        // Level up!
        updatedPokemon.level = updatedPokemon.level + 1;
        updatedPokemon.xp = updatedPokemon.xp - xpNeeded;
        setLeveledUp(true);

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

        toast.success(
          `${updatedPokemon.name} leveled up to ${updatedPokemon.level}!`
        );
      }

      // Update Pokemon in roster
      updatePokemonStats(pokemon.id, updatedPokemon);

      // Update player currency
      updateCurrency(displayCurrency);

      setRewardsApplied(true);
    }
  }, [
    pokemon,
    enemy,
    displayXp,
    displayCurrency,
    updatePokemonStats,
    updateCurrency,
    rewardsApplied,
  ]);

  // Handle continue button
  const handleContinue = () => {
    if (isFinalBattle) {
      onReturn();
    } else {
      onNextBattle();
    }
  };

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
              {leveledUp && (
                <div className="flex justify-between items-center py-2 bg-yellow-100 rounded px-2 mt-2">
                  <span className="font-pixel text-sm text-[#383030]">
                    LEVEL UP!
                  </span>
                  <span className="font-pixel text-sm font-bold text-[#383030]">
                    Lv.{pokemon?.level + 1}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                className="py-2 px-6 bg-[#383030] text-white font-pixel rounded-md border-4 border-[#202020] hover:bg-[#202020] transition-colors"
                onClick={handleContinue}
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
export const DefeatScreen = ({ onRetry, onQuit }) => {
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
