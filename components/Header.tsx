"use client";

import { Github, Linkedin, FileText } from "lucide-react";

export function Header() {
  return (
    <header className="flex w-full items-center justify-start gap-4 px-6 py-4">
      <h1 className="text-lg font-semibold tracking-tight">Rintaro Okahara</h1>
      <div className="flex items-center gap-3 text-zinc-700">
        <Github className="h-5 w-5" aria-hidden="true" />
        <Linkedin className="h-5 w-5" aria-hidden="true" />
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>
    </header>
  );
}
