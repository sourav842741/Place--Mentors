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
        badge: "bg-success-soft text-success",
        dot: "bg-success",
      };
    case "Advanced":
      return {
        badge: "bg-danger-soft text-danger",
        dot: "bg-danger",
      };
    case "Intermediate":
    default:
      return {
        badge: "bg-accent-soft text-accent",
        dot: "bg-accent",
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
    <section className="relative">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle hover:shadow-card transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-tight text-text">
                Word of the Day
              </p>
              <p className="text-[11px] font-medium text-text-muted">
                Improve Communication Skills
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${styles.badge}`}
          >
            {word.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-text leading-tight tracking-tight">
              {word.word}
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-2 text-text-subtle border border-border">
              {word.category}
            </span>
          </div>

          <p className="text-xs text-text leading-relaxed">
            <span className="font-semibold text-text">Meaning:</span> {word.meaning}
          </p>

          <div className="p-2.5 rounded-lg bg-surface-2 border border-border">
            <p className="text-xs text-text-muted italic leading-relaxed">
              "{word.example}"
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium cursor-pointer transition"
            >
              <Copy className="w-3.5 h-3.5 text-text-subtle" />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium cursor-pointer transition"
            >
              {isSaved ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 text-text-subtle" />
              )}
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-subtle hover:text-text cursor-pointer transition"
            aria-label="Share word"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hidden scaffold modal */}
        <WordSavedModalScaffold open={modalOpen} onClose={() => setModalOpen(false)} />

        {/* Toast */}
        {toast?.message ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
            <div className="px-3 py-1 rounded-full bg-surface-2 text-text text-xs border border-border shadow-card font-medium">
              {toast.message}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
