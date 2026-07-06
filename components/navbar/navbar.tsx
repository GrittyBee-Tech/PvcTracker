"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../ui/Logo";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

const Navbar = () => {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navLinkClass = (href: string) =>
    `font-dm-sans font-bold transition-colors ${
      pathname === href
        ? "text-primary underline"
        : "text-[#5C675D] hover:text-primary hover:underline"
    }`;

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-6 lg:px-20">
          <Logo />

          <div className="hidden md:flex items-center gap-10 text-lg">
            <Link href="/about" className={navLinkClass("/about")}>
              About
            </Link>
            <Link href="/contact" className={navLinkClass("/contact")}>
              Contact
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg border border-[#DDE3DE] bg-primary px-7 py-2 font-dm-sans font-bold text-white transition-colors hover:bg-[#c9a84c]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#5C675D] transition-colors hover:bg-[#F2F6F2] md:hidden"
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={showMobileMenu}
            aria-controls="mobile-nav-menu"
          >
            {showMobileMenu ? (
              <IoClose className="text-2xl" />
            ) : (
              <GiHamburgerMenu className="text-xl" />
            )}
          </button>
        </div>
      </nav>

      {showMobileMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close mobile menu"
            onClick={closeMobileMenu}
          />

          <nav
            id="mobile-nav-menu"
            className="fixed inset-x-0 top-16 z-50 border-b border-border bg-white shadow-lg md:hidden"
          >
            <div className="grid gap-1 px-6 py-5">
              <Link
                href="/about"
                className="rounded-md px-2 py-2.5 font-dm-sans text-base font-bold text-[#1A5C38] hover:bg-[#F2F6F2]"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-2 py-2.5 font-dm-sans text-base font-bold text-[#1A5C38] hover:bg-[#F2F6F2]"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              <Link
                href="/auth/register"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-dm-sans font-bold text-white transition-colors hover:bg-[#c9a84c]"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </>
      )}

      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
