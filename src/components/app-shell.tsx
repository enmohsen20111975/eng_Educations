"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  ListChecks,
  Moon,
  Sun,
  GraduationCap,
  Trophy,
  ShieldCheck,
  Target,
  Award,
  Library,
  Languages,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppStore, type View } from "@/lib/store";
import { useLang, type Lang } from "@/lib/language-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  open: () => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-9 w-9" />;
  }
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const store = useAppStore();
  const { lang, setLang, t, dir } = useLang();
  const nav: NavItem[] = [
    { id: "home", label: t("home"), icon: LayoutDashboard, open: store.openHome },
    { id: "library", label: t("library"), icon: Library, open: store.openLibrary },
    { id: "certifications", label: t("certs"), icon: Award, open: store.openCertifications },
    { id: "curriculum", label: t("curriculum"), icon: BookOpen, open: store.openCurriculum },
    { id: "quiz", label: t("quiz"), icon: ListChecks, open: () => store.openQuiz(null) },
    { id: "tracker", label: t("coverage"), icon: Target, open: store.openTracker },
    { id: "progress", label: t("progress"), icon: Trophy, open: store.openProgress },
    { id: "admin", label: t("admin"), icon: ShieldCheck, open: () => store.openAdmin("sections") },
  ];

  React.useEffect(() => {
    document.documentElement.dir = dir();
    document.documentElement.lang = lang;
  }, [lang, dir]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          <button
            onClick={store.openHome}
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Engineer's Educations home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight">
                Engineer&rsquo;s Educations
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                Engineering Learning Platform
              </span>
            </span>
          </button>

          <nav className="ml-auto flex items-center gap-1">
            <TooltipProvider delayDuration={200}>
              {nav.map((item) => {
                const active = store.view === item.id;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={item.open}
                        className={cn(
                          "group inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden md:inline">{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="md:hidden">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            <div className="mx-1 h-6 w-px bg-border" />
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = React.useState(false);
  const langs: { code: Lang; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden md:inline">{langs.find((l) => l.code === lang)?.flag || "🌐"}</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-50 w-32 rounded-lg border border-border bg-popover p-1 shadow-lg">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                lang === l.code && "bg-primary/10 font-semibold text-primary",
              )}
            >
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AppFooter() {
  const store = useAppStore();
  return (
    <footer className="mt-auto border-t border-border bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Engineer&rsquo;s Educations</p>
            <p className="text-xs text-muted-foreground">
              23 disciplines · rich lessons · Generation Matrix question bank
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              store.openCurriculum();
            }}
            className="hover:text-foreground"
          >
            Curriculum
          </Link>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              store.openQuiz(null);
            }}
            className="hover:text-foreground"
          >
            Practice Quizzes
          </Link>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              store.openAdmin("matrix");
            }}
            className="hover:text-foreground"
          >
            Generation Matrix
          </Link>
          <span className="opacity-60">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
