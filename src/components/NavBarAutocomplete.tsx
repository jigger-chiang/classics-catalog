"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const MENU_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/cocktails", label: "Cocktail List" },
  { path: "/mode", label: "Vibe" },
];

export function NavBarAutocomplete() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const menuBox = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuBox.current &&
        !menuBox.current.contains(target) &&
        menuButton.current &&
        !menuButton.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showMenu]);

  const handleMenuClick = (path: string) => {
    setShowMenu(false);
    router.push(path);
  };

  // Hidden on the home page and on cocktail detail pages (they have their own header)
  if (pathname === "/" || (pathname?.startsWith("/cocktails/") && pathname !== "/cocktails")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-1.5 sm:px-4">
        <div className="relative">
          <button
            ref={menuButton}
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-11 w-11 items-center justify-center text-ivory transition-colors hover:text-gold"
            aria-label="Menu"
            aria-expanded={showMenu}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
          {showMenu && (
            <div
              ref={menuBox}
              className="absolute left-1.5 top-full z-50 mt-1 flex min-w-44 flex-col border border-gold/30 bg-panel py-1"
            >
              {MENU_ITEMS.map((item) => {
                const active = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleMenuClick(item.path)}
                    className={`px-5 py-3 text-left font-serif text-lg transition-colors hover:text-gold ${
                      active ? "text-gold" : "text-ivory"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[15px] font-semibold tracking-[0.3em] text-ivory transition-colors hover:text-gold"
        >
          COCKTAIL CLASSICS
        </Link>

        <span className="h-11 w-11" aria-hidden="true" />
      </div>
    </nav>
  );
}
