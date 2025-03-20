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

/**
 * Maps Pokemon names to their Pokedex IDs
 * Used for sprite URL generation when IDs aren't directly available
 * @param {string} name - Pokemon name to look up
 * @returns {number} Pokedex ID or 132 (Ditto) as fallback
 */
const getPokemonId = (name) => {
  if (!name) return 132; // Default to Ditto (ID 132)

  // Map of common Pokemon names to their ID
  const nameToId = {
    bulbasaur: 1,
    ivysaur: 2,
    venusaur: 3,
    charmander: 4,
    charmeleon: 5,
    charizard: 6,
    squirtle: 7,
    wartortle: 8,
    blastoise: 9,
    caterpie: 10,
    metapod: 11,
    butterfree: 12,
    weedle: 13,
    kakuna: 14,
    beedrill: 15,
    pidgey: 16,
    pidgeotto: 17,
    pidgeot: 18,
    rattata: 19,
    raticate: 20,
    pikachu: 25,
    raichu: 26,
    sandshrew: 27,
    sandslash: 28,
    nidoran: 29,
    nidorina: 30,
    nidoqueen: 31,
    nidorino: 33,
    nidoking: 34,
    clefairy: 35,
    clefable: 36,
    vulpix: 37,
    ninetales: 38,
    jigglypuff: 39,
    wigglytuff: 40,
    zubat: 41,
    golbat: 42,
    oddish: 43,
    gloom: 44,
    vileplume: 45,
    paras: 46,
    parasect: 47,
    venonat: 48,
    venomoth: 49,
    diglett: 50,
    dugtrio: 51,
    meowth: 52,
    persian: 53,
    psyduck: 54,
    golduck: 55,
    mankey: 56,
    primeape: 57,
    growlithe: 58,
    arcanine: 59,
    poliwag: 60,
    poliwhirl: 61,
    poliwrath: 62,
    abra: 63,
    kadabra: 64,
    alakazam: 65,
    machop: 66,
    machoke: 67,
    machamp: 68,
    bellsprout: 69,
    weepinbell: 70,
    victreebel: 71,
    tentacool: 72,
    tentacruel: 73,
    geodude: 74,
    graveler: 75,
    golem: 76,
    ponyta: 77,
    rapidash: 78,
    slowpoke: 79,
    slowbro: 80,
    magnemite: 81,
    magneton: 82,
    farfetchd: 83,
    doduo: 84,
    dodrio: 85,
    seel: 86,
    dewgong: 87,
    grimer: 88,
    muk: 89,
    shellder: 90,
    cloyster: 91,
    gastly: 92,
    haunter: 93,
    gengar: 94,
    onix: 95,
    drowzee: 96,
    hypno: 97,
    krabby: 98,
    kingler: 99,
    voltorb: 100,
    electrode: 101,
    exeggcute: 102,
    exeggutor: 103,
    cubone: 104,
    marowak: 105,
    hitmonlee: 106,
    hitmonchan: 107,
    lickitung: 108,
    koffing: 109,
    weezing: 110,
    rhyhorn: 111,
    rhydon: 112,
    chansey: 113,
    tangela: 114,
    kangaskhan: 115,
    horsea: 116,
    seadra: 117,
    goldeen: 118,
    seaking: 119,
    staryu: 120,
    starmie: 121,
    mrmime: 122,
    scyther: 123,
    jynx: 124,
    electabuzz: 125,
    magmar: 126,
    pinsir: 127,
    tauros: 128,
    magikarp: 129,
    gyarados: 130,
    lapras: 131,
    ditto: 132,
    eevee: 133,
    vaporeon: 134,
    jolteon: 135,
    flareon: 136,
    porygon: 137,
    omanyte: 138,
    omastar: 139,
    kabuto: 140,
    kabutops: 141,
    aerodactyl: 142,
    snorlax: 143,
    articuno: 144,
    zapdos: 145,
    moltres: 146,
    dratini: 147,
    dragonair: 148,
    dragonite: 149,
    mewtwo: 150,
    mew: 151,
  };

  // Clean the name (remove spaces, dashes, convert to lowercase)
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Return the ID if found, otherwise a fallback ID
  return nameToId[cleanName] || 132;
};

/**
 * Generates a sprite URL for a Pokemon from various data formats
 * Uses multiple fallback methods to ensure a valid sprite
 * @param {Object} pokemon - Pokemon data object
 * @returns {string} URL to the Pokemon's sprite
 */
