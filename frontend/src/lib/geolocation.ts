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
const ASKED_KEY = "weatherdrop:geolocation-asked";

export function hasAskedForLocation(): boolean {
  if (typeof window === "undefined") return true; // SSR guard
  return localStorage.getItem(ASKED_KEY) === "true";
}

export function markLocationAsked(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASKED_KEY, "true");
}