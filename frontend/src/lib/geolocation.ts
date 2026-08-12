/**
 * Promise-wrapped browser Geolocation API. navigator.geolocation.
 * getCurrentPosition() is callback-based natively — this wraps it so
 * the rest of the app can just `await` it like everything else in
 * lib/api.ts.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type GeolocationFailureReason = "denied" | "unavailable" | "timeout" | "unsupported";

export class GeolocationError extends Error {
  constructor(public reason: GeolocationFailureReason) {
    super(`Geolocation failed: ${reason}`);
    this.name = "GeolocationError";
  }
}

export function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new GeolocationError("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new GeolocationError("denied"));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new GeolocationError("unavailable"));
        } else {
          reject(new GeolocationError("timeout"));
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Tracks whether we've already asked this browser for its location
 * once, so we don't re-prompt on every visit. Pure localStorage flag
 * — no backend involvement, this is a per-browser preference, not
 * account data.
 */
const GRANTED_KEY = "weatherdrop:geolocation-granted"; // localStorage — permanent
const SESSION_ASKED_KEY = "weatherdrop:geolocation-session-asked"; // sessionStorage — this session only
const LOCATION_ID_KEY = "weatherdrop:geolocation-location-id";

/** True forever, once the user has explicitly allowed location access. */
export function hasGrantedLocation(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GRANTED_KEY) === "true";
}

export function markLocationGranted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GRANTED_KEY, "true");
}

/** True only for the current tab/browser session — resets on next visit. */
export function hasAskedThisSession(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(SESSION_ASKED_KEY) === "true";
}

export function markAskedThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_ASKED_KEY, "true");
}

export function getSavedGeolocationId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCATION_ID_KEY);
  return raw ? Number(raw) : null;
}

export function setSavedGeolocationId(id: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_ID_KEY, String(id));
}