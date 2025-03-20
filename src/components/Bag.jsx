/**
 * Bag Component - Pokemon inventory management interface
 * 
 * Displays player's items, allows filtering by category, and handles using items on Pokemon.
 * Integrates with game context for item management, currency, and Pokemon roster.
 */
import React, { useState } from "react";
import { useItems, useCurrency, useRoster } from "../context/context";
import { toast } from "react-toastify";

const Bag = ({ onClose }) => {
  // State management for component
  const { items, useItem: applyItem } = useItems();
  const { currency } = useCurrency();
  const { rosterPokemon } = useRoster();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPokemonSelect, setShowPokemonSelect] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Extract all unique categories from items
  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "misc")),
  ];

  // Filter items by category
  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  /**
   * Generates descriptive text for items based on their effect type
   * @param {Object} item - The item object to describe
   * @return {string} Human-readable description of the item's effect
   */
  const getItemDescription = (item) => {
    if (item.description) return item.description;

    switch (item.effect) {
      case "heal":
        return `Restores ${item.amount} HP to a Pokémon`;
      case "fullheal":
        return "Fully restores HP to a Pokémon";
      case "revive":
        return `Revives a fainted Pokémon with ${item.amount * 100}% HP`;
      case "status":
        return `Cures ${item.statusEffect} status`;
      case "boost":
        return `Raises ${item.stat} by ${item.amount * 100}% for the battle`;
      case "levelup":
        return `Raises a Pokémon's level by ${item.amount}`;
      default:
        return "A useful item";
    }
  };

  /**
   * Handles item usage request and determines if Pokemon selection is needed
   * @param {Object} item - The item to be used
   */
  const handleUseItem = (item) => {
    if (item.quantity <= 0) {
      toast.error(`You don't have any ${item.name} left!`);
      return;
    }

    // Check if this is an item that can be used from the bag
    if (item.effect === "levelup" || item.effect === "revive") {
      setSelectedItem(item);
      setShowPokemonSelect(true);
    } else if (!item.battleUsable) {
      toast.info(`${item.name} cannot be used here.`);
    } else {
      toast.info(`${item.name} can only be used in battle.`);
    }
  };

  /**
   * Applies the selected item to the chosen Pokemon
   * @param {string|number} pokemonId - ID of the Pokemon to apply the item to
   */
  const applyItemToPokemon = (pokemonId) => {
    if (!selectedItem) return;

    const result = applyItem(selectedItem.id, pokemonId);

    if (result && result.success) {
      toast.success(result.message);
      setShowPokemonSelect(false);
      setSelectedItem(null);
    } else if (result && !result.success) {
      toast.error(result.message || `Couldn't use ${selectedItem.name}`);
    } else {
      toast.error(`Failed to use ${selectedItem.name}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Header section with title and close button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-pixel">YOUR BAG</h2>
        <div className="flex items-center">
          <span className="font-pixel text-sm text-amber-600">
            {currency} ¥
          </span>
          <button
            onClick={onClose}
            className="ml-4 bg-black hover:bg-gray-800 text-white font-pixel py-1 px-3 rounded-md text-sm"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Category filter buttons */}
      <div className="flex justify-center mb-4 gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`font-pixel text-xs px-3 py-1 rounded-md ${
              selectedCategory === category
                ? "bg-black text-white border border-black"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Item list with scrollable container */}
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between ${
                item.quantity <= 0 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center">
                {/* Item icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 border"
                  style={{
                    backgroundColor: item.color || "#f8d0a0",
                    borderColor: item.color ? `${item.color}99` : "#c09060",
                  }}
                >
                  <span role="img" aria-label={item.effect} className="text-xl">
                    {item.icon || (item.effect === "heal" ? "💊" : "💫")}
                  </span>
                </div>
                {/* Item details */}
                <div>
                  <h4 className="font-pixel text-sm text-gray-800">
                    {item.name}
                  </h4>
                  <p className="font-pixel text-xs text-gray-600">
                    {getItemDescription(item)}
                  </p>
                  {!item.battleUsable && (
                    <p className="font-pixel text-xs text-amber-600">
                      ⓘ Not usable in battle
                    </p>
                  )}
                </div>
              </div>
              {/* Item quantity and use button */}
              <div className="flex flex-col items-end">
                <span className="font-pixel text-sm font-bold mb-2">
                  x{item.quantity}
                </span>
                {(item.effect === "levelup" || item.effect === "revive") &&
                  item.quantity > 0 && (
                    <button
                      onClick={() => handleUseItem(item)}
                      className="font-pixel text-xs px-3 py-1 rounded-md bg-black text-white hover:bg-gray-800"
                    >
                      USE
                    </button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center font-pixel py-4 text-gray-500">
            No items in this category
          </div>
        )}
      </div>

      {/* Pokemon selection modal - shown when using items that target Pokemon */}
      {showPokemonSelect && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-lg font-bold font-pixel mb-3">
              Select Pokémon to use {selectedItem.name} on:
            </h3>

            <div className="max-h-[60vh] overflow-y-auto">
              {rosterPokemon && rosterPokemon.length > 0 ? (
                <div className="grid gap-2">
                  {rosterPokemon.map((pokemon) => (
                    <button
                      key={pokemon.id}
                      onClick={() => applyItemToPokemon(pokemon.id)}
                      className={`flex items-center justify-between p-2 border rounded-md 
                        ${
                          (selectedItem.effect === "revive" &&
                            pokemon.currentHp > 0) ||
                          (selectedItem.effect !== "revive" &&
                            pokemon.currentHp <= 0)
                            ? "opacity-50 cursor-not-allowed bg-gray-100"
                            : "hover:bg-gray-100"
                        }`}
                      disabled={
                        (selectedItem.effect === "revive" &&
                          pokemon.currentHp > 0) ||
                        (selectedItem.effect !== "revive" &&
                          pokemon.currentHp <= 0)
                      }
                    >
                      <div className="flex items-center">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                            pokemon.id.toString().includes("-")
                              ? pokemon.id.split("-")[0]
                              : pokemon.id
                          }.png`}
                          alt={pokemon.name}
                          className="w-12 h-12 mr-2 pixelated"
                          onError={(e) => {
                            e.target.src =
                              "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                          }}
                        />
                        <div>
                          <h4 className="font-pixel text-sm">{pokemon.name}</h4>
                          <p className="font-pixel text-xs">
                            Lv. {pokemon.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-pixel text-xs">
                          HP: {pokemon.currentHp}/{pokemon.stats?.hp}
                        </p>
                        {pokemon.currentHp <= 0 && (
                          <span className="font-pixel text-xs text-red-500">
                            Fainted
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center font-pixel py-4 text-gray-500">
                  No Pokémon in your roster!
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowPokemonSelect(false);
                  setSelectedItem(null);
                }}
                className="font-pixel text-sm px-3 py-1 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bag;