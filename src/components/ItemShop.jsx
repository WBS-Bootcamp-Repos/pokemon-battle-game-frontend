/**
 * ItemShop Component
 * 
 * A Pokemon mart interface that allows players to browse and purchase items.
 * Features category filtering, item descriptions, and purchase confirmation.
 * Integrates with game context for item and currency management.
 */
import React, { useState } from "react";
import { useItems, useCurrency } from "../context/context";
import { toast } from "react-toastify";

const ItemShop = () => {
  // Access item and currency data/functions from context
  const { items, buyItem } = useItems();
  const { currency, updateCurrency } = useCurrency();
  
  // Local state management
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract unique categories from available items for filtering
  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "misc")),
  ];

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  /**
   * Attempts to purchase an item if player has sufficient funds
   * @param {string|number} itemId - ID of the item to purchase
   */
  const handleBuyItem = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (currency < item.price) {
      toast.error(`Not enough money! You need ${item.price} ¥`);
      return;
    }

    const success = buyItem(itemId);
    if (success) {
      toast.success(`Purchased ${item.name}!`);
    } else {
      toast.error("Failed to purchase item");
    }
  };

  /**
   * Generates a human-readable description for an item based on its effect
   * @param {Object} item - The item object
   * @returns {string} Description of the item's effect
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

  return (
    <div className="mb-4">
      {/* Shop toggle button with currency display */}
      <button
        id="itemShopButton"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black hover:bg-gray-800 text-white font-pixel py-2 px-4 rounded-md text-sm flex items-center justify-center"
      >
        <span className="mr-2"></span>
        {isOpen ? "CLOSE SHOP" : "OPEN POKéMART"}
        <span className="ml-4 bg-gray-700 text-white px-2 py-1 rounded-md text-xs">
          {currency} ¥
        </span>
      </button>

      {/* Shop content - only rendered when shop is open */}
      {isOpen && (
        <div className="mt-4">
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

          {/* Item listing grid */}
          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between"
              >
                {/* Item details section */}
                <div className="flex items-center">
                  {/* Item icon with colored background */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 border"
                    style={{
                      backgroundColor: item.color || "#f8d0a0",
                      borderColor: item.color ? `${item.color}99` : "#c09060",
                    }}
                  >
                    <span
                      role="img"
                      aria-label={item.effect}
                      className="text-xl"
                    >
                      {item.icon || (item.effect === "heal" ? "💊" : "💫")}
                    </span>
                  </div>
                  
                  {/* Item information */}
                  <div>
                    <h4 className="font-pixel text-sm text-gray-800">
                      {item.name}
                    </h4>
                    <p className="font-pixel text-xs text-gray-600">
                      {getItemDescription(item)}
                    </p>
                    <p className="font-pixel text-xs text-gray-600">
                      You own: {item.quantity}
                    </p>
                    {!item.battleUsable && (
                      <p className="font-pixel text-xs text-amber-600">
                        ⓘ Not usable in battle
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Price and purchase button */}
                <div className="flex items-center">
                  <span className="font-pixel text-sm text-amber-600 mr-3">
                    {item.price} ¥
                  </span>
                  <button
                    onClick={() => handleBuyItem(item.id)}
                    disabled={currency < item.price}
                    className={`font-pixel text-xs px-3 py-1 rounded-md ${
                      currency >= item.price
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    BUY
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemShop;