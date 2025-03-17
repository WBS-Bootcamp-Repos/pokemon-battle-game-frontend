// import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PokemonPage from "./pages/PokemonPage";
import Leaderboard from "./pages/Leaderboard";
import Roster from "./pages/Roster";

const App = () => {
  // const [playerHealth, setPlayerHealth] = useState(100);
  // const [opponentHealth, setOpponentHealth] = useState(100);
  // const [move, setMove] = useState("Thunderbolt");

  // const handleAttack = () => {
  //   setOpponentHealth((prev) => Math.max(prev - 10, 0));
  //   setPlayerHealth((prev) => Math.max(prev - 5, 0));
  // };

  return (
    // <div className="min-h-screen bg-base-200 flex flex-col items-center p-6">
    //   <h1 className="text-4xl font-bold text-primary mb-6">Pokémon Battle Game</h1>
    //   <div className="flex gap-6 mb-6">
    //     <div className="card w-64 bg-base-100 shadow-xl">
    //       <div className="card-body">
    //         <h2 className="card-title text-accent">Pikachu (You)</h2>
    //         <progress className="progress progress-success" value={playerHealth} max="100"></progress>
    //         <p>HP: {playerHealth}</p>
    //       </div>
    //     </div>
    //     <div className="card w-64 bg-base-100 shadow-xl">
    //       <div className="card-body">
    //         <h2 className="card-title text-error">Charmander (Opponent)</h2>
    //         <progress className="progress progress-error" value={opponentHealth} max="100"></progress>
    //         <p>HP: {opponentHealth}</p>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="tabs mb-4">
    //     <a className={`tab tab-bordered ${move === "Thunderbolt" ? "tab-active" : ""}`} onClick={() => setMove("Thunderbolt")}>Thunderbolt</a>
    //     <a className={`tab tab-bordered ${move === "Quick Attack" ? "tab-active" : ""}`} onClick={() => setMove("Quick Attack")}>Quick Attack</a>
    //   </div>
    //   <button
    //     className="btn btn-primary btn-wide"
    //     onClick={handleAttack}
    //     disabled={playerHealth === 0 || opponentHealth === 0}
    //   >
    //     Use {move}!
    //   </button>
    //   {playerHealth === 0 && <div className="alert alert-error mt-4"><span>You Lost!</span></div>}
    //   {opponentHealth === 0 && <div className="alert alert-success mt-4"><span>You Won!</span></div>}
    // </div>
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/pokemon/:id" element={<PokemonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
