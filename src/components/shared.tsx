"use client";

import * as React from "react";
import {
  Atom,
  Activity,
  Binary,
  Building2,
  Calculator,
  Car,
  Cpu,
  Droplets,
  Flame,
  FlaskConical,
  Gem,
  Leaf,
  Layers,
  Mountain,
  Move3d,
  Ruler,
  Settings2,
  SlidersHorizontal,
  Thermometer,
  TrendingUp,
  Waves,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCENT_GRADIENTS,
  BLOOM_STYLE,
  DIFFICULTY_STYLE,
  TYPE_STYLE,
} from "@/lib/student-key";
import type { BloomLevel, Difficulty, QuestionType } from "@/lib/types";

/** Map section.icon string -> lucide component. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  Calculator,
  Atom,
  FlaskConical,
  Thermometer,
  Waves,
  Layers,
  Move3d,
  Zap,
  Cpu,
  Binary,
  SlidersHorizontal,
  Gem,
  Wrench,
  Settings2,
  Flame,
  Activity,
  Ruler,
  Building2,
  Mountain,
  Car,
  Leaf,
  Droplets,
  TrendingUp,
};

export function SectionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = SECTION_ICONS[name] || Calculator;
  return <Cmp className={className} />;
}

export function AccentBadge({
  color,
  children,
  className,
}: {
  color?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        ACCENT_GRADIENTS[color || "emerald"]
          ? "bg-clip-text text-transparent"
          : "",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        DIFFICULTY_STYLE[value],
      )}
    >
      {value}
    </span>
  );
}

export function BloomBadge({ value }: { value: BloomLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BLOOM_STYLE[value],
      )}
    >
      {value}
    </span>
  );
}

export function TypeBadge({ value }: { value: QuestionType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TYPE_STYLE[value],
      )}
    >
      {value === "MultipleChoice" ? "MCQ" : "True/False"}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      {Icon ? (
        <Icon className="mb-3 h-10 w-10 text-muted-foreground" />
      ) : null}
      <p className="text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
            ACCENT_GRADIENTS[accent] || ACCENT_GRADIENTS.emerald,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/** Minimal, safe markdown-ish renderer for lesson content. Supports paragraphs,
 * - bullet lists, `inline code`, **bold**. Deliberately small (no external deps). */
export function MarkdownView({ content }: { content: string }) {
  const html = React.useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="eng-md text-sm leading-relaxed text-foreground/90"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(s: string): string {
  let out = escapeHtml(s);
  // inline code
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return out;
}

function renderMarkdown(src: string): string {
  if (!src) return "";
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let listOpen = false;
  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      i++;
      continue;
    }
    // bullet list item
    if (/^[-*]\s+/.test(line.trim())) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>`);
      i++;
      continue;
    }
    closeList();
    out.push(`<p>${renderInline(line)}</p>`);
    i++;
  }
  closeList();
  return out.join("");
}

/** A standard section header used inside views. */
export function ViewHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
