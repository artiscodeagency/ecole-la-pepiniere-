import { Link } from "react-router-dom";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary to-[#dfeaff] px-6 py-24 text-white lg:px-10 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-8 top-8 h-32 w-32 rounded-full border border-white/25 bg-white/12 shadow-[0_18px_50px_rgba(255,255,255,0.28)] backdrop-blur-sm ring-8 ring-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 right-10 h-24 w-24 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-20 top-12 h-16 w-16 rounded-full bg-secondary/30 blur-2xl"
      />

      <div className="relative mx-auto max-w-5xl text-center lg:text-left">
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="text-sm font-medium tracking-wide text-white/85">
              ADMISSIONS
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Construisons ensemble les premières étapes de son avenir.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Une école où les enfants grandissent avec confiance, autonomie et
              envie d’apprendre.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center rounded-btn bg-white px-6 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-surface-alt"
            >
              Découvrir les admissions
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-btn border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
