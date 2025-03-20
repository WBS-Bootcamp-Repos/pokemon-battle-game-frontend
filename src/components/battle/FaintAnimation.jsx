/**
 * Faint Animation Component
 *
 * Displays an "X" animation when a Pokémon faints in battle.
 * Positioned differently based on whether it's an enemy or player Pokémon.
 */
import React from "react";
import { motion } from "framer-motion";

/**
 * Animation for when a Pokemon faints
 *
 * @param {boolean} isEnemy - Whether this is for the enemy Pokemon
 */
const FaintAnimation = ({ isEnemy }) => {
  return (
    <motion.div
      className={`absolute ${
        isEnemy ? "right-20 top-20" : "left-20 bottom-28"
      } z-30 flex items-center justify-center`}
      style={{
        background: "transparent",
        width: "60px",
        height: "60px",
      }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0.8],
        y: [-10, 0, 5, 10],
        scale: [0.5, 1.2, 1, 0.9],
      }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <span
        style={{
          fontSize: "48px",
          color: "#FF4040",
          fontWeight: "bold",
          textShadow:
            "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          transform: "rotate(5deg)",
          userSelect: "none",
        }}
      >
        ✗
      </span>
    </motion.div>
  );
};

export default FaintAnimation;
