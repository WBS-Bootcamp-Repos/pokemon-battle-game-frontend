/**
 * Attack Animation Component
 *
 * Renders type-specific attack animations and impact effects for Pokémon battles.
 * Handles projectile movement from attacker to target with appropriate visual effects.
 */
import React from "react";
import { motion } from "framer-motion";
import { getPokemonType } from "../../utils/pokemonTypeUtils";

/**
 * Gets the color for a Pokemon type
 * @param {string} type - The Pokemon type
 * @returns {string} CSS color for the type
 */
const getTypeColor = (type) => {
  type = type.toLowerCase();

  const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  };

  return typeColors[type] || "#A8A878"; // Default to normal type
};

/**
 * Displays an attack animation based on Pokemon type
 * @param {string} type - The Pokemon type for the attack
 * @param {boolean} isActive - Whether the animation should be active
 * @param {boolean} isEnemy - Whether this is from an enemy Pokemon
 */
const AttackAnimation = ({ isActive, isEnemy, type = "normal" }) => {
  if (!isActive) return null;

  // Get type-specific color
  const typeColor = getTypeColor(type);

  // Calculate a lighter version of the type color for the glow effect
  const glowColor = typeColor.replace(
    /rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/,
    (match, r, g, b) =>
      `rgba(${Math.min(255, parseInt(r) + 40)}, ${Math.min(
        255,
        parseInt(g) + 40
      )}, ${Math.min(255, parseInt(b) + 40)}, 0.7)`
  );

  // Improved animation positioning based on updated Pokemon positions
  const startPosition = isEnemy
    ? {
        left: "65%", // Enemy position (right side)
        top: "40%", // Adjusted lower to match Pokemon's center
      }
    : {
        left: "25%", // Player position (left side)
        top: "52%", // Adjusted lower to match Pokemon's center
      };

  // Target positions adjusted to precisely hit opponent
  const endPosition = isEnemy
    ? {
        left: "25%", // Target player pokemon position
        top: "52%", // Adjusted to match target center
      }
    : {
        left: "65%", // Target enemy pokemon position
        top: "40%", // Adjusted to match target center
      };

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: startPosition.left,
        top: startPosition.top,
        zIndex: 10, // Ensure it's above Pokemon
        height: "12px",
        width: "12px",
        filter: "blur(2px)",
        backgroundColor: typeColor,
        boxShadow: `0 0 15px 8px ${glowColor}`,
      }}
      animate={{
        ...endPosition,
        scale: [1, 1.5, 2, 0.5],
        boxShadow: [
          `0 0 15px 8px ${glowColor}`,
          `0 0 20px 12px ${glowColor}`,
          `0 0 25px 15px ${glowColor}`,
          `0 0 5px 3px rgba(255, 255, 255, 0)`,
        ],
        opacity: [0.8, 1, 0.9, 0],
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        times: [0, 0.3, 0.7, 1],
      }}
    />
  );
};

export default AttackAnimation;
