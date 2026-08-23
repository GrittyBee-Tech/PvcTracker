"use client";

import { useState } from "react";
import { Check, Crown, Gem, Handshake, Heart, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SOCIAL_LINKS } from "@/utils/constants/socials";

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
    name: "The Spark",
    amount: 1000,
    tagline: "If 1,000 people donate ₦1,000 monthly, here is what we can do.",
    perks: [
      "8 months of free pads - a girl gets to stay in class, not at home.",
      "One borehole — a village stops walking miles for water.",
      "One surgery —a child gets the chance to live.",
      "Sponsor 3 months mentorship for secondary school students",
    ],
    icon: Heart,
  },
  {
    id: "supporter",
    name: "The Builder",
    amount: 5000,
    tagline: "If 1,000 people donate ₦5,000 monthly, here is what we can do.",
    perks: [
      "12 months of free pads — a girl gets to stay in class, not at home.",
      "3 boreholes — clean water reaches 3 communities for good.",
      "3 surgeries — 3 children get the chance to live.",
      "One university empowered — a whole campus of students mentored.",
      "3 months of mentorship — teenagers guided away from shortcuts.",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    id: "champion",
    name: "The Changemaker",
    amount: 10000,
    tagline: "If 1,000 people donate ₦10,000 monthly, here is what we can do.",
    perks: [
      "12 months of free pads — a girl gets to stay in class, not at home.",
      "5 boreholes across the country — clean water where it's needed most.",
      "5 surgeries, in private and public hospitals — no child turned away.",
      "2 universities empowered — mentorship reaching further.",
      "9 months of mentorship — teenagers guided away from shortcuts across Nigeria.",
      "6 months of active Youth civic sensitisation programs.",
    ],
    icon: Crown,
  },
  {
    id: "legend",
    name: "The Legacy Circle",
    amount: 50000,
    tagline: "If 1,000 people donate ₦50,000 monthly, here is what we can do.",
    perks: [
      "12 months of free pads — a girl gets to stay in class, not at home.",
      "10 boreholes across the country — clean water becomes routine.",
      "10 surgeries, in private and public hospitals — no child turned away.",
      "9 universities empowered — a nationwide mentorship movement.",
      "12 months of mentorship — teenagers guided away from shortcuts across Nigeria.",
      "12 months of active Youth civic sensitisation programs.",
      "Grants for 10 retired teachers with small businesses",
    ],
    icon: Gem,
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
          Partner with ABENOL Foundation
        </div>
        <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold text-primary">
          Give a Little Every Month,Change a Life, All Year.
        </h1>
        <p className="font-dm-sans text-sm md:text-base text-muted-foreground max-w-2xl">
          The ABENOL Giving Circle - a monthly gift that quietly becomes a
          borehole, a surgery, the reason hundreds of teenage girls never miss
          school, the empowerment for thousands of undergraduates in higher
          institutions and so much more. Your gift, your legacy.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
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

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
        <div>
          <p className="font-space-grotesk font-bold text-primary">
            Follow the movement
          </p>
          <p className="font-dm-sans text-sm text-muted-foreground">
            See where your partnership goes — follow ABENOL for updates from the
            field.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
              className="flex size-10 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
