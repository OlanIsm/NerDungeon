import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
      <div>
        <h1 className="font-display text-4xl leading-tight text-accent sm:text-5xl">
          Knowledge is your greatest weapon.
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-muted">
          Your notes. Your next adventure. Nerdungeon is being built to turn your
          own study material into a dungeon where learning lights the way.
        </p>
        <Link href="/dashboard" className="game-button mt-7 w-full sm:w-auto">
          Visit Adventurer’s Hall
        </Link>
        <section aria-labelledby="preview-heading" className="mt-9 border-t border-line pt-6">
          <h2 id="preview-heading" className="font-display text-2xl">The adventure is taking shape.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            This is an early version of Nerdungeon. Your study space is here;
            dungeon creation and learning adventures are still being built.
          </p>
        </section>
      </div>
      <div className="dungeon-panel order-first p-2 md:order-last">
        <Image
          src="/art/dungeon-gate.webp"
          alt=""
          width={1086}
          height={1448}
          sizes="(max-width: 767px) 100vw, 420px"
          preload
          className="h-52 w-full object-cover object-[center_65%] sm:h-72 md:h-auto"
        />
      </div>
    </div>
  );
}
