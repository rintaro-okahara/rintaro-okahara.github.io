"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Linkedin, FileText } from "lucide-react";
import type { SVGProps } from "react";
import { useLanguage } from "@/app/LanguageProvider";

function MdiGithub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
      />
    </svg>
  );
}

function MdiLinkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
      />
    </svg>
  );
}

export function Header() {
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const { lang, toggleLang } = useLanguage();

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 40);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-40 flex w-full items-center justify-start gap-4 px-6 py-4 transition-opacity duration-300 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <h1 className="text-lg font-semibold tracking-tight">
        <Link href="/">Rintaro Okahara</Link>
      </h1>
      <div className="flex items-center gap-3 text-zinc-700">
        <button
          type="button"
          onClick={toggleLang}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-700 transition-colors hover:bg-zinc-100"
          aria-label="Toggle language"
        >
          {lang === "ja" ? "EN" : "JA"}
        </button>
        <a
          href="https://github.com/rintaro-okahara"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="transition-opacity hover:opacity-70"
        >
          <MdiGithub className="h-5 w-5" aria-hidden="true" />
        </a>
        <a
          href="https://www.linkedin.com/in/rintaro-okahara/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="transition-opacity hover:opacity-70"
        >
          <MdiLinkedin className="h-5 w-5" aria-hidden="true" />
        </a>
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>
    </header>
  );
}
