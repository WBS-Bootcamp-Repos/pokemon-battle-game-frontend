/**
 * Battle Results Components
 *
 * Contains the victory and defeat screens shown at the end of a battle.
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRoster, useItems } from "../../context/context";
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
 * @param {string} adventureType - The type of adventure
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
  adventureType = "random",
  onNextBattle = () => {},
  onReturn = () => {},
}) => {
  const { updatePokemonStats, updateCurrency } = useRoster();
  const { updateItemQuantity } = useItems();
  const [rewardsApplied, setRewardsApplied] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [showAdventureComplete, setShowAdventureComplete] = useState(false);
  const [adventureRewards, setAdventureRewards] = useState([]);

  // Safely determine if this is the final battle
  const isFinalBattle = currentBattle >= maxBattles - 1;

  // Safe display values with defaults
  const displayXp = xpGained || 0;
  const displayCurrency = currencyGained || 0;

  // Generate adventure completion rewards based on adventure type
  const generateAdventureRewards = () => {
    if (!isFinalBattle || !isBossBattle) return [];

    const baseRewards = [];

    // Add XP Bonus
    const xpBonus = Math.floor(displayXp * 0.5); // 50% bonus XP
    baseRewards.push({
      type: "xp",
      name: "Bonus XP",
      amount: xpBonus,
      icon: "✨",
    });

    // Add Currency Bonus
    const currencyBonus = Math.floor(displayCurrency * 0.3); // 30% bonus currency
    baseRewards.push({
      type: "currency",
      name: "Bonus Currency",
      amount: currencyBonus,
      icon: "💰",
    });

    // Add Items based on adventure difficulty
    switch (adventureType) {
      case "random":
        // Beginner adventure - basic healing
        baseRewards.push({
          type: "item",
          id: "potion",
          name: "Potion",
          amount: 2,
          icon: "🧪",
        });
        break;
      case "plant":
        // Easy adventure - better healing
        baseRewards.push({
          type: "item",
          id: "super-potion",
          name: "Super Potion",
          amount: 1,
          icon: "🧴",
        });
        baseRewards.push({
          type: "item",
          id: "potion",
          name: "Potion",
          amount: 1,
          icon: "🧪",
        });
        break;
      case "psychic-ghost":
        // Medium adventure - revival and healing
        baseRewards.push({
          type: "item",
          id: "super-potion",
          name: "Super Potion",
          amount: 1,
          icon: "🧴",
        });
        baseRewards.push({
          type: "item",
          id: "revive",
          name: "Revive",
          amount: 1,
          icon: "⭐",
        });
        break;
      case "legendary":
        // Hard adventure - best rewards
        baseRewards.push({
          type: "item",
          id: "hyper-potion",
          name: "Hyper Potion",
          amount: 1,
          icon: "🧫",
        });
        baseRewards.push({
          type: "item",
          id: "revive",
          name: "Revive",
          amount: 1,
          icon: "⭐",
        });
        // Small chance for rare candy
        if (Math.random() < 0.3) {
          baseRewards.push({
            type: "item",
            id: "rare-candy",
            name: "Rare Candy",
            amount: 1,
            icon: "🍬",
          });
        }
        break;
      case "cave":
        // Cave adventure - rock-type related
        baseRewards.push({
          type: "item",
          id: "super-potion",
          name: "Super Potion",
          amount: 1,
          icon: "🧴",
        });
        baseRewards.push({
          type: "item",
          id: "x-defense",
          name: "X Defense",
          amount: 1,
          icon: "🛡️",
        });
        break;
      case "safari":
        // Safari adventure - variety of items
        baseRewards.push({
          type: "item",
          id: "super-potion",
          name: "Super Potion",
          amount: 1,
          icon: "🧴",
        });
        baseRewards.push({
          type: "item",
          id: "x-attack",
          name: "X Attack",
          amount: 1,
          icon: "⚔️",
        });
        baseRewards.push({
          type: "item",
          id: "revive",
          name: "Revive",
          amount: 1,
          icon: "⭐",
        });
        break;
      default:
        // Default case
        baseRewards.push({
          type: "item",
          id: "potion",
          name: "Potion",
          amount: 1,
          icon: "🧪",
        });
    }

    return baseRewards;
  };

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

      // Generate adventure completion rewards if final battle
      if (isFinalBattle && isBossBattle) {
        const rewards = generateAdventureRewards();
        setAdventureRewards(rewards);

        // Apply additional rewards
        rewards.forEach((reward) => {
          if (reward.type === "xp" && pokemon) {
            // Apply bonus XP
            const bonusXp = reward.amount;
            const updatedWithBonus = {
              ...updatedPokemon,
              xp: updatedPokemon.xp + bonusXp,
            };

            // Check for another level up from bonus XP
            const xpNeededForNextLevel = updatedWithBonus.level * 100;
            if (updatedWithBonus.xp >= xpNeededForNextLevel) {
              updatedWithBonus.level = updatedWithBonus.level + 1;
              updatedWithBonus.xp = updatedWithBonus.xp - xpNeededForNextLevel;

              // Increase stats again
              updatedWithBonus.stats = {
                ...updatedWithBonus.stats,
                hp: Math.floor(updatedWithBonus.stats.hp * 1.1),
                attack: Math.floor(updatedWithBonus.stats.attack * 1.1),
                defense: Math.floor(updatedWithBonus.stats.defense * 1.1),
                speed: Math.floor(updatedWithBonus.stats.speed * 1.1),
              };

              updatedWithBonus.currentHp = updatedWithBonus.stats.hp;

              toast.success(
                `${updatedWithBonus.name} leveled up to ${updatedWithBonus.level}!`
              );
            }

            updatePokemonStats(pokemon.id, updatedWithBonus);
          } else if (reward.type === "currency") {
            // Apply bonus currency
            updateCurrency(reward.amount);
          } else if (reward.type === "item" && reward.id) {
            // Add item to inventory
            updateItemQuantity(reward.id, reward.amount);
          }
        });

        setShowAdventureComplete(true);
      }

      setRewardsApplied(true);
    }
  }, [
    pokemon,
    enemy,
    displayXp,
    displayCurrency,
    updatePokemonStats,
    updateCurrency,
    updateItemQuantity,
    rewardsApplied,
    isFinalBattle,
    isBossBattle,
    adventureType,
  ]);

  // Handle continue button
  const handleContinue = () => {
    if (showAdventureComplete) {
      setShowAdventureComplete(false);
      setTimeout(() => onReturn(), 300);
    } else if (isFinalBattle) {
      onReturn();
    } else {
      onNextBattle();
    }
  };

  // Adventure completion modal
  if (showAdventureComplete) {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20"
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
          <div className="bg-[#383030] p-4 rounded-xl border-8 border-[#202020] shadow-2xl">
            <div className="bg-[#f0f0f0] p-4 rounded-lg border-4 border-[#383030]">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold font-pixel mb-1 text-[#383030]">
                  ADVENTURE COMPLETE!
                </h2>
                <p className="text-sm font-pixel text-[#383030]">
                  You defeated the {adventureType.toUpperCase()} adventure!
                </p>
              </div>

              <div className="bg-white rounded-lg border-4 border-[#383030] p-3 mb-4">
                <h3 className="text-center font-pixel text-md text-[#383030] mb-2">
                  BONUS REWARDS
                </h3>

                {adventureRewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200"
                  >
                    <span className="font-pixel text-sm text-[#383030] flex items-center">
                      <span className="mr-2 text-lg">{reward.icon}</span>
                      {reward.name}
                    </span>
                    <span className="font-pixel text-sm font-bold text-[#383030]">
                      {reward.type === "currency"
                        ? `${reward.amount} ¥`
                        : reward.type === "xp"
                        ? `${reward.amount} XP`
                        : `x${reward.amount}`}
                    </span>
                  </div>
                ))}

                <div className="mt-3 bg-yellow-100 rounded-lg p-2 text-center">
                  <p className="font-pixel text-xs text-[#383030]">
                    These items have been added to your inventory!
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="py-2 px-6 bg-[#383030] text-white font-pixel rounded-md border-4 border-[#202020] hover:bg-[#202020] transition-colors"
                  onClick={handleContinue}
                >
                  AWESOME!
                </button>
              </div>
            </div>

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
  }

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
                {isFinalBattle ? "BOSS DEFEATED!" : "VICTORY!"}
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
