/**
 * Mapeo de categorías para la UI principal. Cada entrada tiene un slug compatible con RAWG
 * Ajusta según prefieras.
 */

export interface GameCategory {
  key: string;
  title: string;
  rawgSlug: string;
}

const GAME_CATEGORIES: GameCategory[] = [
  { key: "action", title: "categories.action", rawgSlug: "action" },
  { key: "adventure", title: "categories.adventure", rawgSlug: "adventure" },
  { key: "rpg", title: "categories.rpg", rawgSlug: "role-playing-games-rpg" },
  { key: "strategy", title: "categories.strategy", rawgSlug: "strategy" },
  { key: "shooter", title: "categories.shooter", rawgSlug: "shooter" },
  { key: "sports", title: "categories.sports", rawgSlug: "sports" },
  { key: "indie", title: "categories.indie", rawgSlug: "indie" },
  { key: "family", title: "categories.family", rawgSlug: "family" },
  { key: "puzzle", title: "categories.puzzle", rawgSlug: "puzzle" },
];

export default GAME_CATEGORIES;
