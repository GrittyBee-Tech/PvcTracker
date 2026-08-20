"use client";

import { useState } from "react";
import { Check, Crown, Handshake, Heart, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DONATE_URL = "https://bit.ly/donatetoABENOL";

type Plan = {
  id: string;
  name: string;
  amount: number;
  tagline: string;
  perks: string[];
  icon: LucideIcon;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    amount: 1000,
    tagline: "Get involved and keep the movement going.",
    perks: [
      "Supports 1 citizen's PVC journey each month",
      "Partner badge on your profile",
      "Monthly impact newsletter",
    ],
    icon: Heart,
  },
  {
    id: "supporter",
    name: "Supporter",
    amount: 5000,
    tagline: "Fund a full community drive every month.",
    perks: [
      "Supports up to 5 citizens each month",
      "Everything in Starter",
      "Early access to volunteer campaigns",
      "Name listed on our partners wall",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    id: "champion",
    name: "Champion",
    amount: 10000,
    tagline: "Power registration centres across a whole state.",
    perks: [
      "Supports up to 12 citizens each month",
      "Everything in Supporter",
      "Quarterly impact report from the field",
      "Direct line to the ABENOL partnerships team",
    ],
    icon: Crown,
  },
];

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function PartnerPlans() {
  const [selectedId, setSelectedId] = useState(
    plans.find((plan) => plan.popular)?.id ?? plans[0].id,
  );
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-primary">
          <Handshake className="size-4" />
          Partner with PVC Waka
        </div>
        <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold text-primary">
          Choose a monthly partnership
        </h1>
        <p className="font-dm-sans text-sm md:text-base text-muted-foreground max-w-2xl">
          Every subscription helps more Nigerians register, track and collect
          their PVC. Pick the tier that works for you — you can cancel or change
          it at any time.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedId;
          const Icon = plan.icon;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedId(plan.id)}
              aria-pressed={isSelected}
              className={`relative flex h-full flex-col rounded-2xl border p-6 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-card shadow-lg ring-2 ring-primary/30 md:-translate-y-1"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-accent text-primary"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="font-space-grotesk text-lg font-bold text-primary">
                  {plan.name}
                </h2>
              </div>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-space-grotesk text-3xl font-bold text-foreground">
                  {naira.format(plan.amount)}
                </span>
                <span className="font-dm-sans text-sm text-muted-foreground">
                  /month
                </span>
              </div>

              <p className="mt-2 font-dm-sans text-sm text-muted-foreground">
                {plan.tagline}
              </p>

              <ul className="mt-5 space-y-2.5 font-dm-sans text-sm text-foreground/80">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <span
                className={`mt-6 inline-flex items-center gap-2 font-dm-sans text-sm font-semibold ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border"
                  }`}
                >
                  {isSelected && <Check className="size-3" />}
                </span>
                {isSelected ? "Selected" : "Select this tier"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-space-grotesk font-bold text-primary">
            {selected.name} — {naira.format(selected.amount)} every month
          </p>
          <p className="font-dm-sans text-sm text-muted-foreground">
            You will be taken to our secure donation page to complete your
            partnership.
          </p>
        </div>
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-dm-sans font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <Heart className="size-4" />
          Donate
        </a>
      </div>
    </div>
  );
}
