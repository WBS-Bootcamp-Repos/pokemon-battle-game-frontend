/**
 * Adventures Page Component
 *
 * Displays available adventures, allows starting new adventures,
 * and provides access to the bag and item shop.
 */
import { useNavigate } from "react-router";
import { useRoster, useCurrency } from "../context/context";
import { toast } from "react-toastify";
import ItemShop from "../components/ItemShop";
import Bag from "../components/Bag";
import { useState } from "react";

/**
 * Returns appropriate CSS class for a Pokemon type
 * @param {string} type - Pokemon type
 * @returns {string} CSS class for the type badge
 */
const getTypeColor = (type) => {
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

  return typeColors[type.toLowerCase()] || "bg-[#A8A878] text-white"; // Default to normal type
};

/**
 * Pokemon data organized by adventure type
 * Each pool contains Pokemon that will appear in that adventure
 */
const POKEMON_POOLS = {
  forest: [
    // Bug types found in Viridian Forest
    { id: 10, name: "Caterpie", type: "bug" },
    { id: 11, name: "Metapod", type: "bug" },
    { id: 12, name: "Butterfree", type: "bug" }, // Boss potential
    { id: 13, name: "Weedle", type: "bug" },
    { id: 14, name: "Kakuna", type: "bug" },
    { id: 15, name: "Beedrill", type: "bug" }, // Boss potential
    // Forest dwelling Pokemon
    { id: 25, name: "Pikachu", type: "electric" }, // Classic Viridian Forest inhabitant
    { id: 16, name: "Pidgey", type: "flying" },
    { id: 17, name: "Pidgeotto", type: "flying" }, // Boss potential
    { id: 43, name: "Oddish", type: "grass" },
    { id: 69, name: "Bellsprout", type: "grass" },
    { id: 102, name: "Exeggcute", type: "grass" },
    // Rare forest Pokemon
    { id: 123, name: "Scyther", type: "bug" }, // Rare boss potential
  ],

  rocket: [
    // Common Team Rocket Pokemon
    { id: 19, name: "Rattata", type: "normal" },
    { id: 20, name: "Raticate", type: "normal" }, // Boss potential
    { id: 23, name: "Ekans", type: "poison" },
    { id: 24, name: "Arbok", type: "poison" }, // Boss potential
    { id: 27, name: "Sandshrew", type: "ground" },
    { id: 28, name: "Sandslash", type: "ground" }, // Boss potential
    { id: 41, name: "Zubat", type: "poison" },
    { id: 42, name: "Golbat", type: "poison" }, // Boss potential
    { id: 88, name: "Grimer", type: "poison" },
    { id: 89, name: "Muk", type: "poison" }, // Boss potential
    { id: 109, name: "Koffing", type: "poison" },
    { id: 110, name: "Weezing", type: "poison" }, // Boss potential
    // Executive-level Pokemon
    { id: 53, name: "Persian", type: "normal" }, // Giovanni's Persian
    { id: 105, name: "Marowak", type: "ground" }, // Boss potential
    { id: 115, name: "Kangaskhan", type: "normal" }, // Boss potential
    // Legendary (very rare boss)
    { id: 150, name: "Mewtwo", type: "psychic" }, // Ultimate boss (extremely rare)
  ],

  cave: [
    // Common Mt. Moon inhabitants
    { id: 41, name: "Zubat", type: "poison" },
    { id: 42, name: "Golbat", type: "poison" },
    { id: 74, name: "Geodude", type: "rock" },
    { id: 75, name: "Graveler", type: "rock" },
    { id: 76, name: "Golem", type: "rock" },

    // Strong cave dwellers
    { id: 95, name: "Onix", type: "rock" },
    { id: 66, name: "Machop", type: "fighting" },
    { id: 67, name: "Machoke", type: "fighting" },
    { id: 68, name: "Machamp", type: "fighting" },

    // Evolved powerful Pokemon
    { id: 112, name: "Rhydon", type: "ground" },
    { id: 142, name: "Aerodactyl", type: "rock" },
    { id: 139, name: "Omastar", type: "rock" },
    { id: 141, name: "Kabutops", type: "rock" },

    // Legendary birds (rare encounters)
    { id: 144, name: "Articuno", type: "ice" },
    { id: 145, name: "Zapdos", type: "electric" },
    { id: 146, name: "Moltres", type: "fire" },

    // Legendary Pokemon (very rare)
    { id: 150, name: "Mewtwo", type: "psychic" },
    { id: 151, name: "Mew", type: "psychic" },

    // Dragon types (powerful late-game Pokemon)
    { id: 147, name: "Dratini", type: "dragon" },
    { id: 148, name: "Dragonair", type: "dragon" },
    { id: 149, name: "Dragonite", type: "dragon" },
  ],

  safari: [
    // Common Safari Zone Pokemon
    { id: 19, name: "Rattata", type: "normal" },
    { id: 20, name: "Raticate", type: "normal" },
    { id: 21, name: "Spearow", type: "flying" },
    { id: 22, name: "Fearow", type: "flying" },
    { id: 84, name: "Doduo", type: "normal" },
    { id: 85, name: "Dodrio", type: "normal" },
    // Rarer Safari Zone finds
    { id: 111, name: "Rhyhorn", type: "ground" },
    { id: 112, name: "Rhydon", type: "ground" }, // Boss potential
    { id: 113, name: "Chansey", type: "normal" }, // Rare boss potential
    { id: 114, name: "Tangela", type: "grass" },
    { id: 115, name: "Kangaskhan", type: "normal" }, // Boss potential
    { id: 123, name: "Scyther", type: "bug" }, // Boss potential
    { id: 127, name: "Pinsir", type: "bug" }, // Boss potential
    { id: 128, name: "Tauros", type: "normal" }, // Boss potential
    { id: 131, name: "Lapras", type: "water" }, // Very rare, boss potential
    { id: 143, name: "Snorlax", type: "normal" }, // Very rare, boss potential
    // Water Pokemon for the fishing areas
    { id: 118, name: "Goldeen", type: "water" },
    { id: 119, name: "Seaking", type: "water" },
    { id: 129, name: "Magikarp", type: "water" },
    { id: 130, name: "Gyarados", type: "water" }, // Boss potential
    { id: 54, name: "Psyduck", type: "water" },
    { id: 55, name: "Golduck", type: "water" }, // Boss potential
    { id: 60, name: "Poliwag", type: "water" },
    { id: 61, name: "Poliwhirl", type: "water" },
    { id: 62, name: "Poliwrath", type: "water" }, // Boss potential
  ],
};

