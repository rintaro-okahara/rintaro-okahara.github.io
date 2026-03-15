"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../LanguageProvider";

type Section = {
  id: string;
  label: string;
  title: string;
  body: string[];
};

export default function AboutPage() {
  const { lang } = useLanguage();

  const sectionsByLang: Record<"ja" | "en", Section[]> = {
    ja: [
      {
        id: "profile",
        label: "Profile",
        title: "Profile",
        body: [
          "2003年生まれ。鹿児島県出身。大学では深層学習、数理最適化を中心に研究を行う。",
        ],
      },
      {
        id: "role",
        label: "Current Role",
        title: "Current Role",
        body: [
          "ここから先もダミーの段落です。右側がスクロールする際の挙動を確認するために文章を追加しています。",
          "さらに段落を追加して、スクロールの長さを確保します。行数が増えることで実装が正しく効いているかが分かりやすくなります。",
        ],
      },
      {
        id: "focus",
        label: "Focus",
        title: "Focus",
        body: [
          "ダミーテキストが続きます。右側のカラムがスクロールする中で左のインジケータが追従するか確認してください。",
          "必要であればさらに増やしますので、希望の長さを教えてください。",
          "必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。必要であればさらに増やしますので、希望の長さを教えてください。",
        ],
      },
      {
        id: "contact",
        label: "Contact",
        title: "Contact",
        body: [
          "相談・コラボレーションのご連絡は、ヘッダーのリンクからどうぞ。",
          "ここもダミーの文章です。右側の長さを増やすために入れています。",
          "ここもダミーの文章です。右側の長さを増やすために入れています。",
          "ここもダミーの文章です。右側の長さを増やすために入れています。",
          "ここもダミーの文章です。右側の長さを増やすために入れています。",
          "ここもダミーの文章です。右側の長さを増やすために入れています。",
        ],
      },
    ],
    en: [
      {
        id: "profile",
        label: "Profile",
        title: "Profile",
        body: [
          "Born in 2003. From Kagoshima. At university, I focused on deep learning and mathematical optimization.",
        ],
      },
      {
        id: "role",
        label: "Current Role",
        title: "Current Role",
        body: [
          "This is placeholder text. It is here to validate the scroll behavior on the right column.",
          "Adding another paragraph to ensure sufficient scroll length and verify the indicator behavior.",
        ],
      },
      {
        id: "focus",
        label: "Focus",
        title: "Focus",
        body: [
          "More placeholder text. Check whether the left indicator follows the active section while scrolling.",
          "I can add more if you want a longer scroll length.",
          "I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length. I can add more if you want a longer scroll length.",
        ],
      },
      {
        id: "contact",
        label: "Contact",
        title: "Contact",
        body: [
          "For inquiries or collaboration, please use the links in the header.",
          "More placeholder text for scroll length.",
          "More placeholder text for scroll length.",
          "More placeholder text for scroll length.",
          "More placeholder text for scroll length.",
          "More placeholder text for scroll length.",
        ],
      },
    ],
  };

  const sections: Section[] = useMemo(() => sectionsByLang[lang], [lang]);
  const ui = {
    ja: {
      outline: "Outline",
      contactFooter: "相談・コラボレーションのご連絡は、ヘッダーのリンクからどうぞ。",
    },
    en: {
      outline: "Outline",
      contactFooter: "For inquiries or collaboration, please use the links in the header.",
    },
  } as const;

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const navRef = useRef<HTMLUListElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lineStyle, setLineStyle] = useState({ top: 0, height: 0, left: 0 });

  useEffect(() => {
    let ticking = false;
    const updateActive = () => {
      const positions = sectionRefs.current.map((section) => {
        if (!section) return Number.POSITIVE_INFINITY;
        const rect = section.getBoundingClientRect();
        return Math.abs(rect.top - 120);
      });
      const closest = positions.reduce(
        (best, value, index) => (value < best.value ? { index, value } : best),
        { index: 0, value: Number.POSITIVE_INFINITY }
      );
      setActiveIndex(closest.index);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  useEffect(() => {
    const updateLine = () => {
      const nav = navRef.current;
      if (!nav) return;
      const dots = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (dots.length < 2) return;
      const navRect = nav.getBoundingClientRect();
      const firstRect = dots[0].getBoundingClientRect();
      const lastRect = dots[dots.length - 1].getBoundingClientRect();
      const centerX = firstRect.left - navRect.left + firstRect.width / 2;
      const top = firstRect.top - navRect.top + firstRect.height;
      const bottom = lastRect.top - navRect.top;
      setLineStyle({
        top,
        height: Math.max(0, bottom - top),
        left: centerX,
      });
    };

    updateLine();
    window.addEventListener("resize", updateLine);
    return () => window.removeEventListener("resize", updateLine);
  }, [lang, sections.length]);

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        <aside className="relative hidden w-[35%] px-8 py-12 md:block">
          <div className="pointer-events-none absolute right-0 top-10 h-[calc(100%-5rem)] w-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="sticky top-12 flex h-[calc(100vh-6rem)] items-center pr-4 text-lg text-neutral-700 dark:text-neutral-300">
            <div className="w-full">
              <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {ui[lang].outline}
              </div>
              <div className="relative">
                <ul ref={navRef} className="relative space-y-10">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-0 w-px -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700"
                    style={{
                      top: lineStyle.top,
                      height: lineStyle.height,
                      left: lineStyle.left,
                    }}
                  />
                  {sections.map((section, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <li
                        key={section.id}
                        className="relative grid grid-cols-[24px_1fr] gap-x-4"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            sectionRefs.current[index]?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                          className="col-span-2 grid w-full cursor-pointer grid-cols-[24px_1fr] items-start gap-x-4 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                          aria-label={`${section.title}へ移動`}
                        >
                          <span className="relative z-10 flex items-start justify-center">
                            <span
                              ref={(el) => {
                                dotRefs.current[index] = el;
                              }}
                              className={`mt-1 h-4 w-4 rounded-full border ${
                                isActive
                                  ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100"
                                  : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
                              }`}
                            />
                          </span>
                          <div>
                            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                              {section.title}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {section.label}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex w-full items-start justify-center px-8 pb-16 pt-20 md:w-[65%]">
          <div className="w-full max-w-md text-center">
            {sections.map((section, index) => (
              <article
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                className={`${index === 0 ? "mt-5" : "mt-16"} scroll-mt-24`}
              >
                <h1
                  className={`text-3xl font-semibold leading-tight md:text-4xl ${
                    index === 0 ? "" : "text-2xl md:text-3xl"
                  }`}
                >
                  {section.title}
                </h1>
                {section.body.map((text, textIndex) => (
                  <p
                    key={`${section.id}-${textIndex}`}
                    className="mt-6 text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
                  >
                    {text}
                  </p>
                ))}
              </article>
            ))}

            <div className="mt-12 border-t border-neutral-200 pt-6 text-left dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {ui[lang].contactFooter}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
