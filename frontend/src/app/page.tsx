"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, CloudOff, Loader2} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";
import CurrentWeatherHero from "@/components/CurrentWeatherHero";
import ForecastStrip from "@/components/ForecastStrip";
import GlassPanel from "@/components/GlassPanel";
import RefreshButton from "@/components/RefreshButton";
import { useSettings } from "@/context/SettingsContext";
import SettingsMenu from "@/components/SettingsMenu";
import SceneBackground from "@/components/background/SceneBackground";
import Earth3D from "@/components/Earth3D";
import WeatherInsights from "@/components/WeatherInsights";
import WeatherAnalysis from "@/components/WeatherAnalysis";
import { getForecast, getForecastHistory, getLocations, pickDefaultLocation, saveLocation, reverseGeocode } from "@/lib/api";
import { getCurrentCoordinates, hasGrantedLocation, markAskedThisSession, markLocationGranted, hasAskedThisSession, GeolocationError } from "@/lib/geolocation";
import { ApiError, ForecastEntry, LocationResult, SavedLocation } from "@/lib/types";
import { getWeatherTheme } from "@/lib/weatherTheme";


type ViewState =
  | { status: "loading" }
  | { status: "empty" } // no saved locations at all yet
  | { status: "gathering"; location: SavedLocation } // saved, but scheduler hasn't populated a forecast yet
  | { status: "ready"; location: SavedLocation; current: ForecastEntry; upcoming: ForecastEntry[] }
  | { status: "error"; message: string };

