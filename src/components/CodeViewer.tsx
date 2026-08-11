"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Download, WrapText, Sun, Moon, Palette, ChevronDown } from "lucide-react";

export type ThemeKey = "vscode-dark" | "one-dark" | "monokai" | "dracula" | "github-light";

interface CodeViewerProps {
  fileName: string;
  code: string;
  fileSize: number;
  rawUrl?: string;
  onCopy?: () => void;
}

const THEME_STYLES: Record<
  ThemeKey,
  {
    name: string;
    bg: string;
    text: string;
    gutterBg: string;
    gutterText: string;
    border: string;
    keyword: string;
    string: string;
    comment: string;
    number: string;
    function: string;
    type: string;
    tag: string;
    operator: string;
  }
> = {
  "vscode-dark": {
    name: "VS Code Dark",
    bg: "bg-[#1e1e1e]",
    text: "text-[#d4d4d4]",
    gutterBg: "bg-[#1e1e1e]",
    gutterText: "text-[#858585]",
    border: "border-[#333333]",
    keyword: "text-[#569cd6] font-bold",
    string: "text-[#ce9178]",
    comment: "text-[#6a9955] italic",
    number: "text-[#b5cea8]",
    function: "text-[#dcdcaa]",
    type: "text-[#4ec9b0]",
    tag: "text-[#569cd6]",
    operator: "text-[#d4d4d4]",
  },
  "one-dark": {
    name: "One Dark Pro",
    bg: "bg-[#282c34]",
    text: "text-[#abb2bf]",
    gutterBg: "bg-[#21252b]",
    gutterText: "text-[#4b5263]",
    border: "border-[#181a1f]",
    keyword: "text-[#c678dd] font-bold",
    string: "text-[#98c379]",
    comment: "text-[#5c6370] italic",
    number: "text-[#d19a66]",
    function: "text-[#61afef]",
    type: "text-[#e5c07b]",
    tag: "text-[#e06c75]",
    operator: "text-[#56b6c2]",
  },
  monokai: {
    name: "Monokai Pro",
    bg: "bg-[#2d2a2e]",
    text: "text-[#fcfcfa]",
    gutterBg: "bg-[#221f22]",
    gutterText: "text-[#727072]",
    border: "border-[#19181a]",
    keyword: "text-[#ff6188] font-bold",
    string: "text-[#ffd866]",
    comment: "text-[#727072] italic",
    number: "text-[#ab9df2]",
    function: "text-[#a9dc76]",
    type: "text-[#78dce8]",
    tag: "text-[#ff6188]",
    operator: "text-[#ff6188]",
  },
  dracula: {
    name: "Dracula",
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    gutterBg: "bg-[#21222c]",
    gutterText: "text-[#6272a4]",
    border: "border-[#191a21]",
    keyword: "text-[#ff79c6] font-bold",
    string: "text-[#f1fa8c]",
    comment: "text-[#6272a4] italic",
    number: "text-[#bd93f9]",
    function: "text-[#50fa7b]",
    type: "text-[#8be9fd]",
    tag: "text-[#ff79c6]",
    operator: "text-[#ff79c6]",
  },
  "github-light": {
    name: "GitHub Light",
    bg: "bg-[#ffffff]",
    text: "text-[#24292e]",
    gutterBg: "bg-[#f6f8fa]",
    gutterText: "text-[#959da5]",
    border: "border-[#e1e4e8]",
    keyword: "text-[#d73a49] font-bold",
    string: "text-[#032f62]",
    comment: "text-[#6a737d] italic",
    number: "text-[#005cc5]",
    function: "text-[#6f42c1]",
    type: "text-[#6f42c1]",
    tag: "text-[#22863a]",
    operator: "text-[#d73a49]",
  },
};

function getLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const langMap: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TSX / React",
    js: "JavaScript",
    jsx: "JSX / React",
    py: "Python",
    rs: "Rust",
    go: "Go",
    java: "Java",
    kt: "Kotlin",
    swift: "Swift",
    rb: "Ruby",
    php: "PHP",
    c: "C",
    cpp: "C++",
    cs: "C#",
    css: "CSS",
    scss: "SCSS",
    html: "HTML",
    json: "JSON",
    yml: "YAML",
    yaml: "YAML",
    md: "Markdown",
    sh: "Shell",
    bash: "Shell",
    sql: "SQL",
    toml: "TOML",
    dockerfile: "Docker",
  };
  return langMap[ext] || "Plain Text";
}

