"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="));
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    document.cookie =
      "cookie_consent=true; path=/; max-age=" + 60 * 60 * 24 * 365;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-grey bg-white px-4 py-4 shadow-lg md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="font-heading text-sm text-navy">
          We use essential cookies to make this site work.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/cookies"
            className="font-heading text-sm font-semibold text-green hover:underline"
          >
            Learn more
          </Link>
          <button
            onClick={accept}
            className="rounded-xl bg-green px-5 py-2 font-heading text-sm font-bold text-white transition-colors hover:bg-green-dark"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
