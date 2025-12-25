"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Navigate back to the cocktail list page
    router.push("/cocktails");
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:border-white/30 hover:bg-white/10 hover:scale-105"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to list
    </button>
  );
}

