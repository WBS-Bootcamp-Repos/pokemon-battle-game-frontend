/**
 * Item Animation Component
 *
 * Displays animated effects when items are used in battle.
 * Creates different animations based on item type (heal, boost, revive).
 */
import React from "react";
import { motion } from "framer-motion";

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

export default ItemAnimation;
