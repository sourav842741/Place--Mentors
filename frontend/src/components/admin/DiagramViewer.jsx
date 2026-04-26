import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import architectureSvg from "../../assets/diagram/architecture-design.svg";
import architecturePng from "../../assets/diagram/architecture-design.png";

import erSvg from "../../assets/diagram/er-diagram.svg";
import erPng from "../../assets/diagram/er-diagram.png";

import flowSvg from "../../assets/diagram/flow-chart-pm.svg";
import flowPng from "../../assets/diagram/flow-chart-pm.png";
import {
  X,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize,
  Minimize,
  Copy,
  Check,
  Globe,
  LayoutTemplate,
  Database,
  GitBranch,
  Link2,
  Loader2,
  ImageIcon,
} from "lucide-react";

const diagrams = [
  {
    id: "architecture",
    title: "Architecture Diagram",
    icon: LayoutTemplate,
    svg: architectureSvg,
    png: architecturePng,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "er",
    title: "ER Diagram",
    icon: Database,
    svg: erSvg,
    png: erPng,
    accent: "from-violet-500 to-purple-600",
  },
  {
    id: "flowchart",
    title: "Flowchart Diagram",
    icon: GitBranch,
    svg: flowSvg,
    png: flowPng,
    accent: "from-amber-500 to-orange-600",
  },
];

const externalLinks = [
  {
    id: "postman",
    title: "Postman API Collection",
    description: "Full API collection for testing all backend endpoints",
    url: "https://souravkumar-7408410.postman.co/workspace/sourav-kumar's-Workspace~068384b5-c262-4314-8c57-2ad36050edc7/request/44025304-7b499f7b-07a5-4d6c-a473-4123632f6a7f?action=share&creator=44025304&active-environment=44025304-f8d68e60-3ea0-4a2e-8b06-36bc8e6aa3df",
    source: "Postman",
    sourceColor:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    icon: Link2,
    iconBg: "from-orange-500 to-red-500",
    hoverBorder: "hover:border-orange-500/30",
  },
  {
    id: "eraser-flowchart",
    title: "Eraser Flowchart",
    description: "Interactive system flowchart diagram on Eraser",
    url: "https://app.eraser.io/workspace/2m7V45cGCo6VcztZw2Va?origin=share",
    source: "Eraser",
    sourceColor:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: GitBranch,
    iconBg: "from-blue-500 to-cyan-500",
    hoverBorder: "hover:border-blue-500/30",
  },
  {
    id: "eraser-er",
    title: "Eraser ER Diagram",
    description: "Entity-Relationship diagram on Eraser workspace",
    url: "https://app.eraser.io/workspace/2ZK5J2LyTZc0RkFGfMBe",
    source: "Eraser",
    sourceColor:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Database,
    iconBg: "from-purple-500 to-pink-500",
    hoverBorder: "hover:border-purple-500/30",
  },
  {
    id: "eraser-architecture",
    title: "Eraser Architecture",
    description: "System architecture diagram on Eraser workspace",
    url: "https://app.eraser.io/workspace/bnF5czCy7w25MQru8F39",
    source: "Eraser",
    sourceColor:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: LayoutTemplate,
    iconBg: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-500/30",
  },
];

