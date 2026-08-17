import {
  ApiError,
  ForecastEntry,
  LocationResult,
  RawSearchResult,
  SavedLocation,
  SaveLocationResponse,
} from "./types";
import { ChatMessage, ChatResponse } from "./types";
/**
 * Data-fetching layer. Every network call to the backend goes through
 * a function exported here — components never call fetch() directly.
 * This is what lets future features (chatbot widget, analytics/history
 * view, extra data fields) slot in as new functions here + new
 * components, without touching existing ones.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "Could not reach the weather service. Check your connection.",
      0,
      "network"
    );
  }

  if (res.status === 404) {
    throw new ApiError("Not found", 404, "not_found");
  }
  if (!res.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${res.status}`,
      res.status,
      "server"
    );
  }

  return (await res.json()) as T;
}

/** All previously saved locations. */
export async function getLocations(): Promise<SavedLocation[]> {
  return request<SavedLocation[]>("/locations");
}

/**
 * Geocoding search for a city name. Returns [] on "no matches"
 * instead of throwing, so callers (e.g. the search bar) can just
 * render an empty state rather than handling a 404 specially.
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return [];
  try {
    const raw = await request<RawSearchResult[]>(
      `/locations/search?location=${encodeURIComponent(query)}`
    );
    return raw.map((r) => ({
      id: r.location_id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      admin1: r.admin1,
      country: r.country,
    }));
  } catch (err) {
    if (err instanceof ApiError && err.kind === "not_found") return [];
    throw err;
  }
}

/**
 * Saves a location the user picked from search results. The backend
 * fetches + stores its forecast synchronously as part of this call,
 * so an immediate getForecast() right after should succeed.
 */
export async function saveLocation(location: {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string | null;
  country?: string | null;
}): Promise<SaveLocationResponse> {
  const params = new URLSearchParams({
    name: location.name,
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  });
  if (location.admin1) params.set("admin1", location.admin1);
  if (location.country) params.set("country", location.country);

  return request<SaveLocationResponse>(`/locations/save?${params.toString()}`, {
    method: "POST",
  });
}

/**
 * Hourly forecast for a saved location. Returns null on "no
 * forecasts yet" (e.g. a location was just saved but the backend
 * scheduler hasn't populated it) instead of throwing, so the UI can
 * show a distinct "still gathering data" state rather than a generic
 * error.
 */
export async function getForecast(
  locationId: number,
  force = false
): Promise<ForecastEntry[] | null> {
  try {
    return await request<ForecastEntry[]>(
      `/forecasts/${locationId}${force ? "?force=true" : ""}`
    );
  } catch (err) {
    if (err instanceof ApiError && err.kind === "not_found") return null;
    throw err;
  }
}

/**
 * Past 3 days + current hourly data for a saved location, used by
 * the Weather Analysis charts. Returns null on "nothing stored yet"
 * (same convention as getForecast) rather than throwing, so the UI
 * can show a distinct loading/empty state.
 */
export async function getForecastHistory(
  locationId: number
): Promise<ForecastEntry[] | null> {
  try {
    return await request<ForecastEntry[]>(`/forecasts/${locationId}/history`);
  } catch (err) {
    if (err instanceof ApiError && err.kind === "not_found") return null;
    throw err;
  }
}

/** The most recently saved location, used as the default view on load. */
export function pickDefaultLocation(
  locations: SavedLocation[]
): SavedLocation | null {
  if (locations.length === 0) return null;
  // /locations has no explicit ordering guarantee; `id` is a serial
  // primary key, so the highest id is the most recently saved row.
  return locations.reduce((latest, loc) => (loc.id > latest.id ? loc : latest));
}


export async function reverseGeocode(latitude: number, longitude: number): Promise<{
  name: string;
  admin1: string | null;
  country: string | null;
}> {
  return request(`/locations/reverse?latitude=${latitude}&longitude=${longitude}`);
}


/**
 * Sends the full conversation so far (including the newest user
 * message) and gets back the assistant's reply. The backend is
 * stateless — we resend the whole history every time, same as any
 * LLM API. The frontend owns the running message list.
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  return request<ChatResponse>("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
}