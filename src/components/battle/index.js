/**
 * Battle Components Index
 *
 * Exports all battle-related components for convenient imports elsewhere
 */

// Core battle components
import AttackAnimation from "./AttackAnimation";
import BattlePokemon from "./BattlePokemon";
import FaintAnimation from "./FaintAnimation";
import ItemAnimation from "./ItemAnimation";

// Result screens
import { VictoryScreen, DefeatScreen } from "./BattleResults";

// Pokemon and item selection
import { ChoosePokemonScreen, ItemSelectionModal } from "./PokemonSelection";

export {
  // Core battle components
  AttackAnimation,
  BattlePokemon,
  FaintAnimation,
  ItemAnimation,

  // Result screens
  VictoryScreen,
  DefeatScreen,

  // Pokemon and item selection
  ChoosePokemonScreen,
  ItemSelectionModal,
};
