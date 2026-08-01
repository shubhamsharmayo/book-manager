import Link from "next/link";
import { BookOpen, Sparkles, LayoutGrid, RefreshCw, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a1042] px-4 py-16 sm:px-8">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-500/40 blur-[100px]" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/40 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col items-center justify-center text-center">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
          Your reading, organized
        </div>

        {/* Hero */}
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Every book you read,
          <br />
          <span className="bg-gradient-to-r from-fuchsia-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
            want to read, or finished
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-white/60 sm:text-lg">
          A simple shelf for your reading life. Track what's next, what you're
          in the middle of, and everything you've already finished — all in
          one place.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-lg border border-white/20 bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 backdrop-blur-sm transition hover:from-fuchsia-500 hover:to-indigo-500"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            Create an account
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left shadow-xl shadow-black/10 backdrop-blur-2xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/20 text-sky-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Track every status
            </h3>
            <p className="mt-1.5 text-sm text-white/50">
              Want to Read, Reading, or Completed — always know where each
              book stands.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left shadow-xl shadow-black/10 backdrop-blur-2xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20 text-amber-200">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Tag and organize
            </h3>
            <p className="mt-1.5 text-sm text-white/50">
              Add tags like fiction or favorites to find the right book at a
              glance.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left shadow-xl shadow-black/10 backdrop-blur-2xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Update anytime
            </h3>
            <p className="mt-1.5 text-sm text-white/50">
              Edit details or move a book to a new status the moment you
              pick it back up.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}