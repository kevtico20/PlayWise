/**
 * CheapShark Service
 * Servicios mínimos para consultar ofertas y tiendas desde CheapShark
 * Docs: https://apidocs.cheapshark.com/
 */

const CHEAPSHARK_BASE =
  process.env.EXPO_PUBLIC_CHEAPSHARK_BASE || "https://www.cheapshark.com/api/1.0";

export interface CheapSharkDeal {
  internalName?: string;
  title: string;
  dealID: string;
  storeID?: string;
  salePrice?: string;
  normalPrice?: string;
  isOnSale?: string | boolean;
  savings?: string;
  steamAppID?: string;
  thumb?: string;
}

export async function searchDealsByTitle(title: string, pageSize = 10): Promise<CheapSharkDeal[]> {
  const url = `${CHEAPSHARK_BASE}/deals?title=${encodeURIComponent(title)}&pageSize=${pageSize}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CheapShark searchDealsByTitle failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function searchDealsByTitleExact(title: string, pageSize = 10): Promise<CheapSharkDeal[]> {
  const url = `${CHEAPSHARK_BASE}/deals?title=${encodeURIComponent(title)}&exact=1&pageSize=${pageSize}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CheapShark searchDealsByTitleExact failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function searchDealsBySteamAppID(steamAppID: string, pageSize = 10): Promise<CheapSharkDeal[]> {
  const url = `${CHEAPSHARK_BASE}/deals?steamAppID=${encodeURIComponent(steamAppID)}&pageSize=${pageSize}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CheapShark searchDealsBySteamAppID failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function getStores(): Promise<any[]> {
  const url = `${CHEAPSHARK_BASE}/stores`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CheapShark getStores failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function getDealByID(dealID: string): Promise<any> {
  const url = `${CHEAPSHARK_BASE}/deals?id=${encodeURIComponent(dealID)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CheapShark getDealByID failed: ${res.status} ${body}`);
  }
  return res.json();
}
