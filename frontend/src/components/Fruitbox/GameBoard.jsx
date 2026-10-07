import React, { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Compass, Eye } from "lucide-react";
import { toast } from "sonner";

// High-fidelity CSS Flexbox Parser
export const parseFlexCSS = (css) => {
  const container = {
    display: "flex",
    position: "relative",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  };
  const fruitsStyle = {};

  if (!css || typeof css !== "string" || !css.trim()) {
    return { container, fruitsStyle };
  }

  const propMap = {
    "display": "display",
    "justify-content": "justifyContent",
    "align-items": "alignItems",
    "flex-direction": "flexDirection",
    "flex-wrap": "flexWrap",
    "align-content": "alignContent",
    "gap": "gap",
    "row-gap": "rowGap",
    "column-gap": "columnGap",
  };

  const fruitPropMap = {
    "order": "order",
    "align-self": "alignSelf",
    "flex-grow": "flexGrow",
    "flex-shrink": "flexShrink",
    "flex-basis": "flexBasis",
  };

  const applyDecls = (str, target, map) => {
    const lines = str.split(/[;\n]/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("/*") || line.startsWith("//")) continue;
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const prop = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).replace(/[;}]/g, "").trim();
      if (prop && val && map[prop]) {
        target[map[prop]] = val;
      }
    }
  };

  // 1. Parse rule blocks like `.strawberry { ... }` or `#fruitbox { ... }`
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const props = match[2].trim();

    if (selector.match(/^(body|\*|div|\.container|#pond|#box|#fruitbox)/i)) {
      applyDecls(props, container, propMap);
    } else {
      const classMatch = selector.match(/\.([a-z0-9_-]+)/i);
      if (classMatch) {
        const cls = classMatch[1].toLowerCase();
        fruitsStyle[cls] = fruitsStyle[cls] || {};
        applyDecls(props, fruitsStyle[cls], fruitPropMap);
      }
    }
  }

  // 2. Parse bare declarations outside of braces
  const bareDecls = css.replace(/([^{]+)\{([^}]+)\}/g, "").trim();
  if (bareDecls) {
    applyDecls(bareDecls, container, propMap);
  }

  return { container, fruitsStyle };
};

const GameBoard = ({ level, userCSS, isWon = false, className = "" }) => {
  const [showGuides, setShowGuides] = useState(false);

  // Compute Target Styles for Baskets
  const targetStyle = useMemo(() => {
    if (!level) return { container: { display: "flex" }, fruitsStyle: {} };
    const ans = level.acceptedAnswers?.[0] || "";
    const starter = level.starterCode || "display: flex;";
    const fullTargetCSS = `${starter}\n${ans}`;
    return parseFlexCSS(fullTargetCSS);
  }, [level]);

  // Compute User Styles for Interactive Fruits
  const userStyle = useMemo(() => {
    return parseFlexCSS(userCSS);
  }, [userCSS]);

  const fruits = level?.fruits || [];

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 dark:from-slate-900 dark:via-emerald-950/40 dark:to-slate-950 transition-all duration-300 ${className}`}
    >
      {/* Top Arena Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/10 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
            Garden Arena
          </span>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">• Live Flex Engine</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuides((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showGuides
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>{showGuides ? "Hide Axis Guides" : "Show Axis Guides"}</span>
          </button>
        </div>
      </div>

      {/* Main Board Arena Container */}
      <div className="relative w-full aspect-[4/3] min-h-[360px] max-h-[520px] p-4 sm:p-6 md:p-8 box-border overflow-hidden select-none">
        {/* Subtle Garden Grid Texture */}
        <div className="absolute inset-0 opacity-15 dark:opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Axis Guides Overlay (if toggled on) */}
        {showGuides && (
          <div className="absolute inset-4 sm:inset-6 md:inset-8 border-2 border-dashed border-emerald-500/30 rounded-2xl pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono px-2 py-1">
              <span>Main Axis (flex-start) ➔</span>
              <span>(flex-end)</span>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono px-2 py-1">
              <span>Cross Axis ⬇</span>
              <span>Container Bound</span>
            </div>
          </div>
        )}

        {/* LAYER 1: TARGET BASKETS (Aligned via target flexbox rules) */}
        <div
          className="absolute inset-4 sm:inset-6 md:inset-8 pointer-events-none box-border z-10"
          style={targetStyle.container}
        >
          {fruits.map((fruit, idx) => {
            const fruitClass = (fruit.class || fruit.type || `fruit${idx + 1}`).toLowerCase();
            const specificTargetStyle = targetStyle.fruitsStyle[fruitClass] || {};
            const fruitOrder = fruit.order || idx + 1;

            return (
              <div
                key={`basket-${fruitClass}-${idx}`}
                style={{
                  order: fruitOrder,
                  width: "72px",
                  height: "72px",
                  minWidth: "72px",
                  minHeight: "72px",
                  ...specificTargetStyle,
                }}
                className="flex items-center justify-center shrink-0 transition-all duration-500 ease-out m-1"
              >
                {/* Target Basket Token */}
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-dashed flex items-center justify-center relative transition-all duration-300 shadow-inner backdrop-blur-xs ${
                    isWon
                      ? "border-emerald-500 bg-emerald-500/20 shadow-emerald-500/30 scale-105"
                      : "border-amber-500/70 dark:border-amber-400/70 bg-amber-400/20 dark:bg-amber-500/15 shadow-amber-500/10"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl filter drop-shadow-xs select-none">🧺</span>
                  {/* Badge showing target fruit icon */}
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-amber-500/50 flex items-center justify-center text-xs shadow-xs">
                    {fruit.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* LAYER 2: INTERACTIVE FRUITS (Aligned via user's CSS flexbox rules) */}
        <div
          className="absolute inset-4 sm:inset-6 md:inset-8 box-border z-20"
          style={userStyle.container}
        >
          {fruits.map((fruit, idx) => {
            const fruitClass = (fruit.class || fruit.type || `fruit${idx + 1}`).toLowerCase();
            const specificUserStyle = userStyle.fruitsStyle[fruitClass] || {};
            const fruitOrder = fruit.order || idx + 1;

            return (
              <div
                key={`fruit-${fruitClass}-${idx}`}
                style={{
                  order: fruitOrder,
                  width: "72px",
                  height: "72px",
                  minWidth: "72px",
                  minHeight: "72px",
                  ...specificUserStyle,
                }}
                className="flex items-center justify-center shrink-0 transition-all duration-500 ease-out m-1"
              >
                {/* Fruit Token */}
                <div
                  onClick={() =>
                    toast.info(`${fruit.type} item • Order: ${fruitOrder}`)
                  }
                  title={`Click to inspect: ${fruit.type}`}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isWon
                      ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-emerald-500/40 animate-bounce ring-4 ring-emerald-400/40"
                      : "bg-white/95 dark:bg-slate-800/95 border border-white/80 dark:border-slate-700/80 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  }`}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none transform transition-transform group-hover:scale-115">
                    {fruit.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Victory Celebration Overlay */}
        {isWon && (
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center z-30 animate-in fade-in duration-300">
            <div className="bg-white/95 dark:bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center max-w-sm mx-4 transform animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Level Cleared! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
                All fruits successfully placed in their baskets!
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{level.xpReward} XP Earned</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
