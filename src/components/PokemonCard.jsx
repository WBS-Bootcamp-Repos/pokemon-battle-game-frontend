import { Link } from "react-router";

const PokemonCard = ({ name, id, height, stats }) => {
  // const hpStat = stats.find((stat) => stat.stat.name === "hp");

  return (
    <div className="flex flex-col border-2 border-b-4 border-black">
      <div className="flex justify-between items-center pr-4">
        <div className="bg-black py-2 px-4 w-3/4 clip-diagonal">
          <h2 className="text-white text-xl tracking-wider">{name}</h2>
        </div>
        <p className="text-xl tracking-wider">HP </p>
      </div>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
        alt={name}
        className="border-b-2 border-black mx-4"
      />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex gap-4 justify-between">
          <p>Height </p>
          <p> {height}</p>
        </div>
        <div className="flex gap-4 justify-between">
          <p>Stats </p>
          <p> {id}</p>
        </div>
        <div className="flex gap-4 justify-between">
          <p>Stats </p>
          <p> {id}</p>
        </div>
      </div>
      <div className="flex gap-4 px-4 pb-4 justify-between">
        <Link to={`/pokemon/${id}`}>
          <button className="bg-black border-2 border-black border-y-4 text-white tracking-wide px-4 py-2 hover:bg-white hover:text-black">
            show details
          </button>
        </Link>
        <Link to={`/pokemon/${id}`}>
          <button className="bg-white border-2 border-y-4 border-black text-black tracking-wide px-4 py-2 hover:bg-black hover:text-white">
            + add
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PokemonCard;
