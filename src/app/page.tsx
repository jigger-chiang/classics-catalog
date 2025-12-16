import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { ArrowRight } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export default function Home() {
  return (
    <div
      className={`${playfair.variable} relative min-h-screen overflow-hidden bg-black text-amber-100`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="order-2 mt-10 flex max-w-xl flex-col items-center gap-6 text-center lg:order-1 lg:items-start lg:text-left">
          <h1
            className="text-4xl font-semibold leading-tight text-amber-100 sm:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ready to get drunk?
          </h1>

          <div className="hidden flex-col gap-3 text-amber-100/85 lg:flex">
            <p
              className="text-2xl font-semibold sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Experience the Night
            </p>
            <p className="text-lg leading-relaxed sm:text-xl">
              Discover the finest cocktails and unforgettable moments. Your
              journey begins here.
          </p>
        </div>

          <Link
            href="/cocktails"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 px-8 py-3.5 text-lg font-semibold text-amber-100 transition-all duration-200 ease-in-out hover:bg-amber-100/10 hover:shadow-[0_10px_40px_rgba(255,200,0,0.2)] hover:scale-105"
          >
            Let&apos;s Go
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="order-1 flex w-full justify-center lg:order-2 lg:flex-1">
          <div className="relative aspect-square w-full max-w-[520px] overflow-hidden rounded-[3rem] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent shadow-[0_25px_90px_rgba(0,0,0,0.65)] sm:max-w-[620px]">
            <Image
              src="/hero-cocktail.jpg"
              alt="Cocktail glass"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 520px"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
