/**
 * RAWG Service
 * Servicios mínimos para obtener información de juegos desde RAWG API
 */

const RAWG_BASE = "https://api.rawg.io/api";
const RAWG_KEY = process.env.EXPO_PUBLIC_RAWG_KEY || "";

export interface RawgGameShort {
  id: number;
  name: string;
  slug: string;
  released?: string;
  background_image?: string;
  rating?: number;
  genres?: { id: number; name: string; slug: string }[];
}

export interface RawgGamesResponse {
  results: RawgGameShort[];
  next?: string | null;
  previous?: string | null;
}

export async function getGamesByGenre(genreSlug: string, page = 1, pageSize = 12): Promise<RawgGamesResponse> {
  const url = `${RAWG_BASE}/games?genres=${encodeURIComponent(genreSlug)}&page=${page}&page_size=${pageSize}${RAWG_KEY ? `&key=${RAWG_KEY}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`RAWG getGamesByGenre failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data as RawgGamesResponse;
}

export async function getGameDetails(idOrSlug: string): Promise<any> {
  const url = `${RAWG_BASE}/games/${encodeURIComponent(idOrSlug)}${RAWG_KEY ? `?key=${RAWG_KEY}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`RAWG getGameDetails failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function searchGames(query: string, page = 1, pageSize = 12): Promise<RawgGamesResponse> {
  const url = `${RAWG_BASE}/games?search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}${RAWG_KEY ? `&key=${RAWG_KEY}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`RAWG searchGames failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data as RawgGamesResponse;
}

export interface RawgGameFull extends RawgGameShort {
  description_raw?: string;
}

export async function getTopRatedGames(page = 1, pageSize = 5): Promise<RawgGameFull[]> {
  const url = `${RAWG_BASE}/games?ordering=-rating&page=${page}&page_size=${pageSize}${RAWG_KEY ? `&key=${RAWG_KEY}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`RAWG getTopRatedGames failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const results: RawgGameShort[] = data.results || [];

  // Fetch details for each to get description
  const stripHtml = (html: string) => {
    if (!html) return '';
    // Remove tags and collapse whitespace
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const removeUrls = (text: string) => {
    if (!text) return '';
    // Remove http(s) links and www links, also common steam/store links without protocol
    return text
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/www\.\S+/gi, ' ')
      .replace(/store\.steampowered\.com\S+/gi, ' ')
      .replace(/\S+\.com\/\S+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanDescription = (rawHtml: string) => {
    const text = stripHtml(String(rawHtml || ''));
    const withoutUrls = removeUrls(text);
    // If after removing urls we have something meaningful, return it; otherwise return empty string
    if (withoutUrls && withoutUrls.length > 20) return withoutUrls;
    // fallback: if original text had more content (but mostly urls), try to extract readable fragments
    const short = text.replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim();
    return short.length > 10 ? short : '';
  };

  const details = await Promise.all(
    results.map(async (g) => {
      try {
        const det = await getGameDetails(String(g.id));
        const raw = det.description_raw || det.description || '';
        return {
          ...g,
          description_raw: cleanDescription(String(raw)),
        } as RawgGameFull;
      } catch (e) {
        return { ...g, description_raw: '' } as RawgGameFull;
      }
    })
  );

  return details;
}
