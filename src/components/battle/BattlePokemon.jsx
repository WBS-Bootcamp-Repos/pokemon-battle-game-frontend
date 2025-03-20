/**
 * Battle Pokemon Component
 *
 * Renders a Pokemon in the battle scene with appropriate animations for
 * idle bouncing, attacking, being hit, and fainting.
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProperSprite } from "../../utils/spriteUtils";

/**
 * Renders a Pokémon in the battle scene with animations
 *
 * @param {Object} pokemon - Pokemon data object
 * @param {boolean} isEnemy - Whether this is an enemy Pokemon (true) or player Pokemon (false)
 * @param {boolean} animateAttack - Whether the Pokemon is currently attacking
 * @param {boolean} isHit - Whether the Pokemon is currently being hit
 */
const BattlePokemon = ({ pokemon, isEnemy, animateAttack, isHit }) => {
  const [spriteError, setSpriteError] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);

  // Handle case when no pokemon is provided
  if (!pokemon) return null;

  // Calculate if the Pokemon has fainted
  const hasFainted = pokemon.currentHp <= 0;

  // Show hit effect when isHit prop changes to true
  useEffect(() => {
    if (isHit && !hasFainted) {
      // Small delay to sync with attack animation arrival
      const timer = setTimeout(() => {
        setShowHitEffect(true);

        // Clear hit effect after animation completes
        const clearTimer = setTimeout(() => {
          setShowHitEffect(false);
        }, 500);

        return () => clearTimeout(clearTimer);
      }, 400); // Delay to sync with attack animation arrival at target

      return () => clearTimeout(timer);
    }
  }, [isHit, hasFainted]);

  // Use getProperSprite to get the correct view (front for enemy, back for player)
  const spriteUrl = getProperSprite(pokemon, isEnemy);

  return (
    <motion.div
      className={`relative ${isEnemy ? "enemy-pokemon" : "player-pokemon"}`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: hasFainted ? [1, 0.7, 0.3] : 1,
        x:
          isHit && !hasFainted
            ? [0, isEnemy ? -8 : 8, 0, isEnemy ? -5 : 5, 0]
            : 0,
        y: hasFainted
          ? 30
          : isHit && !hasFainted
          ? [0, -3, 0, -2, 0]
          : [0, isEnemy ? -5 : 5, 0],
        rotate: hasFainted
          ? isEnemy
            ? -90
            : 90
          : isHit && !hasFainted
          ? [0, isEnemy ? -3 : 3, 0, isEnemy ? -2 : 2, 0]
          : 0,
      }}
      transition={{
        opacity: hasFainted
          ? { duration: 1.5, times: [0, 0.5, 1] }
          : { duration: 0.5 },
        x:
          isHit && !hasFainted
            ? { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }
            : {},
        y: hasFainted
          ? { duration: 0.5, ease: "easeIn" }
          : isHit && !hasFainted
          ? { duration: 0.5, times: [0, 0.3, 0.5, 0.7, 1] }
          : { repeat: Infinity, duration: 2, ease: "easeInOut" }, // Continuous bounce
        rotate: hasFainted
          ? { duration: 0.5 }
          : isHit && !hasFainted
          ? { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }
          : {},
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
          filter: hasFainted
            ? "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2)) contrast(0.8) brightness(0.7) grayscale(0.5)"
            : "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3)) contrast(1.1) brightness(1.1)",
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

      {/* Hit effect overlay - flashes when hit by attack */}
      {showHitEffect && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.7, 0, 0.5, 0],
            backgroundColor: [
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 0)",
              "rgba(255, 255, 255, 0.5)",
              "rgba(255, 255, 255, 0)",
            ],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            times: [0, 0.3, 0.6, 1],
          }}
        />
      )}
    </motion.div>
  );
};

export default BattlePokemon;
