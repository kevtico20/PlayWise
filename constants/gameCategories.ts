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
  { key: "action", title: "Acción", rawgSlug: "action" },
  { key: "adventure", title: "Aventura", rawgSlug: "adventure" },
  { key: "rpg", title: "RPG", rawgSlug: "role-playing-games-rpg" },
  { key: "strategy", title: "Estrategia", rawgSlug: "strategy" },
  { key: "shooter", title: "Shooter", rawgSlug: "shooter" },
  { key: "sports", title: "Deportes", rawgSlug: "sports" },
  { key: "indie", title: "Indie", rawgSlug: "indie" },
  { key: "family", title: "Familiar", rawgSlug: "family" },
  { key: "puzzle", title: "Puzzle", rawgSlug: "puzzle" },
];

export default GAME_CATEGORIES;
