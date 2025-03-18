import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PokemonPage from "./pages/PokemonPage";
import Leaderboard from "./pages/Leaderboard";
import Roster from "./pages/Roster";

const App = () => {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/pokemon/:pokeId" element={<PokemonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
