import { useEffect, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import { getAllPokemon } from "../data/api";

const Home = () => {
  const [pokes, setPokes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(pokes.length / itemsPerPage);

  // Get the Pokémon for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPokemon = pokes.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination handlers
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
        {currentPokemon.map((p) => (
          <PokemonCard key={p.id} {...p} />
        ))}
      </div>
      <div className="flex gap-4 justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="text-2xl flex gap-4"
        >
          <img
            src="/src/assets/arrow.svg"
            alt="Arrow right"
            className="w-4 transform rotate-180"
          />
          Previous
        </button>
        <span className="text-2xl">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="text-2xl flex gap-4"
        >
          Next
          <img src="/src/assets/arrow.svg" alt="Arrow right" className="w-4" />
        </button>
      </div>
    </div>
  );
};

export default Home;
