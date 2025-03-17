import { useEffect, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import { getAllPokemon } from "../data/api";

const Home = () => {
  const [pokes, setPokes] = useState([]);

  useEffect(() => {
    const getAndSetPokemon = async () => {
      try {
        const allPokemon = await getAllPokemon();
        console.log(allPokemon);
        setPokes(allPokemon);
      } catch (error) {
        console.error("Error fetching pokes:", error);
      }
    };
    getAndSetPokemon();
  }, []);

  return (
    <div className="flex flex-col w-full ">
      <h1 className="text-4xl">Cool title for homepage</h1>
      <div className="border-t-2 border-black my-4 py-12 grid grid-cols-4 gap-8">
        {pokes.map((p) => (
          <PokemonCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
};

export default Home;
