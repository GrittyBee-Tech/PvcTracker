import { IconType } from "react-icons";
import {
  BsFillGlobeAmericasFill,
  BsFillPostcardHeartFill,
  BsPcDisplayHorizontal,
} from "react-icons/bs";

type ObjectiveType = {
  title: string;
  icon: IconType;
  description: string;
  btntext?: string;
  btnLink?: string;
};

export const OBJECTIVE_SCHEMA: ObjectiveType[] = [
  {
    title: "Check and manage your PVC journey online",
    icon: BsFillGlobeAmericasFill as IconType,
    description:
      "Find accurate registration and collection information, locate nearby INEC centres in your local government area, and track your progress from one place.",
    btntext: "Create User Account",
    btnLink: "/auth/register",
  },
  {
    title: "Support your community as a WAKA Volunteer",
    icon: BsFillPostcardHeartFill as IconType,
    description:
      "Help people navigate PVC registration, provide trusted guidance, and assist multiple users under your dashboard so no eligible voter is left behind.",
    btntext: "Become a Volunteer",
    btnLink: "/volunteer",
  },
  {
    title: "Report delays and escalate unresolved PVC issues",
    icon: BsPcDisplayHorizontal as IconType,
    description:
      "Monitor your registration status, submit complaints when issues occur, and get support while cases are tracked and escalated for accountability.",
    btntext: "Report an Issue",
    btnLink: "/contact",
  },
];
