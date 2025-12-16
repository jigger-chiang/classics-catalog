import { Loader2 } from "lucide-react";

export default function CocktailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-5xl items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-200" />
          <p className="text-sm text-zinc-400">Loading cocktails...</p>
        </div>
      </div>
    </div>
  );
}

