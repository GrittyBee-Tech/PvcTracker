"use client";

import { useEffect, useState, useMemo } from "react";
import Select from "@/components/ui/Select";
import { SpinnerLoader } from "@/components/ui/Loader";

type Office = {
  officeName: string;
  address: string;
  pdfPage: string | number;
};

export type Lga = {
  name: string;
  value: string;
  offices: Office[];
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
        console.log(payload.data);
        setLgas(payload?.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load LGAs");
      } finally {
        setLoadingLgas(false);
      }
    }

    loadLgas();
  }, [selectedState]);

  const selectedLgaEntry = useMemo(() => {
    if (!selectedLga || lgas.length === 0) return undefined;
    return lgas.find((item) => item.value === selectedLga);
  }, [selectedLga, lgas]);

  const officeList = useMemo(
    () => selectedLgaEntry?.offices ?? [],
    [selectedLgaEntry],
  );

  const handleSelectChange = (field: FieldName, value: string) => {
    if (field === "state") {
      setSelectedState(value);
      if (!value) {
        setLgas([]);
        setSelectedLga("");
      }
      return;
    }

    setSelectedLga(value);
  };

  const stateOptions = states;
  const lgaOptions = lgas.map((lga) => ({ name: lga.name, value: lga.value }));

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
          disabled={!selectedState}
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
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedLga
                    ? `INEC centres for ${selectedLga}`
                    : selectedState
                      ? "Select an LGA to display INEC centre details."
                      : "Choose a state and LGA to find INEC centres."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedLga
                    ? `${officeList.length} centre${officeList.length === 1 ? "" : "s"} available`
                    : "The list will update when both state and LGA are selected."}
                </p>
              </div>
            </div>

            {selectedLga && officeList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
                No INEC centres were found for this LGA.
              </div>
            ) : selectedLga ? (
              <div className="space-y-3">
                {officeList.map((office) => (
                  <div
                    key={office.officeName}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {office.officeName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {office.address}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          PDF page: {office.pdfPage}
                        </p>
                      </div>
                      <a
                        className="inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          office.address,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open on Google Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
                Pick a state and LGA to load INEC centre information.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
