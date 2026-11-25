import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-ivory">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-12 sm:px-8 lg:flex-row lg:justify-between lg:gap-16">
        <div className="w-full max-w-[420px] border border-gold/55 p-[5px] lg:order-2 lg:max-w-[480px] lg:flex-1">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src="/hero-cocktail.jpg"
              alt="Cocktail glass"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 480px"
            />
          </div>
        </div>

        <div className="flex max-w-md flex-col items-center gap-6 text-center lg:order-1 lg:items-start lg:text-left">
          <span className="font-serif text-[15px] font-semibold tracking-[0.3em]">COCKTAIL CLASSICS</span>
          <h1 className="font-serif text-5xl font-normal italic leading-tight sm:text-6xl">
            Ready to get drunk?
          </h1>
          <p className="hidden font-serif text-xl leading-relaxed text-muted lg:block">
            Discover the finest cocktails and unforgettable moments. Your journey begins here.
          </p>
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/cocktails"
              className="inline-flex h-12 min-w-44 items-center justify-center border border-gold px-8 text-[12px] tracking-[0.3em] text-gold transition-colors hover:bg-gold/10 hover:text-gold-light"
            >
              LET&apos;S GO ›
            </Link>
            <Link
              href="/mode"
              className="inline-flex h-12 items-center justify-center px-4 text-[12px] tracking-[0.3em] text-muted transition-colors hover:text-ivory"
            >
              VIBE CHECK
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