/**
 * Potential boss Pokemon for the final battle in each area
 */
const BOSS_POKEMON = {
  forest: [
    { id: 12, name: "Butterfree", type: "bug" },
    { id: 15, name: "Beedrill", type: "bug" },
    { id: 17, name: "Pidgeotto", type: "flying" },
    { id: 18, name: "Pidgeot", type: "flying" }, // Rare boss
    { id: 123, name: "Scyther", type: "bug" }, // Rare boss
  ],
  rocket: [
    { id: 24, name: "Arbok", type: "poison" },
    { id: 89, name: "Muk", type: "poison" },
    { id: 110, name: "Weezing", type: "poison" },
    { id: 53, name: "Persian", type: "normal" }, // Giovanni's Persian
    { id: 115, name: "Kangaskhan", type: "normal" }, // Rare boss
    { id: 150, name: "Mewtwo", type: "psychic" }, // Very rare legendary boss
  ],
  cave: [
    // Strong evolved Pokemon bosses
    { id: 76, name: "Golem", type: "rock" },
    { id: 95, name: "Onix", type: "rock" },
    { id: 68, name: "Machamp", type: "fighting" },
    { id: 112, name: "Rhydon", type: "ground" },
    { id: 142, name: "Aerodactyl", type: "rock" },

    // Legendary bird bosses
    { id: 144, name: "Articuno", type: "ice" },
    { id: 145, name: "Zapdos", type: "electric" },
    { id: 146, name: "Moltres", type: "fire" },

    // Ultimate legendary bosses
    { id: 149, name: "Dragonite", type: "dragon" },
    { id: 150, name: "Mewtwo", type: "psychic" },
    { id: 151, name: "Mew", type: "psychic" },
  ],
  safari: [
    { id: 112, name: "Rhydon", type: "ground" },
    { id: 113, name: "Chansey", type: "normal" },
    { id: 115, name: "Kangaskhan", type: "normal" },
    { id: 123, name: "Scyther", type: "bug" },
    { id: 127, name: "Pinsir", type: "bug" },
    { id: 128, name: "Tauros", type: "normal" },
    { id: 130, name: "Gyarados", type: "water" },
    { id: 131, name: "Lapras", type: "water" },
    { id: 143, name: "Snorlax", type: "normal" },
  ],
};
/**
 * Available adventure definitions with metadata
 */
