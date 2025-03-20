/**
 * Battle Page Component
 *
 * Manages the Pokemon battle system, including starter selection,
 * battle flow, turn management, and adventure progression.
 * Uses BattleContext for state management and integrates with
 * the adventure system for multi-battle sequences.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useBattle } from "../context/BattleContext";
import { useRoster } from "../context/context";
import BattleScene from "../components/BattleScene";
import BattleControls from "../components/BattleControls";
import BattleLog from "../components/BattleLog";
import { BATTLE_STATES } from "../context/BattleReducer";
import { getPokemonSpriteUrl, getPokemonId } from "../utils/spriteUtils";
import { getPokemonType } from "../utils/pokemonTypeUtils";
import {
  VictoryScreen,
  DefeatScreen,
} from "../components/battle/BattleResults";
import { ChoosePokemonScreen } from "../components/battle/PokemonSelection";

/**
 * Gets the CSS class for styling a Pokemon type badge
 * @param {Object} pokemon - The Pokemon object
 * @returns {string} CSS class for the type badge
 */
const getTypeColor = (pokemon) => {
  const type = getPokemonType(pokemon).toLowerCase();

  const typeColors = {
    normal: "bg-[#A8A878] text-white",
    fire: "bg-[#F08030] text-white",
    water: "bg-[#6890F0] text-white",
    grass: "bg-[#78C850] text-white",
    electric: "bg-[#F8D030] text-[#705848]",
    ice: "bg-[#98D8D8] text-[#705848]",
    fighting: "bg-[#C03028] text-white",
    poison: "bg-[#A040A0] text-white",
    ground: "bg-[#E0C068] text-[#705848]",
    flying: "bg-[#A890F0] text-white",
    psychic: "bg-[#F85888] text-white",
    bug: "bg-[#A8B820] text-white",
    rock: "bg-[#B8A038] text-white",
    ghost: "bg-[#705898] text-white",
    dragon: "bg-[#7038F8] text-white",
    dark: "bg-[#705848] text-white",
    steel: "bg-[#B8B8D0] text-[#705848]",
    fairy: "bg-[#EE99AC] text-[#705848]",
  };

  return typeColors[type] || "bg-[#A8A878] text-white"; // Default to normal type
};

/**
 * Battle Component - Main battle interface for Pokémon battles
 * Handles battle initialization, flow control, and adventure integration
 */
