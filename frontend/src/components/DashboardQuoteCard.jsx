import React from "react";
import axios from "axios";
import { Loader2, Quote } from "lucide-react";

const QUOTE_API_URL = "https://api.freeapi.app/api/v1/public/quotes/quote/random";

const FALLBACK_QUOTE_TEXT = "Success is the sum of small efforts repeated day in and day out.";
const FALLBACK_QUOTE_AUTHOR = "sourav kumar";

const CACHE_KEY = "placementor_daily_motivation_quote_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function safeReadCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const createdAt = Number(parsed.createdAt);
    const quote = parsed.quote;

    if (!Number.isFinite(createdAt)) return null;
    if (!quote || typeof quote !== "object") return null;

    if (Date.now() - createdAt > CACHE_TTL_MS) return null;

    const text = typeof quote.text === "string" ? quote.text : "";
    const author = typeof quote.author === "string" ? quote.author : "";

    if (!text.trim()) return null;

    return {
      text,
      author: author.trim() ? author : FALLBACK_QUOTE_AUTHOR,
    };
  } catch {
    return null;
  }
}

function safeWriteCache(quote) {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        createdAt: Date.now(),
        quote,
      })
    );
  } catch {
    // ignore
  }
}

function normalizeApiResponse(data) {
  // API shape may vary; attempt robust extraction
  const payload = data?.data ?? data;
  const text =
    typeof payload?.content === "string"
      ? payload.content
      : typeof payload?.quoteText === "string"
        ? payload.quoteText
        : typeof payload?.text === "string"
          ? payload.text
          : typeof payload?.quote === "string"
            ? payload.quote
            : typeof payload?.value === "string"
              ? payload.value
              : "";

  const author =
    typeof payload?.author === "string"
      ? payload.author
      : typeof payload?.by === "string"
        ? payload.by
        : typeof payload?.name === "string"
          ? payload.name
          : "";

  if (!text.trim()) return null;

  return {
    text: text.trim(),
    author: author.trim() ? author.trim() : FALLBACK_QUOTE_AUTHOR,
  };
}

export default function DashboardQuoteCard() {
  const [status, setStatus] = React.useState("loading");
  const [quote, setQuote] = React.useState({
    text: FALLBACK_QUOTE_TEXT,
    author: FALLBACK_QUOTE_AUTHOR,
  });

  React.useEffect(() => {
    let isMounted = true;

    const cached = safeReadCache();
    if (cached) {
      setQuote(cached);
      setStatus("success");
      return;
    }

    const run = async () => {
      setStatus("loading");
      try {
        const res = await axios.get(QUOTE_API_URL, { timeout: 6000 });
        const normalized = normalizeApiResponse(res?.data);

        const nextQuote = normalized ?? {
          text: FALLBACK_QUOTE_TEXT,
          author: FALLBACK_QUOTE_AUTHOR,
        };

        if (!isMounted) return;
        setQuote(nextQuote);
        safeWriteCache(nextQuote);
        setStatus("success");
      } catch {
        if (!isMounted) return;
        setQuote({
          text: FALLBACK_QUOTE_TEXT,
          author: FALLBACK_QUOTE_AUTHOR,
        });
        setStatus("error");
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-r from-blue-500/25 to-purple-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
      />

      <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-purple-400/40 transition-all duration-300">
        <div className="p-5 md:p-6">
          {/* Header Icon */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm flex items-center justify-center">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                  💡 Daily Motivation
                </p>
              </div>
            </div>

            {status === "loading" ? (
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching...
              </span>
            ) : (
              <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200">
                Today
              </span>
            )}
          </div>

          <div className="mt-4">
            {status === "loading" ? (
              <div className="space-y-3">
                <div className="h-10 sm:h-12 rounded-xl bg-gray-200/70 dark:bg-gray-800/60 animate-pulse" />
                <div className="h-10 sm:h-12 rounded-xl bg-gray-200/70 dark:bg-gray-800/60 animate-pulse" />
                <div className="h-8 sm:h-9 w-2/3 rounded-xl bg-gray-200/70 dark:bg-gray-800/60 animate-pulse" />
              </div>
            ) : (
              <>
                <blockquote className="text-gray-900 dark:text-white text-base sm:text-lg leading-relaxed font-medium whitespace-pre-line">
                  “{quote.text}”
                </blockquote>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">
                    — {quote.author}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
