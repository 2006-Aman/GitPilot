"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface ReadmeViewerProps {
  content: string;
}

export default function ReadmeViewer({ content }: ReadmeViewerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden group">
      {/* Ambient Soft Backdrop Mesh Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-all duration-500" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Pill */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-foreground">README.md Overview</h2>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          Markdown Docs
        </span>
      </div>

      {/* Customized Markdown Renderer */}
      <div className="markdown-content text-foreground leading-relaxed text-sm space-y-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 🏷️ HEADINGS
            h1: ({ children }) => (
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground border-b border-border/80 pb-3 mt-8 mb-4 flex items-center gap-2.5">
                <span className="w-2 h-7 rounded-full bg-accent inline-block shrink-0" />
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-foreground border-l-4 border-accent pl-3.5 mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-bold text-foreground mt-5 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-sm font-bold text-foreground mt-4 mb-2">{children}</h4>
            ),

            // 💬 PARAGRAPHS
            p: ({ children }) => <p className="text-muted leading-relaxed text-sm my-2 font-medium">{children}</p>,

            // 🔗 LINKS
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                {children}
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>
            ),

            // 💡 GITHUB ALERTS / BLOCKQUOTES
            blockquote: ({ children }) => {
              const str = String(children);
              let alertType = "note";
              let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;
              let borderColor = "border-blue-500/50 bg-blue-500/5 text-blue-300";

              if (str.includes("[!NOTE]")) {
                alertType = "note";
                icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;
                borderColor = "border-blue-500/50 bg-blue-500/10 text-foreground";
              } else if (str.includes("[!TIP]")) {
                alertType = "tip";
                icon = <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />;
                borderColor = "border-emerald-500/50 bg-emerald-500/10 text-foreground";
              } else if (str.includes("[!IMPORTANT]")) {
                alertType = "important";
                icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
                borderColor = "border-amber-500/50 bg-amber-500/10 text-foreground";
              } else if (str.includes("[!WARNING]")) {
                alertType = "warning";
                icon = <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />;
                borderColor = "border-orange-500/50 bg-orange-500/10 text-foreground";
              } else if (str.includes("[!CAUTION]")) {
                alertType = "caution";
                icon = <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                borderColor = "border-rose-500/50 bg-rose-500/10 text-foreground";
              }

              return (
                <div className={`my-4 border-l-4 rounded-r-xl p-4 flex items-start gap-3 shadow-sm ${borderColor}`}>
                  <div className="mt-0.5">{icon}</div>
                  <div className="text-xs leading-relaxed font-medium">{children}</div>
                </div>
              );
            },

            // 💻 CODE BLOCKS & INLINE CODE
            code({ className, children, ...props }) {
              const codeString = String(children).replace(/\n$/, "");
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : "";

              const isInline = !match && !codeString.includes("\n");

              if (isInline) {
                return (
                  <code className="bg-accent/10 text-accent font-mono text-xs px-2 py-0.5 rounded-md border border-accent/20 font-bold">
                    {children}
                  </code>
                );
              }

              const isCopied = copiedCode === codeString;

              return (
                <div className="my-4 rounded-xl overflow-hidden border border-border bg-[#181a1f] shadow-lg font-mono text-xs">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/80 bg-black/40 text-muted">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                      {lang || "CODE"}
                    </span>
                    <button
                      onClick={() => handleCopy(codeString)}
                      className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:border-accent transition-all"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[#abb2bf] leading-relaxed">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            },

            // 📊 TABLES
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-border shadow-md">
                <table className="w-full text-xs text-left border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-background/80 text-foreground font-bold border-b border-border">{children}</thead>,
            tbody: ({ children }) => <tbody className="divide-y divide-border/40">{children}</tbody>,
            tr: ({ children }) => <tr className="hover:bg-accent/5 transition-colors">{children}</tr>,
            th: ({ children }) => <th className="px-4 py-3 font-bold uppercase tracking-wider text-muted text-[10px]">{children}</th>,
            td: ({ children }) => <td className="px-4 py-3 font-medium text-foreground">{children}</td>,

            // 📝 LISTS
            ul: ({ children }) => <ul className="my-3 space-y-1.5 pl-5 list-disc text-muted font-medium">{children}</ul>,
            ol: ({ children }) => <ol className="my-3 space-y-1.5 pl-5 list-decimal text-muted font-medium">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,

            // 🖼️ IMAGES
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt || "README Image"}
                className="my-4 rounded-xl border border-border/80 shadow-md max-w-full object-contain mx-auto"
              />
            ),

            // 📏 HORIZONTAL RULE
            hr: () => <hr className="my-6 border-border/60" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
