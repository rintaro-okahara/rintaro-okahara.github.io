"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, FileText } from "lucide-react";

export function Header() {
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

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
        <Github className="h-5 w-5" aria-hidden="true" />
        <Linkedin className="h-5 w-5" aria-hidden="true" />
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>
    </header>
  );
}
