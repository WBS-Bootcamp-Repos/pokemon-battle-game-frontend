/**
 * BattleControls Component
 * 
 * Provides the main battle interface for player actions during Pokemon battles.
 * Includes attack functionality with dynamic move generation based on Pokemon type,
 * item usage interface, and Pokemon switching capabilities.
 */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const BattleControls = ({
  playerPokemon,
  enemyPokemon,
  battleState,
  onAttack,
  onUseItem,
  onChangePokemon,
  onFlee,
  isPlayerTurn,
  playerRoster,
  inventory,
}) => {
  // UI state management
  const [showItems, setShowItems] = useState(false);
  const [showPokemon, setShowPokemon] = useState(false);
  const [currentMove, setCurrentMove] = useState(null);

  // Update current move when player Pokemon changes
  useEffect(() => {
    if (playerPokemon) {
      const move = generateTypeBasedMove();
      setCurrentMove(move);
    }
  }, [playerPokemon]);

  // Reset all submenus to return to main battle controls
  const resetMenus = () => {
    setShowItems(false);
    setShowPokemon(false);
  };

  // Check if current Pokémon can fight
  const canFight = playerPokemon && playerPokemon.currentHp > 0;

  /**
   * Generates a type-appropriate move for the current Pokemon
   * Follows fallback logic:
   * 1. Use hardcoded type for known Pokemon
   * 2. Use existing attack if available
   * 3. Use first move from moves array if available
   * 4. Extract type from Pokemon data and generate a move
   * 5. Fallback to normal-type move if all else fails
   */
  const generateTypeBasedMove = () => {
    if (!playerPokemon) return null;

    // Handle special cases for starters and other common Pokémon by name
    if (playerPokemon.name) {
      const name = playerPokemon.name.toLowerCase();

      // Map of known Pokémon names to their types
      const knownTypes = {
        // Grass types
        bulbasaur: "grass",
        ivysaur: "grass",
        venusaur: "grass",
        oddish: "grass",
        gloom: "grass",
        vileplume: "grass",
        bellsprout: "grass",
        weepinbell: "grass",
        victreebel: "grass",
        exeggcute: "grass",
        exeggutor: "grass",
        tangela: "grass",

        // Fire types
        charmander: "fire",
        charmeleon: "fire",
        charizard: "fire",
        vulpix: "fire",
        ninetales: "fire",
        growlithe: "fire",
        arcanine: "fire",
        ponyta: "fire",
        rapidash: "fire",
        magmar: "fire",
        flareon: "fire",
        moltres: "fire",

        // Water types
        squirtle: "water",
        wartortle: "water",
        blastoise: "water",
        psyduck: "water",
        golduck: "water",
        poliwag: "water",
        poliwhirl: "water",
        poliwrath: "water",
        staryu: "water",
        starmie: "water",
        magikarp: "water",
        gyarados: "water",
        lapras: "water",
        vaporeon: "water",

        // Electric types
        pikachu: "electric",
        raichu: "electric",
        magnemite: "electric",
        magneton: "electric",
        voltorb: "electric",
        electrode: "electric",
        electabuzz: "electric",
        jolteon: "electric",
        zapdos: "electric",

        // Psychic types
        abra: "psychic",
        kadabra: "psychic",
        alakazam: "psychic",
        slowpoke: "psychic",
        slowbro: "psychic",
        drowzee: "psychic",
        hypno: "psychic",
        exeggcute: "psychic",
        exeggutor: "psychic",
        starmie: "psychic",
        "mr. mime": "psychic",
        mrmime: "psychic",
        jynx: "psychic",
        mewtwo: "psychic",
        mew: "psychic",

        // Ghost types
        gastly: "ghost",
        haunter: "ghost",
        gengar: "ghost",

        // Ice types
        jynx: "ice",
        articuno: "ice",

        // Dragon types
        dratini: "dragon",
        dragonair: "dragon",
        dragonite: "dragon",

        // Normal types
        pidgey: "normal",
        rattata: "normal",
        eevee: "normal",
        snorlax: "normal",
        ditto: "normal",
      };

      // If we have a known type for this Pokémon, use it
      if (knownTypes[name]) {
        // Signature moves for each type
        const typeToMove = {
          normal: "Tackle",
          fire: "Ember",
          water: "Water Gun",
          grass: "Vine Whip",
          electric: "Thunder Shock",
          poison: "Poison Sting",
          psychic: "Confusion",
          fighting: "Karate Chop",
          rock: "Rock Throw",
          ground: "Sand Attack",
          flying: "Gust",
          ice: "Ice Shard",
          bug: "Bug Bite",
          dragon: "Dragon Rage",
          ghost: "Shadow Ball",
          fairy: "Fairy Wind",
          dark: "Bite",
          steel: "Metal Claw",
        };

        // Get move based on the known type
        const pokemonType = knownTypes[name];
        const attackName = typeToMove[pokemonType] || "Tackle";

        return {
          name: attackName,
          type: pokemonType,
          power: Math.floor(5 + (playerPokemon.level || 1) * 1.5),
        };
      }
    }

    // Special case for Venusaur - ensure it has grass type
    if (playerPokemon.name && playerPokemon.name.toLowerCase() === "venusaur") {
      if (
        typeof playerPokemon.type !== "string" ||
        playerPokemon.type.toLowerCase() !== "grass"
      ) {
        playerPokemon.type = "grass";
      }
    }

    // If the Pokémon already has an attack property with name and type, use it directly
    if (
      playerPokemon.attack &&
      playerPokemon.attack.name &&
      playerPokemon.attack.type
    ) {
      return {
        name: playerPokemon.attack.name,
        type: playerPokemon.attack.type.toLowerCase(),
        power:
          playerPokemon.attack.power ||
          Math.floor(5 + (playerPokemon.level || 1) * 1.5),
      };
    }

    // If Pokémon has moves array, use the first one
    if (playerPokemon.moves && playerPokemon.moves.length > 0) {
      const move = playerPokemon.moves[0];
      return {
        name: move.name,
        type: move.type.toLowerCase(),
        power: move.power || Math.floor(5 + (playerPokemon.level || 1) * 1.5),
      };
    }

    // Extract type from different possible Pokémon object structures as fallback
    let pokemonType = "normal"; // Default fallback type

    // Check different possible locations for type information
    if (typeof playerPokemon.type === "string") {
      pokemonType = playerPokemon.type;
    } else if (playerPokemon.type && playerPokemon.type.name) {
      pokemonType = playerPokemon.type.name;
    } else if (playerPokemon.types && playerPokemon.types.length > 0) {
      if (typeof playerPokemon.types[0] === "string") {
        pokemonType = playerPokemon.types[0];
      } else if (
        playerPokemon.types[0].type &&
        playerPokemon.types[0].type.name
      ) {
        pokemonType = playerPokemon.types[0].type.name;
      } else if (playerPokemon.types[0].name) {
        pokemonType = playerPokemon.types[0].name;
      }
    }

    // Use lowercase for consistency in switch statement
    pokemonType = pokemonType.toLowerCase();

    // Signature moves for each type
    const typeToMove = {
      normal: "Tackle",
      fire: "Ember",
      water: "Water Gun",
      grass: "Vine Whip",
      electric: "Thunder Shock",
      poison: "Poison Sting",
      psychic: "Confusion",
      fighting: "Karate Chop",
      rock: "Rock Throw",
      ground: "Sand Attack",
      flying: "Gust",
      ice: "Ice Shard",
      bug: "Bug Bite",
      dragon: "Dragon Rage",
      ghost: "Shadow Ball",
      fairy: "Fairy Wind",
      dark: "Bite",
      steel: "Metal Claw",
    };

    // Get move based on type, fallback to Tackle if type not found
    const attackName = typeToMove[pokemonType] || "Tackle";

    return {
      name: attackName,
      type: pokemonType,
      power: Math.floor(5 + (playerPokemon.level || 1) * 1.5),
    };
  };

  /**
   * Handles player attack action
   * Generates appropriate move and updates Pokemon's attack property
   */
  const handleAttack = () => {
    // Get the move based on the Pokémon's type
    const move = generateTypeBasedMove();

    // Update the current move state
    setCurrentMove(move);

    // If we successfully generated a move and have a Pokémon
    if (move && playerPokemon) {
      // Update the Pokémon's attack property for future reference
      if (playerPokemon.attack && typeof playerPokemon.attack === "object") {
        playerPokemon.attack.name = move.name;
        playerPokemon.attack.type = move.type;
      } else {
        playerPokemon.attack = {
          name: move.name,
          type: move.type,
          power: move.power,
        };
      }

      // Execute the attack
      onAttack(move);
    } else {
      // Fallback to a normal attack if something went wrong
      onAttack({ name: "Tackle", type: "normal", power: 40 });
    }
  };

  return (
    <div className="bg-[#e0e0e0] border-4 border-[#303030] rounded-lg p-3 shadow-md">
      {/* Main control panel - GBA style */}
      {!showItems && !showPokemon && (
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn || !canFight ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleAttack}
            disabled={!isPlayerTurn || !canFight}
          >
            ATTACK
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setShowItems(true)}
            disabled={!isPlayerTurn}
          >
            ITEM
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setShowPokemon(true)}
            disabled={!isPlayerTurn}
          >
            POKÉMON
          </button>
          <button
            className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner hover:brightness-110 ${
              !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              onFlee();
              resetMenus();
            }}
            disabled={!isPlayerTurn}
          >
            RUN
          </button>
        </div>
      )}

      {/* Items submenu */}
      {showItems && (
        <div className="flex flex-col space-y-2">
          <h3 className="font-pixel text-lg mb-1">Items:</h3>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {inventory && inventory.length > 0 ? (
              inventory
                .filter((item) => item.quantity > 0) // Only show items with quantity > 0
                .map((item, index) => (
                  <button
                    key={index}
                    className={`font-pixel bg-[#383030] text-white py-2 px-4 rounded border-2 border-[#202020] shadow-inner flex justify-between items-center ${
                      !isPlayerTurn ? "opacity-50 cursor-not-allowed" : ""
                    } hover:brightness-110`}
                    onClick={() => {
                      onUseItem(item);
                      resetMenus();
                    }}
                    disabled={!isPlayerTurn || item.battleUsable === false}
                    style={{ borderColor: item.color || "#202020" }}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{item.icon || "🎒"}</span>
                      <div className="flex flex-col items-start">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-300">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs">x{item.quantity}</span>
                      {item.battleUsable === false && (
                        <span className="text-xs text-red-300">
                          Not usable in battle
                        </span>
                      )}
                    </div>
                  </button>
                ))
            ) : (
              <div className="col-span-2 text-center font-pixel text-gray-600 py-2">
                No items available
              </div>
            )}
          </div>
          <button
            className="font-pixel bg-[#606060] text-white py-1 px-4 rounded border-2 border-[#505050] shadow-inner hover:brightness-110 mt-2"
            onClick={resetMenus}
          >
            Back
          </button>
        </div>
      )}

      {/* Pokémon submenu */}
      {showPokemon && (
        <div className="flex flex-col space-y-2">
          <h3 className="font-pixel text-lg mb-1">Pokémon:</h3>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {playerRoster && playerRoster.length > 0 ? (
              playerRoster.map((mon, index) => (
                <button
                  key={index}
                  className={`font-pixel flex justify-between items-center ${
                    mon.id === playerPokemon?.id
                      ? "bg-[#383030] border-[#202020]"
                      : mon.currentHp <= 0
                      ? "bg-[#707070] border-[#606060]"
                      : "bg-[#383030] border-[#202020] hover:brightness-110"
                  } text-white py-2 px-4 rounded border-2 shadow-inner ${
                    !isPlayerTurn ||
                    mon.id === playerPokemon?.id ||
                    mon.currentHp <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (mon.id !== playerPokemon?.id && mon.currentHp > 0) {
                      onChangePokemon(mon);
                      resetMenus();
                    } else if (mon.currentHp <= 0) {
                      toast.error(`${mon.name} is fainted and cannot battle!`);
                    }
                  }}
                  disabled={
                    !isPlayerTurn ||
                    mon.id === playerPokemon?.id ||
                    mon.currentHp <= 0
                  }
                >
                  <div>
                    <span>{mon.name}</span>
                    <span className="text-xs block">Lv{mon.level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs block">
                      HP: {mon.currentHp}/{mon.stats?.hp}
                    </span>
                    {mon.id === playerPokemon?.id && (
                      <span className="text-xs block font-bold">ACTIVE</span>
                    )}
                    {mon.currentHp <= 0 && (
                      <span className="text-xs block font-bold text-red-300">
                        FAINTED
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center font-pixel text-gray-600 py-2">
                No Pokémon available
              </div>
            )}
          </div>
          <button
            className="font-pixel bg-[#606060] text-white py-1 px-4 rounded border-2 border-[#505050] shadow-inner hover:brightness-110 mt-2"
            onClick={resetMenus}
          >
            Back
          </button>
        </div>
      )}

      {/* Pokémon type and move info */}
      {!showItems && !showPokemon && playerPokemon && (
        <div className="mt-3 bg-[#d0d0d0] p-2 rounded-md border-2 border-[#303030]">
          <div className="text-center text-xs font-pixel">
            <div className="font-bold capitalize">
              {playerPokemon.name}'s Move:
            </div>
            <div className="text-[#383030]">
              {currentMove?.name || "Attack"}
              {" ("}
              <span className="capitalize">
                {currentMove?.type || "normal"}
              </span>
              {"-type)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleControls;