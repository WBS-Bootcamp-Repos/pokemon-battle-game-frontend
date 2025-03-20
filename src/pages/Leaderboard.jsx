import { useEffect, useState } from "react";
import { getLeaderboard } from "../data/api";

const pokemonImages = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", // 1st place
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png", // 2nd place
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png", // 3rd place
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboard();
      if (data) {
        // Sort by score in descending order
        const sortedData = data.sort((a, b) => b.score - a.score);
        setLeaderboard(sortedData);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-4xl">Leaderboard</h1>
      <div className="border-t-2 border-black my-4 py-12 gap-8 w-full">
        <table className="w-full border-collapse border-2 border-black text-left">
          <thead>
            <tr className="bg-black">
              <th className="border-2 border-black px-4 py-4 text-2xl text-white text-center">
                #
              </th>
              <th className="border-2 border-black px-4 py-4 text-2xl text-white">
                Username
              </th>
              <th className="border-2 border-black px-4 py-4 text-2xl text-white">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <tr key={entry._id}>
                  <td className="border-2 border-black px-4 py-4 text-2xl text-center">
                    {index < 3 ? (
                      <img
                        src={pokemonImages[index]}
                        alt="Pokemon"
                        className="w-12 h-12 mx-auto"
                      />
                    ) : (
                      ""
                    )}
                    {index + 1}
                  </td>
                  <td className="border-2 border-black px-4 py-4 text-2xl">
                    {entry.username}
                  </td>
                  <td className="border-2 border-black px-4 py-4 text-2xl">
                    {entry.score}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="border-2 border-black px-4 py-4 text-2xl text-center"
                >
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
