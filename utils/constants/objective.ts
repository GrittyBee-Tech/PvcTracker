type ObjectiveType = {
  title: string;
  slug: string;
  description: string;
  btntext?: string;
  btnLink?: string;
};

export const HOWITWORKS_SCHEMA = [
  {
    title: "01 — CREATE YOUR ACCOUNT",
    slug: "Start for free",
    description:
      "Sign up and provide your basic information.",
    
  },
  {
    title: "02 — ADD YOUR PVC DETAILS",
  slug: "Connect your journey",
    description:
      "Connect your registration information so you can begin tracking your journey.",
  },
  {
    title: "03 — STAY INFORMED",
   slug: "Know what comes next",
    description:
      "Get relevant information, updates and support to help you move forward.",
   },
];


export const OBJECTIVE_SCHEMA: ObjectiveType[] = [
  {
    title: "Know where you stand",
    slug: "01",
    description:
      "Keep your PVC journey in one place. Track your registration and collection progress and understand what comes next.",
    btntext: "Track My PVC",
    btnLink: "/auth/register",
  },
  {
    title: "Support as a PVC WAKA Ambassador",
  slug: "02",
    description:
      "Help people navigate PVC registration, provide trusted guidance, and assist multiple users under your dashboard so no eligible voter is left behind.",
    btntext: "Become an Ambassador",
    btnLink: "/volunteer",
  },
  {
    title: "Get help when things go wrong",
   slug: "03",
    description:
      "Facing a delay, missing information or another challenge? Report an issue, seek guidance and find the right channel for support.",
    btntext: "Get Support",
    btnLink: "/contact",
  },
];


