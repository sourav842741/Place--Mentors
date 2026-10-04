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
    <div className="h-full bg-surface border border-border rounded-xl shadow-subtle p-5 md:p-6 flex flex-col justify-between">
      {/* Header Icon */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                Daily Motivation
              </p>
            </div>
          </div>

          {status === "loading" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-subtle">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Fetching...
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border">
              Today
            </span>
          )}
        </div>

        <div className="mt-4">
          {status === "loading" ? (
            <div className="space-y-2.5">
              <div className="h-4 rounded bg-surface-2 animate-pulse w-full" />
              <div className="h-4 rounded bg-surface-2 animate-pulse w-4/5" />
              <div className="h-4 rounded bg-surface-2 animate-pulse w-1/2" />
            </div>
          ) : (
            <blockquote className="text-text text-sm sm:text-base leading-relaxed font-medium">
              "{quote.text}"
            </blockquote>
          )}
        </div>
      </div>

      {status !== "loading" && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted">
            — {quote.author}
          </span>
        </div>
      )}
    </div>
  );
}
