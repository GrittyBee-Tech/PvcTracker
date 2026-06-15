"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyWards, setNearbyWards] = useState<Ward[] | null>(null);

  // Load States once upon initialization
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

  // Fetch LGAs automatically when the selected State shifts
  useEffect(() => {
    if (!selectedState) return;

    async function loadLgas() {
      setLoadingLgas(true);
      setError(null);
      setSelectedLga("");
      setLgas([]);

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

  // FIX: Derive 'wards' dynamically during the execution of the render phase.
  // This fully eliminates the third useEffect and saves your app from dual layouts.
  const wards = useMemo(() => {
    if (!selectedLga || lgas.length === 0) return [];
    const selected = lgas.find((item) => item.name === selectedLga);
    return selected?.wards ?? [];
  }, [selectedLga, lgas]);

  // Reset independent state flags inside the explicit button click or choice event interaction loops
  const handleSelectChange = (field: FieldName, value: string) => {
    setNearbyWards(null); // Clear out downstream nearby ward filters cleanly

    if (field === "state") {
      setSelectedState(value);

      // If the user cleared the state dropdown, reset the child states right here
      if (!value) {
        setLgas([]);
        setSelectedLga("");
      }
      return;
    }

    setSelectedLga(value);
  };

  const stateOptions = states;
  const lgaOptions = lgas.map((lga) => ({ name: lga.name, value: lga.name }));

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

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        {loadingStates || loadingLgas ? (
          <div className="h-48 flex items-center justify-center">
            <SpinnerLoader
              text={loadingStates ? "Loading states..." : "Loading LGAs..."}
            />
          </div>
        ) : (
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
