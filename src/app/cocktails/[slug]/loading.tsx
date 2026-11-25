import { Loader2 } from "lucide-react";

export default function CocktailDetailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-gold" strokeWidth={1.5} />
        <p className="font-serif text-lg italic text-muted">Mixing…</p>
      </div>
    </div>
  );
}
