"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { SpinnerLoader } from "@/components/ui/Loader";

type Ward = {
  name: string;
  latitude: number;
  longitude: number;
};

export type Lga = {
  name: string;
  wards: Ward[];
};

export type StateOption = {
  name: string;
  value: string;
};

type FieldName = "state" | "lga";

export default function FindCentreClient() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearbyWards, setNearbyWards] = useState<Ward[] | null>(null);
  const [findingNearby, setFindingNearby] = useState(false);

  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true);
      setError(null);

      try {
        const response = await fetch("/api/locations/states");
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to load states");
        }

        const payload = await response.json();
        setStates(payload?.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load states");
      } finally {
        setLoadingStates(false);
      }
    }

    loadStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setLgas([]);
      setSelectedLga("");
      setWards([]);
      return;
    }

    async function loadLgas() {
      setLoadingLgas(true);
      setError(null);
      setSelectedLga("");
      setLgas([]);
      setWards([]);

      try {
        const response = await fetch(
          `/api/locations/lgas?state=${encodeURIComponent(selectedState)}`,
        );

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to load LGAs");
        }

        const payload = await response.json();
        setLgas(payload?.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load LGAs");
      } finally {
        setLoadingLgas(false);
      }
    }

    loadLgas();
  }, [selectedState]);

  useEffect(() => {
    const selected = lgas.find((item) => item.name === selectedLga);
    setWards(selected?.wards ?? []);
    setNearbyWards(null);
  }, [selectedLga, lgas]);

  const handleSelectChange = (field: FieldName, value: string) => {
    if (field === "state") {
      setSelectedState(value);
      return;
    }

    setSelectedLga(value);
  };

  const stateOptions = states;
  const lgaOptions = lgas.map((lga) => ({ name: lga.name, value: lga.name }));

  function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setFindingNearby(true);
    setError(null);
    setNearbyWards(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // default radius 10 km
        const radiusKm = 10;
        const found = wards.filter((w) => {
          return (
            haversineDistance(latitude, longitude, w.latitude, w.longitude) <=
            radiusKm
          );
        });

        setNearbyWards(found);
        setViewMode("map");
        setFindingNearby(false);
      },
      (err) => {
        setError(err.message || "Failed to get location");
        setFindingNearby(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          name="state"
          label="State"
          options={stateOptions}
          value={selectedState}
          onChange={handleSelectChange}
          placeholder={loadingStates ? "Loading states..." : "Select a state"}
        />
        <Select
          name="lga"
          label="Local Government Area"
          options={lgaOptions}
          value={selectedLga}
          onChange={handleSelectChange}
          placeholder={selectedState ? "Select an LGA" : "Select a state first"}
          selectClassName={!selectedState ? "opacity-60" : ""}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* <div className="flex items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-full border bg-white">
          <button
            className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary text-white" : "text-primary"}`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
          <button
            className={`px-3 py-2 text-sm ${viewMode === "map" ? "bg-primary text-white" : "text-primary"}`}
            onClick={() => setViewMode("map")}
          >
            Map
          </button>
        </div>

        <button
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white"
          onClick={handleFindNearby}
          disabled={findingNearby || wards.length === 0}
        >
          {findingNearby ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Finding...
            </>
          ) : (
            "Find wards around my location"
          )}
        </button>
      </div> */}

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        {loadingStates || loadingLgas ? (
          <div className="h-48 flex items-center justify-center">
            <SpinnerLoader
              text={loadingStates ? "Loading states..." : "Loading LGAs..."}
            />
          </div>
        ) : (
          // ) : viewMode === "map" ? (
          //   <FindCentreWithMap
          //     wards={nearbyWards ?? wards}
          //     userLocation={userLocation}
          //     highlight={nearbyWards ?? undefined}
          //   />
          // ) :
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Wards</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedLga
                    ? `Showing wards for ${selectedLga}`
                    : selectedState
                      ? "Select an LGA to display wards."
                      : "Choose a state and LGA to see ward locations."}
                </p>
              </div>
            </div>

            {selectedLga &&
            (nearbyWards ? nearbyWards.length === 0 : wards.length === 0) ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                No wards were found for this LGA or within your search radius.
              </div>
            ) : selectedLga ? (
              <ul className="space-y-3">
                {(nearbyWards ?? wards).map((ward) => (
                  <li
                    key={ward.name}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-slate-900">
                        {ward.name}
                      </span>
                      <a
                        className="text-sm font-medium text-primary underline"
                        href={`https://www.google.com/maps/search/?api=1&query=${ward.latitude},${ward.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                Pick a state and LGA to load wards.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
