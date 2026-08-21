import { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

type SocialLink = {
  name: string;
  href: string;
  icon: IconType;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/abenolng",
    icon: FaFacebookF as IconType,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/abenolng/",
    icon: FaInstagram as IconType,
  },
  {
    name: "X",
    href: "https://x.com/Abenolng",
    icon: FaXTwitter as IconType,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@abenolng",
    icon: FaTiktok as IconType,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@abenolng",
    icon: FaYoutube as IconType,
  },
];