export default function CodeViewer({ fileName, code, fileSize, rawUrl }: CodeViewerProps) {
  const [theme, setTheme] = useState<ThemeKey>("vscode-dark");
  const [fontSize, setFontSize] = useState<"12px" | "13px" | "15px">("13px");
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const style = THEME_STYLES[theme];
  const langLabel = getLanguage(fileName);
  const lines = useMemo(() => code.split("\n"), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🎨 IDE Syntax Tokenizer
  const renderHighlightedLine = (line: string) => {
    if (!line.trim()) return <span>&nbsp;</span>;

    // Single line comments
    if (/^\s*(\/\/|#|\/\*|--|;)/.test(line)) {
      return <span className={style.comment}>{line}</span>;
    }

    const tokens: React.ReactNode[] = [];
    // Tokenization regex for keywords, strings, numbers, functions, tags
    const regex =
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|var|function|return|if|else|for|while|async|await|class|extends|try|catch|def|self|print|in|type|interface|struct|fn|pub|use|package|void|int|string|bool|boolean|null|true|false|undefined)\b|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*(?=\()|<\/?[a-zA-Z0-9]+(?:\s|>|\/)|=>|===|!==|==|!=|&&|\|\||[{}()[\];,])/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(line.substring(lastIndex, match.index));
      }

      const matchText = match[0];

      if (/^["'`]/.test(matchText)) {
        tokens.push(
          <span key={match.index} className={style.string}>
            {matchText}
          </span>
        );
      } else if (
        /^\b(import|export|from|const|let|var|function|return|if|else|for|while|async|await|class|extends|try|catch|def|self|print|in|type|interface|struct|fn|pub|use|package|void|int|string|bool|boolean|null|true|false|undefined)\b$/.test(
          matchText
        )
      ) {
        tokens.push(
          <span key={match.index} className={style.keyword}>
            {matchText}
          </span>
        );
      } else if (/^\d+(\.\d+)?$/.test(matchText)) {
        tokens.push(
          <span key={match.index} className={style.number}>
            {matchText}
          </span>
        );
      } else if (/^<\/?[a-zA-Z0-9]+/.test(matchText)) {
        tokens.push(
          <span key={match.index} className={style.tag}>
            {matchText}
          </span>
        );
      } else if (line[match.index + matchText.length] === "(") {
        tokens.push(
          <span key={match.index} className={style.function}>
            {matchText}
          </span>
        );
      } else if (/^[{}()[\];,]$/.test(matchText) || /^(=>|===|!==|==|!=|&&|\|\|)$/.test(matchText)) {
        tokens.push(
          <span key={match.index} className={style.operator}>
            {matchText}
          </span>
        );
      } else {
        tokens.push(matchText);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(line.substring(lastIndex));
    }

    return <>{tokens}</>;
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${style.border} ${style.bg} transition-colors duration-300 shadow-xl`}>
      {/* 🎛️ IDE TOP TOOLBAR */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b ${style.border} bg-black/20 shrink-0 gap-3`}>
        {/* Left: File Breadcrumb & Language Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-bold text-xs text-foreground truncate">{fileName}</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
            {langLabel}
          </span>
        </div>

        {/* Right: Theme Selector & Editor Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Custom IDE Theme Switcher Dropdown */}
          <div className="relative group/dropdown">
            <button className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none cursor-pointer hover:border-accent/30 transition-colors">
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span>{THEME_STYLES[theme].name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted opacity-70 group-hover/dropdown:text-accent transition-colors ml-1" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-max min-w-[120px] bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-50 py-1 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown:translate-y-0">
              {Object.entries(THEME_STYLES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as ThemeKey)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    theme === key ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-[#232733]/50"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Font Size Selector */}
          <div className="relative group/dropdown2">
            <button className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-muted hover:text-foreground focus:outline-none cursor-pointer hover:border-white/20 transition-colors">
              <span>{fontSize}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover/dropdown2:text-foreground transition-colors" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-max min-w-[80px] bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-50 py-1 opacity-0 invisible group-hover/dropdown2:opacity-100 group-hover/dropdown2:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown2:translate-y-0">
              {["12px", "13px", "15px"].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size as any)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    fontSize === size ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-[#232733]/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Word Wrap Toggle Button */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              wordWrap ? "bg-accent/20 border-accent text-accent" : "border-white/10 text-muted hover:text-foreground"
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-accent/10 border border-accent/30 text-accent font-bold text-xs rounded-xl hover:bg-accent hover:text-black transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {/* Raw Download Link */}
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-white/10 text-muted hover:text-accent hover:border-accent transition-all"
              title="Download Raw File"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 💻 CODE CONTENT WITH LINE GUTTER & SYNTAX HIGHLIGHTING */}
      <div className={`flex-1 overflow-auto p-4 font-mono ${style.text}`} style={{ fontSize }}>
        <div className="flex min-w-max">
          {/* Line Numbers Gutter */}
          <div className={`select-none text-right pr-4 border-r ${style.border} ${style.gutterText} font-mono shrink-0 space-y-0.5`}>
            {lines.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveLine(i + 1)}
                className={`cursor-pointer hover:text-accent transition-colors ${
                  activeLine === i + 1 ? "text-accent font-bold" : ""
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Syntax Highlighted Code Lines */}
          <div className={`pl-4 space-y-0.5 ${wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"}`}>
            {lines.map((line, i) => (
              <div
                key={i}
                onClick={() => setActiveLine(i + 1)}
                className={`px-1 rounded transition-colors ${
                  activeLine === i + 1 ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-white/5"
                }`}
              >
                {renderHighlightedLine(line)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 FOOTER STATUS BAR */}
      <div className={`px-4 py-1.5 border-t ${style.border} bg-black/30 flex items-center justify-between text-[10px] font-semibold ${style.gutterText} shrink-0`}>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>{langLabel}</span>
          <span>{lines.length} Lines</span>
        </div>
        <div>{(fileSize / 1024).toFixed(1)} KB</div>
      </div>
    </div>
  );
}