const getPokemonSpriteUrl = (pokemon) => {
  // Check for sprites object first
  if (pokemon.sprites && pokemon.sprites.front_default) {
    return pokemon.sprites.front_default;
  }

  // If we have a URL property (from API)
  if (pokemon.url) {
    // Extract ID from URL if possible
    const matches = pokemon.url.match(/\/pokemon\/(\d+)/);
    if (matches && matches[1]) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${matches[1]}.png`;
    }
  }

  // Try to get ID from name
  const id = getPokemonId(pokemon.name);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
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
    activeItem,
    startBattle,
    selectPokemon,
    attack,
    useItem,
    changePokemon,
    flee,
    endBattle,
  } = useBattle();

  // Get battle status
  const isBattleActive = battleState !== BATTLE_STATES.IDLE;

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

        // If this is part of an adventure, advance to next battle
        if (adventureId) {
          try {
            const adventureData = JSON.parse(
              sessionStorage.getItem(`adventure-${adventureId}`)
            );

            if (adventureData) {
              const { currentBattle, battles } = adventureData;

              // Check if this is the last battle
              if (currentBattle >= battles.length - 1) {
                // Adventure complete
                toast.success(
                  `You've completed the ${adventureData.adventureName} adventure!`,
                  {
                    autoClose: 5000,
                  }
                );

                // Clean up adventure data
                sessionStorage.removeItem(`adventure-${adventureId}`);

                // Delay to show victory state before redirecting
                const victoryTimer = setTimeout(() => {
                  endBattle();
                  navigate("/adventures");
                }, 3000);
                return () => clearTimeout(victoryTimer);
              } else {
                // Move to next battle
                adventureData.currentBattle = currentBattle + 1;
                sessionStorage.setItem(
                  `adventure-${adventureId}`,
                  JSON.stringify(adventureData)
                );

                // Delay to show victory state before starting next battle
                const victoryTimer = setTimeout(() => {
                  endBattle();
                  navigate(`/battle/${adventureId}`);
                }, 3000);
                return () => clearTimeout(victoryTimer);
              }
            }
          } catch (error) {
            console.error("Error processing adventure victory:", error);
          }
        } else {
          // Normal single battle victory
          const victoryTimer = setTimeout(() => {
            endBattle();
            navigate("/adventures");
          }, 3000);
          return () => clearTimeout(victoryTimer);
        }
        break;

      case BATTLE_STATES.DEFEAT:
        toast.error("You lost the battle!");

        // If this is part of an adventure, clean up the adventure
        if (adventureId) {
          sessionStorage.removeItem(`adventure-${adventureId}`);
          toast.info(
            "Adventure failed! Try again when your Pokémon are stronger."
          );
        }

        // Delay to show defeat state before redirecting
        const defeatTimer = setTimeout(() => {
          endBattle();
          navigate("/adventures");
        }, 3000);
        return () => clearTimeout(defeatTimer);

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
                <p className="font-pixel">
                  {enemy.isBoss ? `Boss ${enemy.name}` : `A wild ${enemy.name}`}{" "}
                  appeared!
                </p>
                {enemy.sprites && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={enemy.sprites.front_default}
                      alt={enemy.name}
                      className="w-32 h-32 pixelated"
                      onError={(e) => {
                        e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                          enemy.name
                        )}.png`;
                      }}
                    />
                  </div>
                )}
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
                        src={getPokemonSpriteUrl(pokemon)}
                        alt={pokemon.name}
                        className="w-32 h-32 mr-3 pixelated"
                        onError={(e) => {
                          // Fallback chain for sprite loading
                          if (e.target.src.includes("front_default")) {
                            e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                              pokemon.name
                            )}.png`;
                          } else if (
                            e.target.src.includes("sprites/pokemon/")
                          ) {
                            e.target.src =
                              "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
                          }
                        }}
                      />
                      <div>
                        <h3 className="font-pixel text-lg">{pokemon.name}</h3>
                        <p className="font-pixel text-sm">
                          Lv. {pokemon.level || 1}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-pixel text-sm">
                        HP: {pokemon.currentHp}/{pokemon.stats?.hp || 100}
                      </p>
                      {pokemon.type && (
                        <span className="font-pixel text-xs bg-[#d0d0d0] px-2 py-1 rounded">
                          {pokemon.type}
                        </span>
                      )}
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold font-pixel mb-6 text-center">
          BATTLE!
        </h2>
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
            playerRoster={playerRoster}
            inventory={items}
          />
        </div>
      </div>
    </div>
  );
};

export default Battle;