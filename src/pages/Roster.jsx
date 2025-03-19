import PokemonCard from "../components/PokemonCard";
import { useRoster } from "../context/context";
import { ToastContainer } from "react-toastify";

const Roster = () => {
  const { rosterPokemon, setRosterPokemon } = useRoster();

  return (
    <div className="flex flex-col w-full ">
      <h1 className="text-4xl">My Roster</h1>
      <div className="border-t-2 border-black my-4 py-12 grid grid-cols-3 gap-8">
        {rosterPokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Roster;
