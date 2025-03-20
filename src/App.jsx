import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PokemonPage from "./pages/PokemonPage";
import Leaderboard from "./pages/Leaderboard";
import Roster from "./pages/Roster";
import Adventures from "./pages/Adventures";
import Battle from "./pages/Battle";

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
            <Route path="/adventures" element={<Adventures />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/battle/:adventureId" element={<Battle />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
