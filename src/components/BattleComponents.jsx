/**
 * [DEPRECATED] Battle Components
 *
 * This file is deprecated. All components have been modularized into individual files
 * in the src/components/battle directory. Please import directly from there.
 *
 * For example:
 * - import { AttackAnimation, BattlePokemon } from './battle';
 * - import { VictoryScreen, DefeatScreen } from './battle';
 * - import { ChoosePokemonScreen, ItemSelectionModal } from './battle';
 */

import {
  AttackAnimation,
  BattlePokemon,
  FaintAnimation,
  ItemAnimation,
  VictoryScreen,
  DefeatScreen,
  ChoosePokemonScreen,
  ItemSelectionModal,
} from "./battle";

// Re-export all components for backward compatibility
export {
  AttackAnimation,
  BattlePokemon,
  VictoryScreen,
  DefeatScreen,
  ChoosePokemonScreen,
  ItemSelectionModal,
};