const Battle = () => {
  const navigate = useNavigate();
  const { rosterPokemon = [], items = [] } = useRoster() || {};
  const [showRoster, setShowRoster] = useState(false);

  // Get battle state and functions from context
  const {
    enemy,
    playerPokemon,
    playerRoster,
    battleState,
    battleLog,
    isPlayerTurn,
    isAttacking,
    activeItem,
    startBattle,
    selectPokemon,
    attack,
    useItem,
    changePokemon,
    flee,
    endBattle,
  } = useBattle();

  // Get adventure progress from URL and session storage
  const getAdventureProgress = () => {
    const path = window.location.pathname;
    const adventureIdMatch = path.match(/\/battle\/(.+)/);
    const adventureId = adventureIdMatch ? adventureIdMatch[1] : null;

    if (adventureId) {
      const adventureData = JSON.parse(
        sessionStorage.getItem(`adventure-${adventureId}`)
      );

      if (adventureData) {
        return {
          currentBattle: adventureData.currentBattle,
          maxBattles: adventureData.battles.length,
        };
      }
    }

    // Default for standalone battles
    return { currentBattle: 0, maxBattles: 1 };
  };

  // Get battle status
  const isBattleActive = battleState !== BATTLE_STATES.IDLE;

  // Check for victory or defeat
  const isVictory = battleState === BATTLE_STATES.VICTORY;
  const isDefeat = battleState === BATTLE_STATES.DEFEAT;

  // Reward calculation based on enemy level and type
  const calculateRewards = () => {
    if (!enemy) return { xp: 0, currency: 0 };

    // Base rewards scaled by enemy level
    const baseXp = enemy.level * 10;
    const baseCurrency = enemy.level * 5;

    // Bonus for boss battles
    const bossMultiplier = enemy.isBoss ? 2 : 1;

    return {
      xp: Math.floor(baseXp * bossMultiplier),
      currency: Math.floor(baseCurrency * bossMultiplier),
    };
  };

  const { xp: xpGained, currency: currencyGained } = calculateRewards();

  // Handle victory continuation
  const handleNextBattle = () => {
    // Get adventure data from URL
    const path = window.location.pathname;
    const adventureIdMatch = path.match(/\/battle\/(.+)/);
    const adventureId = adventureIdMatch ? adventureIdMatch[1] : null;

    if (adventureId) {
      // Update adventure progress in session storage
      const adventureData = JSON.parse(
        sessionStorage.getItem(`adventure-${adventureId}`)
      );

      if (adventureData) {
        // Increment current battle and save
        adventureData.currentBattle += 1;
        sessionStorage.setItem(
          `adventure-${adventureId}`,
          JSON.stringify(adventureData)
        );

        // Refresh the page to load the next battle
        window.location.reload();
      }
    } else {
      // For standalone battles, just end the battle
      endBattle();
      navigate("/");
    }
  };

  // Handle returning to map after battle
  const handleReturnToMap = () => {
    endBattle();
    navigate("/");
  };

  // Handle retrying a battle after defeat
  const handleRetryBattle = () => {
    // Reset battle state and try again
    window.location.reload();
  };

  /**
   * Initialize battle from URL parameters or adventure data
   * Handles both standalone battles and adventure sequences
   */
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const enemyId = queryParams.get("enemyId");
    const enemyName = queryParams.get("enemyName") || "Wild Pokémon";
    const enemyLevel = parseInt(queryParams.get("enemyLevel") || "5", 10);
    const enemyType = queryParams.get("enemyType") || "normal";

    // Check for adventureId in the URL path (from the route params)
    const path = window.location.pathname;
    const adventureIdMatch = path.match(/\/battle\/(.+)/);
    const adventureId = adventureIdMatch ? adventureIdMatch[1] : null;

    // If we have an adventureId from the path, load from adventure battles in session storage
    if (adventureId && !isBattleActive) {
      try {
        // Get adventure data from session storage
        const adventureData = JSON.parse(
          sessionStorage.getItem(`adventure-${adventureId}`)
        );

        if (!adventureData) {
          // Just redirect without showing error toast
          navigate("/adventures");
          return;
        }

        const { currentBattle, battles, adventureName } = adventureData;

        if (currentBattle >= battles.length) {
          // Adventure complete
          toast.success(`You've completed the ${adventureName} adventure!`);
          sessionStorage.removeItem(`adventure-${adventureId}`);
          navigate("/adventures");
          return;
        }

        // Get current battle data
        const battleData = battles[currentBattle];
        if (!battleData) {
          toast.error(
            "Battle data not found. Redirecting to adventure selection..."
          );
          navigate("/adventures");
          return;
        }

        // Create enemy Pokémon from battle data
        const pokemonId = battleData.enemyId.split("-").pop();
        const newEnemy = {
          id: battleData.enemyId,
          name: battleData.enemyName,
          level: battleData.enemyLevel,
          type: battleData.enemyType,
          stats: {
            hp: 50 + battleData.enemyLevel * 5,
            attack: 10 + battleData.enemyLevel * 2,
            defense: 10 + battleData.enemyLevel * 2,
            speed: 10 + battleData.enemyLevel * 2,
          },
          url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
            back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`,
          },
          isBoss: battleData.isBoss,
        };

        // Start battle with this enemy
        startBattle(newEnemy);

        // Show battle progress toast
        toast.info(
          `Battle ${currentBattle + 1} of ${battles.length} - ${
            battleData.isBoss ? "Boss Fight!" : ""
          }`,
          {
            autoClose: 3000,
          }
        );
      } catch (error) {
        toast.error(
          "Failed to start battle. Redirecting to adventure selection..."
        );
        navigate("/adventures");
      }
    }
    // If enemyId is provided from query parameters and not already in a battle
    else if (enemyId && !isBattleActive) {
      // Create enemy Pokémon from query parameters
      const newEnemy = {
        id: enemyId,
        name: enemyName,
        level: enemyLevel,
        type: enemyType,
        stats: {
          hp: 50 + enemyLevel * 5,
          attack: 10 + enemyLevel * 2,
          defense: 10 + enemyLevel * 2,
          speed: 10 + enemyLevel * 2,
        },
        url: `https://pokeapi.co/api/v2/pokemon/${enemyName.toLowerCase()}`,
        sprites: {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
            enemyName
          )}.png`,
          back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${getPokemonId(
            enemyName
          )}.png`,
        },
      };

      // Start battle with this enemy
      startBattle(newEnemy);
    } else if (!enemyId && !adventureId && !isBattleActive) {
      // No enemy specified and no active battle, redirect to adventure page
      navigate("/adventures");
    }
  }, [isBattleActive, navigate, startBattle]);

  /**
   * Manages battle state transitions and post-battle actions
   * Handles victory, defeat, and adventure progression
   */
  useEffect(() => {
    // Extract adventure ID from URL if it exists
    const path = window.location.pathname;
    const adventureIdMatch = path.match(/\/battle\/(.+)/);
    const adventureId = adventureIdMatch ? adventureIdMatch[1] : null;

    switch (battleState) {
      case BATTLE_STATES.SELECT_POKEMON:
        setShowRoster(true);
        break;

      case BATTLE_STATES.VICTORY:
        toast.success("You won the battle!");
        // Victory screen will now be shown via component - no automatic redirection
        break;

      case BATTLE_STATES.DEFEAT:
        toast.error("You lost the battle!");
        // Defeat screen will now be shown via component - no automatic redirection
        break;

      case BATTLE_STATES.FLEEING:
        toast.info("You fled from battle!");

        // If this is part of an adventure, clean up the adventure
        if (adventureId) {
          sessionStorage.removeItem(`adventure-${adventureId}`);
          toast.info("Adventure abandoned. You can try again later.");
        }

        // Delay to show fleeing state before redirecting to adventures page
        const fleeTimer = setTimeout(() => {
          navigate("/adventures");
        }, 1500);
        return () => clearTimeout(fleeTimer);

      default:
        setShowRoster(false);
    }
  }, [battleState, endBattle, navigate]);

  /**
   * Handles Pokemon selection for battle
   * Validates Pokemon health and sets it as the active battler
   * @param {Object} pokemon - Selected Pokemon data
   */
  const handleSelectPokemon = (pokemon) => {
    if (pokemon.currentHp <= 0) {
      toast.error(`${pokemon.name} is fainted and cannot battle!`);
      return;
    }

    selectPokemon(pokemon);
    setShowRoster(false);
  };

  // Render Pokémon selection screen
  if (showRoster || battleState === BATTLE_STATES.SELECT_POKEMON) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold font-pixel mb-6 text-center">
            BATTLE!
          </h2>
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 font-pixel">
              Choose a Pokémon
            </h1>

            {/* Enemy Pokemon preview */}
            {enemy && (
              <div className="mb-4 p-3 bg-[#f0f0f0] border-4 border-[#383030] rounded-lg">
                <p className="font-pixel text-center">
                  {enemy.isBoss ? `${enemy.name}` : `A wild ${enemy.name}`}{" "}
                  appeared!
                </p>
                <div className="flex flex-col items-center mt-2">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                      enemy.name
                    )}.png`}
                    alt={enemy.name}
                    className="w-32 h-32 pixelated"
                  />
                  <span
                    className={`font-pixel text-xs px-2 py-1 rounded capitalize mt-2 ${getTypeColor(
                      enemy
                    )}`}
                  >
                    {getPokemonType(enemy)}
                  </span>
                </div>
              </div>
            )}

            {/* Roster selection list */}
            <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto">
              {rosterPokemon && rosterPokemon.length > 0 ? (
                rosterPokemon.map((pokemon) => (
                  <button
                    key={pokemon.id}
                    className={`
                      flex justify-between items-center p-3 
                      bg-[#f0f0f0] border-4 border-[#383030] rounded-lg
                      ${
                        pokemon.currentHp <= 0
                          ? "opacity-50"
                          : "hover:bg-[#e8e8e8]"
                      }
                    `}
                    onClick={() => handleSelectPokemon(pokemon)}
                    disabled={pokemon.currentHp <= 0}
                  >
                    <div className="flex items-center">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                          pokemon.name
                        )}.png`}
                        alt={pokemon.name}
                        className="w-24 h-24 mr-3 pixelated"
                      />
                      <div>
                        <h3 className="font-pixel text-lg">{pokemon.name}</h3>
                        <p className="font-pixel text-sm">
                          Lv. {pokemon.level || 1}
                        </p>
                        <div className="mt-1">
                          <span
                            className={`font-pixel text-xs px-2 py-1 rounded capitalize ${getTypeColor(
                              pokemon
                            )}`}
                          >
                            {getPokemonType(pokemon)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-pixel text-sm">
                        HP: {pokemon.currentHp}/{pokemon.stats?.hp || 100}
                      </p>
                      {pokemon.currentHp <= 0 && (
                        <p className="font-pixel text-xs text-red-500 mt-1">
                          Fainted
                        </p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="font-pixel">No Pokémon in your roster!</p>
                  <button
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded font-pixel"
                    onClick={() => navigate("/pokedex")}
                  >
                    Go to Pokédex
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render battle screen
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Choose starter dialog */}
      {showRoster && (
        <ChoosePokemonScreen
          onSelectPokemon={(pokemon) => {
            selectPokemon(pokemon);
            setShowRoster(false);
          }}
          availablePokemon={playerRoster.filter((p) => p.currentHp > 0)}
        />
      )}

      {/* Victory Screen */}
      {isVictory && (
        <VictoryScreen
          pokemon={playerPokemon}
          enemy={enemy}
          xpGained={xpGained}
          currencyGained={currencyGained}
          isBossBattle={enemy?.isBoss}
          currentBattle={getAdventureProgress().currentBattle}
          maxBattles={getAdventureProgress().maxBattles}
          onNextBattle={handleNextBattle}
          onReturn={handleReturnToMap}
        />
      )}

      {/* Defeat Screen */}
      {isDefeat && (
        <DefeatScreen onRetry={handleRetryBattle} onQuit={handleReturnToMap} />
      )}

      {/* Battle interface */}
      <div className="p-4 bg-[#f0f0f0] rounded-lg shadow-md border-2 border-[#d0d0d0] relative overflow-hidden">
        <div className="grid grid-cols-1 gap-4">
          {/* Battle scene with Pokémon */}
          <BattleScene
            playerPokemon={playerPokemon}
            enemyPokemon={enemy}
            battleState={battleState}
            isPlayerTurn={isPlayerTurn}
            activeItem={activeItem}
          />

          {/* Battle log */}
          <BattleLog
            messages={battleLog.map((msg) =>
              typeof msg === "string" ? msg : { text: msg, type: "system" }
            )}
          />

          {/* Battle controls - with simplified attack */}
          <BattleControls
            playerPokemon={playerPokemon}
            enemyPokemon={enemy}
            battleState={battleState}
            onAttack={attack}
            onUseItem={useItem}
            onChangePokemon={changePokemon}
            onFlee={flee}
            isPlayerTurn={isPlayerTurn}
            isAttacking={isAttacking}
            playerRoster={playerRoster}
            inventory={items}
          />
        </div>
      </div>
    </div>
  );
};

export default Battle;