export default function DiagramViewer({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState("diagrams");
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [useSvg, setUseSvg] = useState(true);
  const [imgError, setImgError] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setLoading(true);
      setImgError(false);
    }
  }, [isOpen, activeTab, useSvg]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
        return;
      }
      if (activeSection !== "diagrams") return;

      if (e.key === "ArrowLeft") {
        setActiveTab((p) => (p > 0 ? p - 1 : diagrams.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveTab((p) => (p < diagrams.length - 1 ? p + 1 : 0));
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.1, isFullscreen ? 10 : 4));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.25, 0.25));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, activeSection, isFullscreen]);

  const handleMouseDown = useCallback(
    (e) => {
      if (zoom <= 1) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [zoom, pan],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, handleMouseUp, handleMouseMove]);

  const currentDiagram = diagrams[activeTab];
  const imageSrc =
    useSvg && !imgError ? currentDiagram?.svg : currentDiagram?.png;

  const MAX_ZOOM = isFullscreen ? 8 : 4;

  const handleZoomIn = () =>
    setZoom((z) => Math.min(z * 1.04, isFullscreen ? 10 : 4));

  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.04, 0.25));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitWidth = () => setZoom(isFullscreen ? 2 : 1.2);
  const handleFitScreen = () => setZoom(isFullscreen ? 1.5 : 0.85);
  const handleOriginalSize = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handlePrev = () =>
    setActiveTab((p) => (p > 0 ? p - 1 : diagrams.length - 1));
  const handleNext = () =>
    setActiveTab((p) => (p < diagrams.length - 1 ? p + 1 : 0));

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `${currentDiagram.id}-${useSvg ? "svg" : "png"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => window.open(imageSrc, "_blank");

  const handleCopyLink = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* noop */
    }
  };

  const handleImageError = () => {
    if (useSvg && !imgError) {
      setImgError(true);
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        /* noop */
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        /* noop */
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            ref={containerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`fixed top-0 right-0 h-full z-[70] bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-2xl border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col ${isFullscreen ? "w-full" : "w-full sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw]"}`}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    System Hub
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin only resources &amp; diagrams
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
                  <button
                    onClick={() => setActiveSection("diagrams")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeSection === "diagrams" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                  >
                    Diagrams
                  </button>
                  <button
                    onClick={() => setActiveSection("links")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeSection === "links" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                  >
                    Quick Links
                  </button>
                </div>
                <div className="sm:hidden">
                  <select
                    value={activeSection}
                    onChange={(e) => setActiveSection(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded-lg px-2 py-1.5 border-none outline-none"
                  >
                    <option value="diagrams">Diagrams</option>
                    <option value="links">Quick Links</option>
                  </select>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition text-gray-500 dark:text-gray-400 hover:text-red-500"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeSection === "diagrams" && (
                  <motion.div
                    key="diagrams"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    {/* Diagram Tabs */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto shrink-0">
                      {diagrams.map((d, i) => {
                        const Icon = d.icon;
                        const isActive = i === activeTab;
                        return (
                          <button
                            key={d.id}
                            onClick={() => setActiveTab(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive ? `bg-gradient-to-r ${d.accent} text-white shadow-lg` : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                          >
                            <Icon className="w-4 h-4" />
                            {d.title}
                          </button>
                        );
                      })}
                      <div className="ml-auto flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() => setUseSvg(true)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${useSvg ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          SVG
                        </button>
                        <button
                          onClick={() => setUseSvg(false)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!useSvg ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          PNG
                        </button>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-200 dark:border-gray-800 shrink-0 flex-wrap">
                      <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                        title="Reset"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleFitWidth}
                        className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-medium text-gray-600 dark:text-gray-400"
                      >
                        Fit Width
                      </button>
                      <button
                        onClick={handleFitScreen}
                        className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-medium text-gray-600 dark:text-gray-400"
                      >
                        Fit Screen
                      </button>
                      <button
                        onClick={handleOriginalSize}
                        className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-medium text-gray-600 dark:text-gray-400"
                      >
                        Original
                      </button>
                      <div className="ml-auto flex items-center gap-1">
                        <span className="text-xs text-gray-400 px-2">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={handleDownload}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleOpenNewTab}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image Viewer */}
                    <div className="flex-1 overflow-auto relative bg-gray-50 dark:bg-gray-950/50">
                      {/* Prev Button */}
                      <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Scrollable Canvas */}
                      <div
                        className="min-w-full min-h-full flex items-start justify-center p-8"
                        onWheelCapture={(e) => {
                          e.preventDefault();

                          if (Math.abs(e.deltaY) < 5) return;

                          if (e.deltaY < 0) {
                            handleZoomIn();
                          } else {
                            handleZoomOut();
                          }
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt={currentDiagram?.title}
                          onLoad={() => setLoading(false)}
                          onError={handleImageError}
                          draggable={false}
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "top center",
                            transition: isDragging
                              ? "none"
                              : "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
                            width: "auto",
                            height: "auto",
                            maxWidth: "none",
                            maxHeight: "none",
                          }}
                          className={`select-none shadow-2xl rounded-xl ${
                            zoom > 1
                              ? isDragging
                                ? "cursor-grabbing"
                                : "cursor-grab"
                              : "cursor-default"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "links" && (
                  <motion.div
                    key="links"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto p-6"
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Globe className="w-5 h-5 text-indigo-500" />
                          Project Resources
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Quick access to external project documentation and
                          tools
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {externalLinks.map((link) => {
                          const Icon = link.icon;
                          const isCopied = copiedId === link.id;
                          return (
                            <motion.div
                              key={link.id}
                              whileHover={{ y: -2 }}
                              className={`group relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm ${link.hoverBorder} hover:shadow-lg transition-all duration-300`}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.iconBg} flex items-center justify-center shadow-md shrink-0`}
                                >
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {link.title}
                                    </h4>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${link.sourceColor}`}
                                    >
                                      {link.source}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    {link.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium hover:opacity-90 transition"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Open
                                    </a>
                                    <button
                                      onClick={() =>
                                        handleCopyLink(link.url, link.id)
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                      {isCopied ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      {isCopied ? "Copied" : "Copy Link"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
