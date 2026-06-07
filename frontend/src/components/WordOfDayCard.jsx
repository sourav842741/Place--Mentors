import React from "react";
import { BookOpen, Copy, Share2, Bookmark, Check } from "lucide-react";

import { getWordOfTheDay } from "@/data/wordOfDay";

function useToast(timeoutMs = 1800) {
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), timeoutMs);
    return () => window.clearTimeout(t);
  }, [toast, timeoutMs]);

  return { toast, setToast };
}

const LS_KEY = "placementor_saved_words_v1";

function readSaved() {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeSaved(list) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function difficultyToStyles(difficulty) {
  switch (difficulty) {
    case "Beginner":
      return {
        badge: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        dot: "from-green-500 to-emerald-500",
      };
    case "Advanced":
      return {
        badge: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
        dot: "from-red-500 to-orange-500",
      };
    case "Intermediate":
    default:
      return {
        badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
        dot: "from-yellow-500 to-amber-500",
      };
  }
}

function WordSavedModalScaffold({ open, onClose }) {
  if (!open) return null;

  // Hidden for now (scaffold only). Kept minimal to avoid dashboard clutter.
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 p-4" />
    </div>
  );
}

export default function WordOfDayCard() {
  const [word, setWord] = React.useState(() => {
  const saved = localStorage.getItem("word_of_day_v1");

  if (saved) {
    const data = JSON.parse(saved);

    const diff = Date.now() - data.timestamp;

    if (diff < 24 * 60 * 60 * 1000) {
      return data.word;
    }
  }

  const newWord = getWordOfTheDay(new Date());

  localStorage.setItem(
    "word_of_day_v1",
    JSON.stringify({
      word: newWord,
      timestamp: Date.now(),
    })
  );

  return newWord;
});

React.useEffect(() => {
  const saved = localStorage.getItem("word_of_day_v1");

  if (!saved) return;

  const data = JSON.parse(saved);

  const diff = Date.now() - data.timestamp;

  if (diff >= 24 * 60 * 60 * 1000) {
    const newWord = getWordOfTheDay(new Date());

    localStorage.setItem(
      "word_of_day_v1",
      JSON.stringify({
        word: newWord,
        timestamp: Date.now(),
      })
    );

    setWord(newWord);
  }
}, []);

  const { toast, setToast } = useToast();

  const [isSaved, setIsSaved] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const saved = readSaved();
    setIsSaved(
      saved.some(
        (w) => String(w?.word || "").toLowerCase() === String(word?.word || "").toLowerCase()
      )
    );
  }, [word?.word]);

  const styles = difficultyToStyles(word.difficulty);

  const onCopy = async () => {
    const text = `Word of the Day: ${word.word}\nMeaning: ${word.meaning}\nExample: ${word.example}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast({ type: "success", message: "Word copied successfully" });
    } catch {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setToast({ type: "success", message: "Word copied successfully" });
      } catch {
        setToast({ type: "error", message: "Copy failed" });
      }
    }
  };

  const onSave = () => {
    const saved = readSaved();
    const exists = saved.some(
      (w) => String(w?.word || "").toLowerCase() === String(word?.word || "").toLowerCase()
    );

    if (exists) {
      setToast({ type: "success", message: "Already saved" });
      setIsSaved(true);
      return;
    }

    const next = [
      ...saved,
      {
        word: word.word,
        meaning: word.meaning,
        example: word.example,
        difficulty: word.difficulty,
        category: word.category,
        savedAt: new Date().toISOString(),
      },
    ];

    writeSaved(next);
    setIsSaved(true);
    setToast({ type: "success", message: "Word saved successfully" });
  };

  const onShare = async () => {
    const shareData = {
      title: "Placementor - Word of the Day",
      text: `${word.word}: ${word.meaning}\nExample: ${word.example}`,
      url: window.location?.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
      }
      setToast({ type: "success", message: "Share ready" });
    } catch {
      // ignore
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 h-44 w-44 rounded-full bg-gradient-to-r from-purple-500/25 to-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur-3xl"
      />

      <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-purple-400/40 transition-all duration-300">
        <div className="p-4 md:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                  Word of the Day
                </p>
                <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                  Improve Communication Skills
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full ${styles.badge}`}
              >
                {word.difficulty}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {word.word}
                </h3>
                <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200">
                  {word.category}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800 dark:text-gray-100">Meaning:</span>{" "}
                {word.meaning}
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              <span className="font-semibold text-gray-800 dark:text-gray-100">Example:</span> “
              {word.example}”
            </p>

            <div className="flex flex-wrap gap-2">
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}
              >
                {word.difficulty}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200">
                {word.category}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
              >
                <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">Copy</span>
              </button>

              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
              >
                {isSaved ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                )}
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  {isSaved ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/15 hover:to-indigo-500/15 transition-all duration-200"
              aria-label="Share word"
            >
              <Share2 className="w-4 h-4 text-gray-800 dark:text-gray-100" />
            </button>
          </div>

          {/* Hidden scaffold modal */}
          <WordSavedModalScaffold open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>

        {/* Toast */}
        {toast?.message ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
            <div className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs shadow-lg">
              {toast.message}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
