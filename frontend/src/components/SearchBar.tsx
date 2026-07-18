"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { searchLocations } from "@/lib/api";
import { LocationResult } from "@/lib/types";

interface SearchBarProps {
  /** Called when the user picks a result. Parent owns save + forecast fetch. */
  onSelect: (location: LocationResult) => void;
  /** True while the parent is saving the picked location / fetching its forecast. */
  isSelecting?: boolean;
}

const DEBOUNCE_MS = 350;

export default function SearchBar({
  onSelect,
  isSelecting = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    debounceRef.current = setTimeout(async () => {
      if (trimmed.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const matches = await searchLocations(trimmed);
        setResults(matches);
        setIsOpen(true);
      } catch {
        // Network/server error mid-search: fail quiet, keep prior results hidden.
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(location: LocationResult) {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    onSelect(location);
  }

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <GlassPanel
        elevated={isFocused}
        className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 ease-out ${
          isFocused
            ? "scale-[1.02] shadow-[0_0_40px_rgba(94,234,212,0.12)]"
            : ""
        }`}
      >
        <Search className="h-5 w-5 shrink-0 text-fog" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search any city..."
          disabled={isSelecting}
          className="w-full bg-transparent text-lg font-light text-mist placeholder:text-fog/60 outline-none disabled:opacity-50"
        />
        {(isSearching || isSelecting) && (
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin text-fog"
            strokeWidth={1.5}
          />
        )}
      </GlassPanel>

      {showDropdown && (
        <GlassPanel
          elevated
          className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden p-2"
        >
          {results.length === 0 && !isSearching && (
            <p className="px-4 py-3 text-sm font-light text-fog">
              No cities found for &ldquo;{query}&rdquo;.
            </p>
          )}
          <ul>
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/[0.08]"
                >
                  <MapPin
                    className="h-4 w-4 shrink-0 text-fog"
                    strokeWidth={1.5}
                  />
                  <span className="font-light text-mist">{result.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}
    </div>
  );
}
