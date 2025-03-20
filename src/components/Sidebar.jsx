import { Link, NavLink } from "react-router";

const Sidebar = () => {
  return (
    <div className="flex flex-col p-10 gap-4 justify-between shadow-xl w-1/4">
      <div className="flex flex-col gap-4">
        <Link to={"/"}>
          <img src="/logo.png" alt="Pokemon Logo" className="w-64" />
        </Link>
        <nav className="text-3xl p-8 flex flex-col gap-4">
          {[
            { path: "/", label: "All Pokémon" },
            { path: "/roster", label: "My Roster" },
            { path: "/adventures", label: "Adventures" },
            { path: "/leaderboard", label: "Leaderboard" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex gap-4 items-center group"
            >
              <img
                src="/src/assets/arrow.svg"
                alt="arrow"
                className="w-4 hidden group-hover:block transition-opacity duration-200"
              />
              <p>{item.label}</p>
            </NavLink>
          ))}
        </nav>
      </div>
      <p>© 2025 | Pokémon battle game</p>
    </div>
  );
};

export default Sidebar;