const adventures = [
  {
    id: "forest",
    name: "Viridian Forest",
    description: "A dense forest with bug and grass-type Pokémon",
    difficulty: "Easy",
    requiredLevel: 1,
    representativePokemon:
      BOSS_POKEMON.forest[
        Math.floor(Math.random() * BOSS_POKEMON.forest.length)
      ],
    type: "grass/bug",
    region: "Kanto",
    battles: 6,
  },
  {
    id: "rocket",
    name: "Team Rocket HQ",
    description:
      "Infiltrate Team Rocket's base full of poison and psychic Pokémon",
    difficulty: "Medium",
    requiredLevel: 8,
    representativePokemon:
      BOSS_POKEMON.rocket[
        Math.floor(Math.random() * BOSS_POKEMON.rocket.length)
      ],
    type: "poison/psychic",
    region: "Kanto",
    battles: 6,
  },
  {
    id: "cave",
    name: "Mt. Moon",
    description: "A challenging cave with rock and ground Pokémon",
    difficulty: "Hard",
    requiredLevel: 15,
    representativePokemon:
      BOSS_POKEMON.cave[Math.floor(Math.random() * BOSS_POKEMON.cave.length)],
    type: "rock/ground",
    region: "Kanto",
    battles: 6,
  },
  {
    id: "safari",
    name: "Safari Zone",
    description: "Encounter random Pokémon from all types",
    difficulty: "Random",
    requiredLevel: 5,
    representativePokemon:
      BOSS_POKEMON.safari[
        Math.floor(Math.random() * BOSS_POKEMON.safari.length)
      ],
    type: "various",
    region: "Kanto",
    battles: 6,
  },
];

/**
 * AdventureCard Component - Displays a single adventure option
 *
 * @param {Object} adventure - Adventure data to display
 */
