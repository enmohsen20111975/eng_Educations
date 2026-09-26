"use client";

import { create } from "zustand";

export type Lang = "en" | "ar" | "fr" | "es";

const T = {
  en: {
    home: "Home", library: "Library", certs: "Certs", curriculum: "Curriculum",
    quiz: "Quiz", coverage: "Coverage", progress: "Progress", admin: "Admin",
    knowledge: "Knowledge Library", practiceQuiz: "Practice Quiz",
    overallReadiness: "Overall readiness", fullTemplate: "Full-template lessons",
    kOs: "Knowledge Objects", readyQuestions: "Ready questions",
    play: "Play", pause: "Pause", stop: "Stop", audioReader: "Audio Reader",
    discipline: "Discipline / Certification", difficulty: "Difficulty",
    startQuiz: "Start Quiz", submitQuiz: "Submit Quiz", retake: "Retake",
    viewProgress: "View progress", browseCurriculum: "Browse Curriculum",
    takeQuiz: "Take a Quiz", dir: "ltr",
  },
  ar: {
    home: "الرئيسية", library: "المكتبة", certs: "الشهادات", curriculum: "المنهج",
    quiz: "اختبار", coverage: "التغطية", progress: "التقدم", admin: "الإدارة",
    knowledge: "مكتبة المعرفة", practiceQuiz: "اختبار تدريبي",
    overallReadiness: "الجاهزية الإجمالية", fullTemplate: "دروس كاملة القالب",
    kOs: "كائنات المعرفة", readyQuestions: "أسئلة جاهزة",
    play: "تشغيل", pause: "إيقاف مؤقت", stop: "إيقاف", audioReader: "القارئ الآلي",
    discipline: "التخصص / الشهادة", difficulty: "الصعوبة",
    startQuiz: "ابدأ الاختبار", submitQuiz: "إرسال", retake: "إعادة",
    viewProgress: "عرض التقدم", browseCurriculum: "تصفح المنهج",
    takeQuiz: "اختبار", dir: "rtl",
  },
  fr: {
    home: "Accueil", library: "Bibliothèque", certs: "Certifs", curriculum: "Programme",
    quiz: "Quiz", coverage: "Couverture", progress: "Progrès", admin: "Admin",
    knowledge: "Bibliothèque du Savoir", practiceQuiz: "Quiz d'Entraînement",
    overallReadiness: "Préparation globale", fullTemplate: "Leçons complètes",
    kOs: "Objets de Connaissance", readyQuestions: "Questions prêtes",
    play: "Lire", pause: "Pause", stop: "Arrêt", audioReader: "Lecteur Audio",
    discipline: "Discipline / Certification", difficulty: "Difficulté",
    startQuiz: "Démarrer", submitQuiz: "Soumettre", retake: "Reprendre",
    viewProgress: "Voir progrès", browseCurriculum: "Parcourir",
    takeQuiz: "Quiz", dir: "ltr",
  },
  es: {
    home: "Inicio", library: "Biblioteca", certs: "Certs", curriculum: "Currículo",
    quiz: "Examen", coverage: "Cobertura", progress: "Progreso", admin: "Admin",
    knowledge: "Biblioteca de Conocimiento", practiceQuiz: "Examen de Práctica",
    overallReadiness: "Preparación general", fullTemplate: "Lecciones completas",
    kOs: "Objetos de Conocimiento", readyQuestions: "Preguntas listas",
    play: "Reproducir", pause: "Pausa", stop: "Detener", audioReader: "Lector de Audio",
    discipline: "Disciplina / Certificación", difficulty: "Dificultad",
    startQuiz: "Iniciar", submitQuiz: "Enviar", retake: "Repetir",
    viewProgress: "Ver progreso", browseCurriculum: "Explorar currículo",
    takeQuiz: "Examen", dir: "ltr",
  },
} as const;

export type TranslationKey = keyof typeof T["en"];

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: () => "ltr" | "rtl";
}

export const useLang = create<LangState>((set, get) => ({
  lang: (typeof localStorage !== "undefined" && localStorage.getItem("eng_edu_lang") as Lang) || "en",
  setLang: (l) => {
    if (typeof localStorage !== "undefined") localStorage.setItem("eng_edu_lang", l);
    set({ lang: l });
  },
  t: (key) => T[get().lang]?.[key] ?? T.en[key] ?? key,
  dir: () => T[get().lang]?.dir === "rtl" ? "rtl" : "ltr",
}));
