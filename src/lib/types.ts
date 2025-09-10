import type { CategoryTop } from "./parseSave";

export interface WrappedMetrics {
  farmerName: string;
  farmName: string;
  date: string;
  moneyEarned?: number;
  seedsSown?: number;
  itemsCookedCount?: number;
  timesFished?: number;
  topMonster?: { name: string; count: number } | null;
  mostShipped?: { id: number; name: string; count: number } | null;
  mostCookedRecipe?: { id: number; name: string; count: number } | null;
  mostCaughtFish?: { id: number; name: string; count: number } | null;
  friendsTop?: Array<{ name: string; hearts: number }>;

  // Extras
  uniqueItemsShipped?: number;
  uniqueRecipesCooked?: number;
  fishTypesCaught?: number;
  topGrossingItem?: { id: number; name: string; gross: number } | null;
  mostShippedByCategory?: CategoryTop;
}
