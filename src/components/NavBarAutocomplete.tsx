"use client";

import { useRouter, usePathname } from "next/navigation";
import { Compass, Menu, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function NavBarAutocomplete() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const menuBox = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  const getPageTitle = () => {
    if (pathname === "/mode") {
      return { icon: Compass, text: "Mode", subtitle: "Choose the vibe, we'll pour the list." };
    }
    if (pathname?.startsWith("/cocktails")) {
      return { icon: Sparkles, text: "Cocktail List" };
    }
    return null;
  };

  const pageInfo = getPageTitle();

  useEffect(() => {
    if (!showMenu) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        showMenu &&
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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (path: string) => {
    setShowMenu(false);
    router.push(path);
  };

  if (pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="relative">
          <button
            ref={menuButton}
            onClick={toggleMenu}
            className="flex items-center justify-center rounded-full p-2 text-amber-100 transition-all duration-200 ease-in-out hover:bg-white/10 hover:scale-110"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {showMenu && (
            <div
              ref={menuBox}
              className="absolute left-0 top-full z-50 mt-2 flex min-w-fit flex-col whitespace-nowrap rounded-2xl border border-amber-100/20 bg-zinc-950 py-2 shadow-xl backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => handleMenuClick("/")}
                className="w-full px-4 py-2.5 text-left text-sm text-amber-100 transition-all duration-200 ease-in-out first:rounded-t-2xl last:rounded-b-2xl hover:bg-amber-100/10"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleMenuClick("/cocktails")}
                className="w-full px-4 py-2.5 text-left text-sm text-amber-100 transition-all duration-200 ease-in-out first:rounded-t-2xl last:rounded-b-2xl hover:bg-amber-100/10"
              >
                Cocktail List
              </button>
              <button
                type="button"
                onClick={() => handleMenuClick("/mode")}
                className="w-full px-4 py-2.5 text-left text-sm text-amber-100 transition-all duration-200 ease-in-out first:rounded-t-2xl last:rounded-b-2xl hover:bg-amber-100/10"
              >
                Mode
              </button>
            </div>
          )}
        </div>
        {pageInfo && (
          <div className="flex items-center gap-2">
            {pageInfo.icon && (
              <pageInfo.icon className="h-4 w-4 text-amber-200" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-amber-100 uppercase tracking-wider">
                {pageInfo.text}
              </span>
              {pageInfo.subtitle && (
                <span className="text-xs text-zinc-400">{pageInfo.subtitle}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

