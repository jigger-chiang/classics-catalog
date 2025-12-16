import { Loader2 } from "lucide-react";

export default function CocktailDetailLoading() {
  return (
    <div className="min-h-screen bg-black text-amber-100">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-200" />
            <p className="text-sm text-zinc-400">Loading cocktail details...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

