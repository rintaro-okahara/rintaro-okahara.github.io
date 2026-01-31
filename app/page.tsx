import Link from "next/link";

import { latestNews } from "@/content/news";

export default function Top() {
  return (
    <main className="">
      <div className="flex min-h-[100dvh] items-center">
        <h2 className="w-full">
          <ul className="ml-[10%] w-[80%] max-w-[45rem] space-y-10 text-left text-4xl tracking-tight md:text-5xl">
            <li>
              <span className="mr-3 text-zinc-500">⋊</span>
              AI Researcher
            </li>
            <li>
              <span className="mr-3 text-zinc-500">⋊</span>
              Software Engineer
            </li>
            <li>
              <span className="mr-3 text-zinc-500">⋊</span>
              UI/UX Designer
            </li>
          </ul>
        </h2>
      </div>
      <aside className="absolute right-6 top-[calc(100dvh-1.5rem)] z-40 w-[16rem] -translate-y-full">
        <Link
          href={latestNews.href}
          className="block rounded-xl border border-zinc-200/70 bg-white/80 p-4 text-sm text-zinc-900 shadow-sm backdrop-blur transition hover:border-zinc-300"
        >
          <p className="text-[0.7rem] tracking-[0.2em] text-zinc-500">INDEX</p>
          <p className="mt-2 text-xs text-zinc-500">{latestNews.date}</p>
          <p className="mt-1 text-base leading-snug">{latestNews.title}</p>
        </Link>
      </aside>
    </main>
  );
}
