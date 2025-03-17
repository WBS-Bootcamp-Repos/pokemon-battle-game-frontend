import { useEffect, useState } from "react";
import PokemonCard from "../components/PokemonCard";

const Home = () => {
  const [pokes, setPokes] = useState([]);

  useEffect(() => {
    const fetchPokes = async () => {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=20"
        );
        const data = await response.json();
        const pokes = data.results;

        const pokeWithSprite = pokes.map((poke, i) => ({
          ...poke,
          // use default_front sprite URL so we can have an image
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
            i + 1
          }.png`,
          //arrays are zero indexed, and pokemon numbering starts at 1, so id of i + 1 gives us the right pokemon
          id: i + 1,
        }));
        console.log(pokeWithSprite);

        setPokes(pokeWithSprite);
      } catch (error) {
        console.error("Error fetching pokes:", error);
      }
    };

    fetchPokes();
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
