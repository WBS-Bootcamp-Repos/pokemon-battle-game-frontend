import { useParams, useNavigate } from "react-router";
import { useRoster } from "../context/context";
import { useState, useEffect } from "react";
import { getPokemonById } from "../data/api";
import { addToRoster, removeFromRoster } from "../utils/roster";

const PokemonPage = () => {
  const [currPokemon, setCurrPokemon] = useState({});
  const { rosterPokemon, setRosterPokemon } = useRoster();
  const { pokeId } = useParams();
  const navigate = useNavigate();

  const isInRoster = rosterPokemon.some((p) => p.id === currPokemon.id);

  const handleAddToRoster = (pokemon) => {
    addToRoster(pokemon, setRosterPokemon);
  };

  const handleRemoveFromRoster = (pokemonId) => {
    removeFromRoster(pokemonId, setRosterPokemon);
  };

  const typeColors = {
    grass: "bg-[#62BC5A]",
    poison: "bg-[#AA6BC8]",
    bug: "bg-[#91C12E]",
    fire: "bg-[#FE9D55]",
    electric: "bg-[#F3D23B]",
    dragon: "bg-[#0A6CC3]",
    water: "bg-[#4F8FD5]",
    ground: "bg-[#D97845]",
    ghost: "bg-[#5268AD]",
    psychic: "bg-[#FA7179]",
    dark: "bg-[#5A5465]",
    flying: "bg-[#8FA9DE]",
    rock: "bg-[#C5B68C]",
    steel: "bg-[#5A8EA2]",
    ice: "bg-[#72CEC0]",
    fairy: "bg-[#EC8EE6]",
  };

  const { name, height, id, weight, types, stats } = currPokemon;

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const pokeData = await getPokemonById(pokeId);
        setCurrPokemon(pokeData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPokemon();
  }, [pokeId]);

  return (
    <div className="grid grid-cols-2 gap-8 items-stretch">
      <div className="flex flex-col gap-8 justify-between">
        <button onClick={handleGoBack} className="text-2xl flex gap-4">
          <img
            src="/src/assets/arrow.svg"
            alt="Arrow right"
            className="w-4 transform rotate-180"
          />
          go back
        </button>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
          alt={name}
          className="-my-16"
        />
        <div className="flex flex-col gap-8 border-2 border-black border-l-8 border-r-8 p-6">
          <h2 className="text-3xl">Types</h2>
          <div className="flex gap-4 justify-start">
            {types?.map((type, index) => (
              <p
                key={`${type.type.name}-${index}`} // Unique key
                className={`px-4 py-2 border-2 border-black text-2xl ${
                  typeColors[type.type.name] || ""
                }`}
              >
                {type.type.name}
              </p>
            ))}
          </div>
          <button
            className="bg-black border-2 border-black border-y-4 text-white tracking-wide px-4 py-2 text-xl hover:bg-white hover:text-black"
            onClick={() =>
              isInRoster
                ? handleRemoveFromRoster(id)
                : handleAddToRoster(currPokemon)
            }
          >
            {isInRoster ? "- remove from roster" : "+ add to roster"}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-8 justify-end">
        <div className="border-2 border-black">
          <div className="bg-black p-4 flex gap-4 justify-between">
            <p className="text-white text-3xl tracking-wider">{id}</p>
            <h1 className="text-white text-3xl tracking-wider">{name}</h1>
          </div>
          <div className="flex gap-8 justify-between items-center p-4">
            <p className="text-3xl">HP: {stats?.hp}</p>
            <p className="text-xl">height: {height}</p>
            <p className="text-xl">weight: {weight}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-between">
          <h2 className="text-3xl text-center">Stats</h2>
          <button className="bg-white border-2 border-y-4 border-black text-black tracking-wide px-4 py-2 text-xl hover:bg-black hover:text-white">
            play sound
          </button>
        </div>

        <div className="border-2 border-black flex flex-col">
          <div className="p-4 flex gap-4 justify-between border-dashed border-b-2 border-black">
            <p className="text-xl">attack</p>
            <p className="text-xl">{stats?.attack}</p>
          </div>
          <div className="p-4 flex gap-4 justify-between border-dashed border-b-2 border-black">
            <p className="text-xl">defense</p>
            <p className="text-xl">{stats?.defense}</p>
          </div>
          <div className="p-4 flex gap-4 justify-between border-dashed border-b-2 border-black">
            <p className="text-xl">special attack</p>
            <p className="text-xl">{stats?.specialAttack}</p>
          </div>
          <div className="p-4 flex gap-4 justify-between border-dashed border-b-2 border-black">
            <p className="text-xl">special defense</p>
            <p className="text-xl">{stats?.specialDefense}</p>
          </div>
          <div className="p-4 flex gap-4 justify-between ">
            <p className="text-xl">speed</p>
            <p className="text-xl">{stats?.speed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonPage;
