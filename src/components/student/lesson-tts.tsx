"use client";

import * as React from "react";
import { Volume2, Pause, Play, Square, Gauge, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface LessonTTSProps {
  text: string;
  lessonTitle: string;
  /** default language hint: 'en' | 'ar' | 'fr' | 'es' */
  lang?: string;
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
  fr: "fr-FR",
  es: "es-ES",
};

/**
 * Text-to-Speech player for lesson content — browser-native Web Speech API.
 * Supports Arabic/English/French/Spanish, voice selection, speed control,
 * and sentence-level text highlighting (emotional reading via prosody rate).
 */
export function LessonTTS({ text, lessonTitle, lang = "en" }: LessonTTSProps) {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = React.useState<string>("");
  const [rate, setRate] = React.useState(1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentChunk, setCurrentChunk] = React.useState(-1);
  const [language, setLanguage] = React.useState(lang);

  // Split text into sentence-level chunks for highlighting
  const chunks = React.useMemo(() => {
    return text
      .split(/(?<=[.!?؟])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
  }, [text]);

  // Load available voices
  React.useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      // Auto-select a voice matching the language
      const langCode = LANG_MAP[language] || "en-US";
      const match = v.find((x) => x.lang.startsWith(langCode.split("-")[0]));
      if (match && !selectedVoice) setSelectedVoice(match.voiceURI);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, [language, selectedVoice]);

  const filteredVoices = React.useMemo(() => {
    const langCode = LANG_MAP[language] || "en-US";
    const prefix = langCode.split("-")[0];
    const matching = voices.filter((v) => v.lang.startsWith(prefix));
    return matching.length > 0 ? matching : voices;
  }, [voices, language]);

  const play = React.useCallback((startChunk = 0) => {
    window.speechSynthesis.cancel();
    setIsPlaying(true);

    const speakChunk = (idx: number) => {
      if (idx >= chunks.length) {
        setIsPlaying(false);
        setCurrentChunk(-1);
        return;
      }
      setCurrentChunk(idx);
      const utterance = new SpeechSynthesisUtterance(chunks[idx]);
      utterance.lang = LANG_MAP[language] || "en-US";
      utterance.rate = rate;
      if (selectedVoice) {
        const voice = voices.find((v) => v.voiceURI === selectedVoice);
        if (voice) utterance.voice = voice;
      }
      utterance.onend = () => speakChunk(idx + 1);
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentChunk(-1);
      };
      window.speechSynthesis.speak(utterance);
    };
    speakChunk(startChunk);
  }, [chunks, language, rate, selectedVoice, voices]);

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentChunk(-1);
  };

  // Auto-scroll to current chunk
  React.useEffect(() => {
    if (currentChunk >= 0) {
      const el = document.getElementById(`tts-chunk-${currentChunk}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentChunk]);

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-emerald-600" />
        <span className="text-sm font-semibold">Audio Reader — {lessonTitle}</span>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!isPlaying ? (
          <Button size="sm" onClick={() => play(0)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Play className="h-4 w-4" /> Play
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={pause} className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        {isPlaying && (
          <Button size="sm" variant="outline" onClick={resume} className="gap-2 hidden">
            <Play className="h-4 w-4" /> Resume
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={stop} className="gap-2 text-rose-600">
          <Square className="h-4 w-4" /> Stop
        </Button>

        {/* Language selector */}
        <div className="flex items-center gap-1.5">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <Select value={language} onValueChange={(v) => { setLanguage(v); stop(); }}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice selector */}
        {filteredVoices.length > 0 && (
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              {filteredVoices.map((v) => (
                <SelectItem key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(v) => setRate(v[0])}
            className="w-24"
          />
          <span className="text-xs tabular-nums text-muted-foreground">{rate.toFixed(1)}x</span>
        </div>
      </div>

      {/* Text with highlighting */}
      <div className="eng-scroll max-h-48 space-y-1 overflow-y-auto rounded-lg bg-background/60 p-3 text-sm leading-relaxed">
        {chunks.map((chunk, i) => (
          <span
            key={i}
            id={`tts-chunk-${i}`}
            className={cn(
              "cursor-pointer rounded px-0.5 transition-colors",
              i === currentChunk
                ? "bg-emerald-500/20 font-medium text-emerald-900 dark:text-emerald-200"
                : "text-muted-foreground hover:bg-muted",
            )}
            onClick={() => play(i)}
          >
            {chunk}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
