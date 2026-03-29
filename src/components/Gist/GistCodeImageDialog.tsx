"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  dracula,
  nightOwl,
  nord,
  okaidia,
  oneDark,
  shadesOfPurple,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { domToBlob } from "modern-screenshot";

type PrismTheme = typeof vscDarkPlus;

const THEMES: { id: string; label: string; style: PrismTheme }[] = [
  { id: "vsc", label: "VS Code Dark+", style: vscDarkPlus },
  { id: "night", label: "Night Owl", style: nightOwl },
  { id: "dracula", label: "Dracula", style: dracula },
  { id: "one", label: "One Dark", style: oneDark },
  { id: "okaidia", label: "Okaidia", style: okaidia },
  { id: "purple", label: "Shades of Purple", style: shadesOfPurple },
  { id: "nord", label: "Nord", style: nord },
];

const BACKGROUNDS: { id: string; label: string; css: string }[] = [
  {
    id: "aurora",
    label: "Aurora",
    css: "linear-gradient(145deg, #0f0c29 0%, #302b63 45%, #24243e 100%)",
  },
  {
    id: "ember",
    label: "Ember",
    css: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    css: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    css: "linear-gradient(135deg, #2d1b4e 0%, #8b2500 50%, #ff6b35 100%)",
  },
  { id: "void", label: "Void", css: "#0d1117" },
  { id: "slate", label: "Slate", css: "#1e293b" },
];

function guessLanguage(filename: string, fileLanguage?: string | null): string {
  const l = fileLanguage?.trim().toLowerCase();
  if (l) {
    if (l === "md" || l === "markdown") return "markdown";
    return l;
  }
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    md: "markdown",
    json: "json",
    css: "css",
    scss: "scss",
    html: "markup",
    xml: "markup",
    svg: "markup",
    yml: "yaml",
    yaml: "yaml",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    sql: "sql",
    graphql: "graphql",
    vue: "markup",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    php: "php",
  };
  return map[ext] ?? "text";
}

interface GistCodeImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  content: string;
  language?: string | null;
}

export default function GistCodeImageDialog({
  open,
  onOpenChange,
  filename,
  content,
  language,
}: GistCodeImageDialogProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [bgId, setBgId] = useState(BACKGROUNDS[0].id);
  const [padding, setPadding] = useState(40);
  const [frameWidth, setFrameWidth] = useState(920);
  const [lineNumbers, setLineNumbers] = useState(false);
  const [exporting, setExporting] = useState(false);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) ?? THEMES[0],
    [themeId],
  );
  const background = useMemo(
    () => BACKGROUNDS.find((b) => b.id === bgId) ?? BACKGROUNDS[0],
    [bgId],
  );
  const lang = useMemo(
    () => guessLanguage(filename, language),
    [filename, language],
  );

  const handleExport = useCallback(async () => {
    const el = captureRef.current;
    if (!el) {
      toast.error("Nothing to capture");
      return;
    }
    setExporting(true);
    let clone: HTMLElement | null = null;
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      /**
       * Radix Dialog centers with transform; rasterizing that subtree skews the SVG/canvas
       * (black band, clipped right side). Clone to document.body with transform:none and
       * explicit size so the export matches the preview without ancestor transforms.
       */
      const naturalW = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth));
      clone = el.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = `${naturalW}px`;
      clone.style.maxWidth = "none";
      clone.style.height = "auto";
      clone.style.minHeight = "0";
      clone.style.margin = "0";
      clone.style.transform = "none";
      clone.style.boxSizing = "border-box";
      clone.style.overflow = "visible";
      /* Below the dialog (z-50) so export doesn’t flash on top of the UI; rasterizer still reads the DOM. */
      clone.style.zIndex = "40";
      clone.style.pointerEvents = "none";
      document.body.appendChild(clone);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const w2 = Math.ceil(Math.max(clone.offsetWidth, clone.scrollWidth));
      const h2 = Math.ceil(clone.scrollHeight);
      const scale = Math.min(4, Math.max(3, window.devicePixelRatio || 2));
      const blob = await domToBlob(clone, {
        scale,
        width: w2,
        height: h2,
        backgroundColor: null,
      });

      if (!blob || blob.size < 32) {
        toast.error("Could not create image");
        return;
      }

      const safeName =
        filename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "code";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${safeName}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not create image");
    } finally {
      clone?.remove();
      setExporting(false);
    }
  }, [filename]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden w-[min(100vw-1.5rem,72rem)] max-w-[min(100vw-1.5rem,72rem)] sm:max-w-[min(100vw-2rem,72rem)]">
        <DialogHeader className="p-3">
          <DialogTitle>Code image</DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-4 border-y bg-muted/30 py-4 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gist-img-theme">Theme</Label>
              <select
                id="gist-img-theme"
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gist-img-bg">Background</Label>
              <select
                id="gist-img-bg"
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
                value={bgId}
                onChange={(e) => setBgId(e.target.value)}
              >
                {BACKGROUNDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gist-img-pad">Padding: {padding}px</Label>
              <input
                id="gist-img-pad"
                type="range"
                min={16}
                max={96}
                step={4}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gist-img-width">Width: {frameWidth}px</Label>
              <input
                id="gist-img-width"
                type="range"
                min={400}
                max={1400}
                step={20}
                value={frameWidth}
                onChange={(e) => setFrameWidth(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={lineNumbers}
              onChange={(e) => setLineNumbers(e.target.checked)}
              className="rounded border-input"
            />
            Line numbers
          </label>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-6 py-4 w-full min-w-0 flex justify-center">
          <div
            ref={captureRef}
            style={{
              background: background.css,
              boxSizing: "border-box",
              width: `${frameWidth + 2 * padding}px`,
              maxWidth: "100%",
              marginLeft: "auto",
              marginRight: "auto",
              padding,
              borderRadius: 0,
            }}
          >
            <div
              className="min-w-0"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
                borderRadius: 0,
                overflow: "visible",
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5 shrink-0"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: "#ff5f57" }}
                />
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: "#febc2e" }}
                />
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: "#28c840" }}
                />
                <span
                  className="ml-2 font-mono text-xs truncate min-w-0"
                  style={{ color: "rgba(255, 255, 255, 0.72)" }}
                >
                  {filename}
                </span>
              </div>
              <SyntaxHighlighter
                language={lang}
                style={theme.style}
                showLineNumbers={lineNumbers}
                wrapLines
                wrapLongLines
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: "1rem 1.15rem",
                  fontSize: 13,
                  lineHeight: 1.55,
                  borderRadius: 0,
                  background: "transparent",
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflow: "visible",
                  maxHeight: "none",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
                lineNumberStyle={{
                  minWidth: "2.5em",
                  paddingRight: "1em",
                  color: "rgba(255,255,255,0.25)",
                  userSelect: "none",
                }}
              >
                {content}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
