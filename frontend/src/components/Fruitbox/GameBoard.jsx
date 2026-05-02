import React, { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
const GameBoard = ({ level, userCSS, isWon = false, className = "" }) => {
  const [containerStyle, setContainerStyle] = useState({});
  const [fruitStyles, setFruitStyles] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const boardRef = useRef(null);

  const parseCSS = useCallback((css) => {
    const container = {
      display: "flex !important",
      justifyContent: "flex-start",
      alignItems: "stretch",
      flexDirection: "row",
      flexWrap: "nowrap",
      gap: "0",
      height: "100%",
      position: "relative",
    };
    const fruitsStyle = {};

    if (!css.trim()) return { container, fruitsStyle };

    // Better parser
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const props = match[2].trim();

      // Container selectors (body, .container, *)
      if (selector.match(/^(body|\*|div|\.container)/i)) {
        const propPairs = props.split(";").filter((p) => p.trim());
        propPairs.forEach((pair) => {
          const [prop, value] = pair.split(":").map((p) => p.trim());
          if (
            prop &&
            value &&
            [
              "display",
              "justify-content",
              "align-items",
              "flex-direction",
              "flex-wrap",
              "gap",
              "height",
            ].includes(prop)
          ) {
            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            container[camelProp] = value;
          }
        });
      }

      // Fruit selectors
      const classMatch = selector.match(/\.([a-z-]+)/i);
      if (classMatch) {
        const cls = classMatch[1];
        fruitsStyle[cls] = fruitsStyle[cls] || {};
        const propPairs = props.split(";").filter((p) => p.trim());
        propPairs.forEach((pair) => {
          const [prop, value] = pair.split(":").map((p) => p.trim());
          if (prop && value && ["order", "align-self", "flex-grow", "flex-shrink"].includes(prop)) {
            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            fruitsStyle[cls][camelProp] = value;
          }
        });
      }
    }

    return { container, fruitsStyle };
  }, []);

  useEffect(() => {
    const styles = parseCSS(userCSS);
    setContainerStyle(styles.container);
    setFruitStyles(styles.fruitsStyle);
  }, [userCSS, parseCSS]);

  useEffect(() => {
    if (isWon) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isWon]);

  const getBasketPosition = (fruit, index) => ({
    left:
      fruit.targetX === "right"
        ? "calc(75% - 2rem)"
        : fruit.targetX === "center"
          ? "calc(50% - 2rem)"
          : "1rem",
    bottom:
      fruit.targetY === "bottom"
        ? "1rem"
        : fruit.targetY === "center"
          ? "calc(50% - 2rem)"
          : "calc(25% - 2rem)",
  });

  return (
    <div
      className={`relative w-full aspect-[4/3] max-w-3xl mx-auto shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-gradient-1 via-gradient-2 to-gradient-3 border-4 border-white/20 dark:border-slate-800/50 ${className}`}
    >
      {/* Arena Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_50%)] animate-pulse-slow" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-grid-slate-100 dark:bg-grid-slate-900 [background-size:40px_40px] bg-left-top [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_20%,black_60%)]" />
      </div>

      {/* Game Container */}
      <div
        ref={boardRef}
        className={`
          relative w-full h-full rounded-2xl flex items-stretch justify-start p-8 box-border
          transition-all duration-700 ease-out
          ${isWon ? "bg-gradient-to-br from-emerald-500/10 to-green-500/20 ring-8 ring-emerald-400/50 shadow-2xl shadow-emerald-500/25 animate-celebrate" : "bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl"}
        `}
        style={containerStyle}
      >
        {/* Baskets */}
        {level.fruits.map((fruit, index) => (
          <div
            key={`basket-${index}`}
            className={`
              absolute w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center
              border-4 backdrop-blur-sm
              bg-gradient-to-br from-amber-400/80 to-orange-400/80 dark:from-amber-600/70 dark:to-orange-600/70
              shadow-lg hover:shadow-xl transition-all duration-300 cursor-default
              ${fruit.targetX === "right" || fruit.targetY === "bottom" ? "animate-bounce-subtle" : ""}
            `}
            style={getBasketPosition(fruit, index)}
          >
            <span className="text-xl font-bold drop-shadow-md">🧺</span>
          </div>
        ))}

        {/* Fruits */}
        {level.fruits.map((fruit, index) => {
          const fruitClass = fruit.class || `fruit${index + 1}`;
          const baseStyle = {
            order: fruit.order || index + 1,
            width: "72px",
            height: "72px",
            fontSize: "2.2rem",
            display: "flex !important",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            willChange: "transform",
            ...fruitStyles[fruitClass],
          };

          return (
            <div
              key={`${fruitClass}-${index}`}
              className={`
                rounded-2xl shadow-2xl border-4 border-white/90 dark:border-slate-100/70
                backdrop-blur-xl flex items-center justify-center cursor-pointer
                hover:scale-110 active:scale-95 hover:shadow-3xl active:shadow-xl
                transition-all duration-300
                font-bold select-none drop-shadow-2xl
                ${isWon ? "animate-celebrate-fruit bg-gradient-to-br from-emerald-400/90 to-green-500/90 shadow-emerald-500/50 dark:shadow-emerald-400/40" : "bg-gradient-to-br from-orange-500/90 via-red-500/90 to-pink-500/90 shadow-lg hover:shadow-2xl dark:shadow-pink-500/40"}
                ${fruitClass}
              `}
              style={baseStyle}
              onClick={() => !isWon && toast(`${fruit.type} - Order: ${fruit.order || index + 1}`)}
            >
              {fruit.type}
            </div>
          );
        })}

        {/* Success Overlay */}
        {isWon && (
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-transparent backdrop-blur-md flex items-center justify-center">
            <div className="text-center p-8">
              <CheckCircle className="w-24 h-24 text-emerald-400 mx-auto mb-4 animate-ping drop-shadow-2xl" />
              <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Perfect!</h3>
              <div className="flex gap-3 justify-center">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-twinkle" />
                <Sparkles className="w-6 h-6 text-yellow-400 animate-twinkle" delay="0.1s" />
                <Sparkles className="w-6 h-6 text-yellow-300 animate-twinkle" delay="0.2s" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(2deg); }
          50% { transform: scale(1.08) rotate(-1deg); }
          75% { transform: scale(1.06) rotate(1deg); }
        }
        @keyframes celebrate-fruit {
          0% { transform: scale(1) rotate(0) translateY(0); }
          33% { transform: scale(1.2) rotate(360deg) translateY(-20px); }
          66% { transform: scale(1.1) rotate(720deg) translateY(-10px); }
          100% { transform: scale(1.05) rotate(1080deg) translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-celebrate {
          animation: celebrate 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }
        .animate-celebrate-fruit {
          animation: celebrate-fruit 1.5s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 1.2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GameBoard;