const AdventureCard = ({ adventure }) => {
  const { rosterPokemon = [] } = useRoster() || {};
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  // Check if player has eligible Pokemon for this adventure
  const canStart =
    rosterPokemon &&
    rosterPokemon.length > 0 &&
    rosterPokemon.some(
      (pokemon) =>
        pokemon.level >= adventure.requiredLevel && pokemon.currentHp > 0
    );

  /**
   * Handles the adventure start button click
   * Generates battles and navigates to battle screen
   */
  const handleStartClick = () => {
    if (!canStart) {
      toast.error(
        `You need at least one healthy Pokémon level ${adventure.requiredLevel} or higher to start this adventure!`
      );
      return;
    }

    setIsStarting(true);

    // Generate 6 battles for this adventure
    const battles = generateAdventureBattles(adventure.id);

    // Store battles in session storage
    sessionStorage.setItem(
      `adventure-${adventure.id}`,
      JSON.stringify({
        currentBattle: 0,
        battles,
        adventureId: adventure.id,
        adventureName: adventure.name,
      })
    );

    // Navigate to first battle
    navigate(`/battle/${adventure.id}`);
  };

  /**
   * Returns appropriate CSS class for difficulty badge
   */
  const getDifficultyClass = () => {
    switch (adventure.difficulty) {
      case "Easy":
        return "bg-gray-600";
      case "Medium":
        return "bg-gray-700";
      case "Hard":
        return "bg-gray-800";
      default:
        return "bg-gray-700";
    }
  };

  // Image for the representative Pokémon
  const pokemonImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${adventure.representativePokemon.id}.png`;

  return (
    <div className="border border-gray-300 rounded-lg mb-4 bg-white shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Pokémon preview */}
        <div className="md:w-1/4 bg-gray-100 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-300">
          <div className="text-center">
            <img
              src={pokemonImage}
              alt={adventure.representativePokemon.name}
              className="w-24 h-24 mx-auto pixelated"
              onError={(e) => {
                e.target.src =
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
              }}
            />
            <p className="mt-2 text-xs font-pixel text-gray-600">
              Defeat Boss {adventure.representativePokemon.name} and more!
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-pixel ${getTypeColor(
                adventure.representativePokemon.type
              )} capitalize`}
            >
              {adventure.representativePokemon.type} type
            </span>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold font-pixel">{adventure.name}</h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-white text-xs font-pixel rounded ${getDifficultyClass()}`}
                >
                  {adventure.difficulty}
                </span>
                <span className="bg-black text-white px-2 py-1 text-xs font-pixel rounded">
                  Lv. {adventure.requiredLevel}+
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-3 font-pixel text-sm">
              {adventure.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-pixel mb-3">
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-semibold">Region:</span>{" "}
                {adventure.region}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-semibold">Types:</span> {adventure.type}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-semibold">Battles:</span>{" "}
                {adventure.battles}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="font-semibold">Rewards:</span> XP + Currency
              </div>
            </div>
          </div>

          <button
            onClick={handleStartClick}
            disabled={!canStart || isStarting}
            className={`w-full py-2 px-4 font-pixel text-white text-sm rounded transition-colors ${
              !canStart
                ? "bg-gray-400 cursor-not-allowed"
                : isStarting
                ? "bg-gray-500 cursor-wait"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isStarting
              ? "PREPARING..."
              : !canStart
              ? "NEED STRONGER TEAM"
              : "START ADVENTURE"}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates adventure battles with enemies based on adventure type
 * @param {string} adventureId - ID of the adventure to generate for
 * @returns {Array} Array of battle data
 */
function generateAdventureBattles(adventureId) {
  const battles = [];
  const pokemonPool = POKEMON_POOLS[adventureId] || [];
  const bossPokemonPool = BOSS_POKEMON[adventureId] || [];

  if (pokemonPool.length === 0) {
    return battles; // Empty adventure
  }

  /**
   * Gets a random Pokemon from a pool, excluding already used ones
   * @param {Array} pool - Pool of Pokemon to select from
   * @param {Array} excludeIds - IDs to exclude
   * @returns {Object} Selected Pokemon
   */
  const getRandomPokemon = (pool, excludeIds = []) => {
    const filteredPool = pool.filter((p) => !excludeIds.includes(p.id));
    return filteredPool[Math.floor(Math.random() * filteredPool.length)];
  };

  // Track used Pokémon to avoid duplicates
  const usedPokemonIds = [];

  // Generate 5 regular encounters
  for (let i = 0; i < 5; i++) {
    const pokemon = getRandomPokemon(pokemonPool, usedPokemonIds);

    if (!pokemon) continue; // Skip if no more unique Pokémon

    usedPokemonIds.push(pokemon.id);

    battles.push({
      enemyId: `${adventureId}-pokemon-${pokemon.id}`,
      enemyName: pokemon.name,
      enemyLevel: Math.floor(Math.random() * 10) + 5 * (i + 1), // Increasing levels
      enemyType: pokemon.type,
      isBoss: false,
    });
  }

  // Add a boss Pokémon for the final battle
  const boss =
    bossPokemonPool[Math.floor(Math.random() * bossPokemonPool.length)];

  battles.push({
    enemyId: `${adventureId}-boss-${boss.id}`,
    enemyName: `Boss ${boss.name}`,
    enemyLevel: Math.floor(Math.random() * 10) + 30, // Level 30-40
    enemyType: boss.type,
    isBoss: true,
  });

  return battles;
}

/**
 * Main Adventures Component
 * Displays available adventures or a prompt to add Pokemon
 */
const Adventures = () => {
  const { rosterPokemon = [] } = useRoster() || {};
  const { currency = 0 } = useCurrency() || {};
  const navigate = useNavigate();
  const [showBag, setShowBag] = useState(false);

  // If no Pokemon in roster, show prompt to add Pokemon
  if (!rosterPokemon || rosterPokemon.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold font-pixel mb-6 text-center">
            POKéMON ADVENTURES
          </h2>

          <div className="bg-gray-100 border border-gray-300 text-gray-800 p-4 mb-6 rounded-md">
            <p className="font-bold font-pixel mb-2">NO POKéMON FOUND!</p>
            <p className="font-pixel text-sm">
              You need to add at least one POKéMON to your roster before
              starting an adventure.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-black hover:bg-gray-800 text-white font-pixel px-4 py-2 rounded-md text-sm"
            >
              GO TO HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-pixel">POKéMON ADVENTURES</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBag(true)}
              className="bg-black hover:bg-gray-800 text-white font-pixel py-1 px-3 rounded-md flex items-center text-sm"
            >
              <span className="mr-2">🎒</span>
              BAG
            </button>
            <div className="bg-gray-900 text-white font-pixel py-1 px-3 rounded-md">
              {currency} ¥
            </div>
          </div>
        </div>

        {/* Item Shop */}
        <ItemShop id="itemShop" />

        {/* Bag Modal */}
        {showBag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-xl">
              <Bag onClose={() => setShowBag(false)} />
            </div>
          </div>
        )}

        {/* Adventure list */}
        <div className="mt-6">
          <h3 className="font-pixel text-lg mb-4 border-b pb-2">
            Available Adventures
          </h3>
          {adventures.map((adventure) => (
            <AdventureCard key={adventure.id} adventure={adventure} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adventures;
