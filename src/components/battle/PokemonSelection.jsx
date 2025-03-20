/**
 * Pokémon Selection Components
 *
 * Contains components related to selecting Pokémon and using items during battles.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Choose Pokemon screen component - Interface for selecting a Pokemon from roster
 *
 * @param {Array} pokemon - Array of available Pokemon
 * @param {Function} onSelect - Handler for when a Pokemon is selected
 * @param {string} adventureTitle - Title of the current adventure/battle
 */
export const ChoosePokemonScreen = ({
  pokemon = [],
  onSelect,
  adventureTitle,
}) => {
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
export const ItemSelectionModal = ({
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
