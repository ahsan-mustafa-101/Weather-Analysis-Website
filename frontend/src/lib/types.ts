/**
 * Types mirroring the FastAPI backend's response shapes.
 *
 * Note: /locations returns `id`, while /locations/search and
 * /locations/save return `location_id`. Both refer to the same
 * underlying locations.id column. We normalize everything to a
 * single `SavedLocation` / `LocationResult` shape with `id` in
 * lib/api.ts so the rest of the app never has to think about the
 * naming inconsistency.
 */

/** A location already saved in our database (from GET /locations). */
export interface SavedLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

/** A geocoding search candidate (from GET /locations/search), pre-normalization. */
export interface RawSearchResult {
  location_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

/** A geocoding search candidate, normalized to match SavedLocation's `id` field. */
export interface LocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

/** Response from POST /locations/save. */
export interface SaveLocationResponse {
  location_id: number;
  name: string;
  saved: boolean;
}

/**
 * A single hourly forecast entry (from GET /forecasts/{location_id}).
 * The first entry in the array returned by the API is treated as
 * "now" for the hero section; the rest populate the 24h strip.
 */
export interface ForecastEntry {
  timestamp: string; // ISO 8601 with the location's own UTC offset
  temperature: number;
  feels_like: number;
  weather_code: number;
  precipitation_probability: number;
  is_day: boolean;
}

/** Thrown by lib/api.ts for expected, UI-actionable failures (404s etc). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public kind: "not_found" | "network" | "server" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "ApiError";
  }
}