export default function Home() {
  const [view, setView] = useState<ViewState>({ status: "loading" });
  const [isSelecting, setIsSelecting] = useState(false);
  const { backgroundEnabled } = useSettings();
  const [history, setHistory] = useState<ForecastEntry[] | null>(null);

  // Calm default scene while there's no live weather to react to yet
  // (loading / empty / gathering / error states).
  const theme =
    view.status === "ready"
      ? getWeatherTheme(view.current.weather_code, view.current.is_day)
      : { scene: "clear-night" as const, effects: [] as const };

  // Initial load: most recently saved location, per Stage 0 decision.
  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
    try {
      // Try geolocation first, once per browser ever.
      // Try geolocation if: user has permanently granted before, OR we
      // haven't asked this session yet (covers first-ever visit and any
      // fresh session after a prior denial).
      if (hasGrantedLocation() || !hasAskedThisSession()) {
        markAskedThisSession();
        try {
          const coords = await getCurrentCoordinates();
          markLocationGranted(); // success confirms permission is granted — remember permanently
          const place = await reverseGeocode(coords.latitude, coords.longitude);
          const saved = await saveLocation({
            name: place.name,
            latitude: coords.latitude,
            longitude: coords.longitude,
            admin1: place.admin1,
            country: place.country,
          });
          const location: SavedLocation = {
            id: saved.location_id,
            name: saved.name,
            latitude: coords.latitude,
            longitude: coords.longitude,
            admin1: place.admin1,
            country: place.country,
          };

          const forecast = await getForecast(location.id);
          if (cancelled) return;

          if (!forecast || forecast.length === 0) {
            setView({ status: "gathering", location });
            return;
          }

          const [current, ...upcoming] = forecast;
          setView({ status: "ready", location, current, upcoming });
          return;
        } catch (geoErr) {
          if (geoErr instanceof GeolocationError) {
            console.log(`Geolocation unavailable (${geoErr.reason}), falling back.`);
          }
          // No markLocationGranted() call here — denial/failure only
          // persists for this session (via markAskedThisSession above),
          // not permanently.
        }
      }

      // Existing fallback: most recently saved location.
      const locations = await getLocations();
      const defaultLocation = pickDefaultLocation(locations);
      if (!defaultLocation) {
        if (!cancelled) setView({ status: "empty" });
        return;
      }

      const forecast = await getForecast(defaultLocation.id);
      if (cancelled) return;

      if (!forecast || forecast.length === 0) {
        setView({ status: "gathering", location: defaultLocation });
        return;
      }

      const [current, ...upcoming] = forecast;
      setView({ status: "ready", location: defaultLocation, current, upcoming });
    } catch (err) {
      if (!cancelled) {
        setView({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Something went wrong loading the weather.",
        });
      }
    }
  }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelectLocation(result: LocationResult) {
    setIsSelecting(true);
    try {
      const saved = await saveLocation({
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        admin1: result.admin1,
        country: result.country,
      });
      const location: SavedLocation = {
        id: saved.location_id,
        name: saved.name,
        latitude: result.latitude,
        longitude: result.longitude,
        admin1: result.admin1,
        country: result.country,
      };

      const forecast = await getForecast(location.id);
      if (!forecast || forecast.length === 0) {
        setView({ status: "gathering", location });
        return;
      }

      const [current, ...upcoming] = forecast;
      setView({ status: "ready", location, current, upcoming });
    } catch (err) {
      setView({
        status: "error",
        message:
          err instanceof ApiError
            ? err.message
            : "Couldn't save that location. Try again.",
      });
    } finally {
      setIsSelecting(false);
    }
  }

  async function handleRefresh() {
    if (view.status !== "ready") return;
    try {
      const forecast = await getForecast(view.location.id, true);
      if (!forecast || forecast.length === 0) return;
      const [current, ...upcoming] = forecast;
      setView({ status: "ready", location: view.location, current, upcoming });

      // If your WeatherAnalysis/history wiring exists (per the flag
      // at the top), also refresh it here:
      // const historyData = await getForecastHistory(view.location.id);
      // setHistory(historyData);
    } catch {
      // A failed refresh shouldn't blank out data already on screen.
    }
  }

  useEffect(() => {
      if (view.status !== "ready") return;
      let cancelled = false;

      getForecastHistory(view.location.id)
        .then((data) => {
          if (!cancelled) setHistory(data);
        })
        .catch(() => {
          if (!cancelled) setHistory(null);
        });

      return () => {
        cancelled = true;
      };
    }, [view.status === "ready" ? view.location.id : null]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-16">
      <SceneBackground scene={theme.scene} effects={[...theme.effects]} enabled={backgroundEnabled} />

      <nav className="flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
        <Image
        src="/favicon.ico"
        alt=""
        width={24}
        height={24}
        className="rounded-md"
        />
        <span className="font-mono text-sm uppercase tracking-[0.3em] text-fog">WeatherDrop</span>
        </div>
        <div className="flex items-center gap-1">
          {view.status === "ready" && <RefreshButton onRefresh={handleRefresh} />}
          <SettingsMenu />
        </div>
      </nav>

      <SearchBar onSelect={handleSelectLocation} isSelecting={isSelecting} />

      <main className="flex w-full max-w-6xl flex-1 flex-col items-center gap-10">
        {view.status === "loading" && <LoadingState />}
        {view.status === "empty" && <EmptyState />}
        {view.status === "gathering" && <GatheringState location={view.location} />}
        {view.status === "error" && <ErrorState message={view.message} />}
        {view.status === "ready" && (
        <>
          <CurrentWeatherHero
            location={view.location}
            current={view.current}
            earthSlot={<Earth3D targetLongitude={view.location.longitude} />}
          />
          <ForecastStrip entries={view.upcoming} />
          <WeatherInsights current={view.current} />
          {history && history.length > 0 && <WeatherAnalysis history={history} />}
        </>
      )}
      </main>

      <footer className="mt-16 w-full max-w-6xl border-t border-white/5 py-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-fog/50">
          · Built by Ahsan Mustafa
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/ahsan-mustafa-101"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-fog/60 transition-colors duration-150 hover:text-mist"
          >
            <FaGithub className="h-5 w-5" />
          </a>

          <a
            href="https://www.linkedin.com/in/ahsan-mustafa101/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-fog/60 transition-colors duration-150 hover:text-mist"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>

          <a
            href="https://www.instagram.com/__ahsanmustafa/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-fog/60 transition-colors duration-150 hover:text-mist"
          >
            <FaInstagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
}




function LoadingState() {
  return (
    <GlassPanel className="flex w-full flex-col items-center gap-4 py-24 text-fog">
      <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.5} />
      <p className="font-light">Reading the sky...</p>
    </GlassPanel>
  );
}

function EmptyState() {
  return (
    <GlassPanel className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <CloudOff className="h-8 w-8 text-fog" strokeWidth={1.25} />
      <p className="text-lg font-light text-mist">No location yet</p>
      <p className="max-w-sm font-light text-fog">
        Search for a city above to see its current weather and 24-hour forecast.
      </p>
    </GlassPanel>
  );
}

function GatheringState({ location }: { location: SavedLocation }) {
  return (
    <GlassPanel className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-fog" strokeWidth={1.25} />
      <p className="text-lg font-light text-mist">Gathering weather for {location.name}</p>
      <p className="max-w-sm font-light text-fog">
        This location was just saved — its forecast will be ready in a moment.
      </p>
    </GlassPanel>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <GlassPanel className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <AlertTriangle className="h-8 w-8 text-accent-storm" strokeWidth={1.25} />
      <p className="text-lg font-light text-mist">Couldn&apos;t load the weather</p>
      <p className="max-w-sm font-light text-fog">{message}</p>
    </GlassPanel>
  );
}