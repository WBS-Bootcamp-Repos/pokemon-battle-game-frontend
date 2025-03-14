# Pokémon Battle Game - Frontend Repo

Welcome to the Pokémon Battle Game! This React application allows players to select a roster of Pokémon, engage in battles, and track their progress on a leaderboard. The game utilizes the PokéAPI to retrieve Pokémon data and offers an interactive and fun experience for Pokémon enthusiasts.

## Table of Contents

    •	Features
    •	Installation
    •	Usage
    •	Project Structure
    •	Contributing
    •	License

## Features

    •	Pokémon Selection: Browse and select Pokémon from the PokéAPI to build your personal roster.
    •	Detailed Pokémon Information: View stats, types, and abilities of each Pokémon.
    •	Battle System: Engage in battles using a simple dynamic based on Pokémon stats and types.
    •	Leaderboard: Track and compare your scores with other players.

### Installation

To set up the project locally, follow these steps: 1. Clone the repository:

git clone https://github.com/your-username/pokemon-battle-game-frontend.git
cd pokemon-battle-game-frontend

    2.	Install dependencies:

npm install

Ensure you have Node.js installed.

    3.	Start the development server:

npm run dev

The application will be accessible at http://localhost:3000.

### Usage

Navigate through the application using the provided links:
• Homepage: Browse available Pokémon and view their details.
• My Roster: Manage your selected Pokémon.
• Battle: Engage in battles and earn points.
• Leaderboard: View top players and their scores.

### Project Structure

The project’s structure is as follows:

```
pokemon-battle-game-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
└── README.md
```

    •	public/: Contains static assets.
    •	src/: Contains source code.
    •	assets/: Images and other media.
    •	components/: Reusable UI components.
    •	pages/: Page components for routing.
    •	App.jsx: Main application component.
    •	main.jsx: Entry point for React.
    •	index.css: Global styles.
    •	.gitignore: Specifies files to ignore in version control.
    •	package.json: Lists dependencies and scripts.
    •	README.md: Project documentation.

### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch:

   `git checkout -b feature/your-feature-name`

3. Commit your changes:

   `git commit -m 'Add your feature'`

4. Push to the branch:

   `git push origin feature/your-feature-name`

5. Open a pull request.

Note: Replace placeholder URLs and paths with actual ones relevant to your project.
