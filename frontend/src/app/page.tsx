"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, CloudOff, Loader2} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";
import CurrentWeatherHero from "@/components/CurrentWeatherHero";
import ForecastStrip from "@/components/ForecastStrip";
import GlassPanel from "@/components/GlassPanel";
import BackgroundToggle from "@/components/BackgroundToggle";
import SettingsMenu from "@/components/SettingsMenu";
import SceneBackground from "@/components/background/SceneBackground";
import Earth3D from "@/components/Earth3D";
import { getForecast, getLocations, pickDefaultLocation, saveLocation } from "@/lib/api";
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
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);

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
          <BackgroundToggle
            enabled={backgroundEnabled}
            onToggle={() => setBackgroundEnabled((v) => !v)}
          />
          {/* Real dropdown now — see SettingsMenu.tsx (still placeholder content per Stage 0, but no longer a dead button). */}
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