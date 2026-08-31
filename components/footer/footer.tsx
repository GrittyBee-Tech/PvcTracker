import Link from "next/link";
import Logo from "../ui/Logo";
import { SOCIAL_LINKS } from "@/utils/constants/socials";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-border border-t px-6 lg:px-20 pt-12 pb-6 mt-20">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="font-dm-sans text-sm text-[#5C675D] max-w-xs leading-relaxed">
            PVC Waka helps citizens report issues, track support, and connect
            with trusted volunteers across communities.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-primary text-white font-dm-sans font-semibold px-5 py-2 rounded-lg mt-4 hover:bg-[#c9a84c] transition-colors"
          >
            Become a WAKA Ambassador
          </Link>

          <div className="flex items-center gap-3 pt-1">
            {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[#5C675D] hover:bg-primary hover:border-primary hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-space-grotesk text-base font-bold text-[#1A5C38] mb-4">
            Explore
          </h3>
          <ul className="space-y-2 font-dm-sans text-sm text-[#5C675D]">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/volunteer"
                className="hover:text-primary transition-colors"
              >
                Volunteer Program
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-space-grotesk text-base font-bold text-[#1A5C38] mb-4">
            Account
          </h3>
          <ul className="space-y-2 font-dm-sans text-sm text-[#5C675D]">
            <li>
              <Link
                href="/auth/register"
                className="hover:text-primary transition-colors"
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                href="/auth/login"
                className="hover:text-primary transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Report an Issue
              </Link>
            </li>
            <li>
              <a
                href="/PVC WAKA USER T & C.pdf"
                target="_blank"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-space-grotesk text-base font-bold text-[#1A5C38] mb-4">
            Contact
          </h3>
          <div className=" grid space-y-2 font-dm-sans text-sm text-[#5C675D]">
            <a href="mailto:info@abenolfoundation.org">
              info@abenolfoundation.org
            </a>
            <a href="mailto:support@pvcwaka.org" className="">
              support@pvcwaka.org
            </a>
            <p>
              <a href="tel:+2347055066284">+234 (0) 705 506 6284</a>
            </p>
            <p>Mon - Fri, 9:00am - 5:00pm</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-black font-dm-sans text-sm">
          © {year} PVC Waka. All rights reserved.
        </p>
        <p className="text-black font-dm-sans text-sm">
          Built by{" "}
          <a
            className="text-primary font-bold hover:underline"
            href="https://www.abenolfoundation.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            abenolfoundation.org
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
