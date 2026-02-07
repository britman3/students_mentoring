"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/your-options", label: "Your Options" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-0 font-heading text-xl font-extrabold tracking-tight text-navy md:text-2xl">
          A Very&nbsp;<span className="text-green">Fast</span>&nbsp;Sale
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-heading text-sm font-semibold transition-colors hover:text-green ${
                pathname === link.href ? "text-green" : "text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-offer"
            className="rounded-xl bg-green px-5 py-2.5 font-heading text-sm font-bold text-white transition-colors hover:bg-green-dark"
          >
            Get Offer
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-navy transition-transform ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-navy transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-navy transition-transform ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-[56px] z-40 bg-white transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 pt-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-lg px-4 py-3 font-heading text-lg font-semibold transition-colors hover:bg-light-grey ${
                pathname === link.href ? "text-green" : "text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-offer"
            onClick={() => setMobileOpen(false)}
            className="mt-4 rounded-xl bg-green px-5 py-3 text-center font-heading text-lg font-bold text-white transition-colors hover:bg-green-dark"
          >
            Get Offer
          </Link>
        </nav>
      </div>
    </header>
  );
}
