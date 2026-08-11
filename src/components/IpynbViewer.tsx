"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Book } from "lucide-react";

interface IpynbViewerProps {
  content: string;
}

export default function IpynbViewer({ content }: IpynbViewerProps) {
  const { cells, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.cells)) {
        return { cells: parsed.cells, error: null };
      }
      return { cells: [], error: "Invalid Jupyter Notebook format." };
    } catch (e) {
      return { cells: [], error: "Failed to parse Jupyter Notebook JSON." };
    }
  }, [content]);

  if (error) {
    return (
      <div className="p-8 text-center text-[#FB7185] bg-[#1A1D27] rounded-xl border border-[#232733]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-[#232733] bg-[#0A0C10] shadow-xl">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#232733] bg-[#12151B] shrink-0 z-10">
        <Book className="w-4 h-4 text-[#F37626]" />
        <span className="font-bold text-xs text-[#E9EBF0] uppercase tracking-wider">Jupyter Notebook Preview</span>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-[#0A0C10]">
        <div className="max-w-4xl mx-auto space-y-6">
          {cells.map((cell: any, idx: number) => {
            const cellType = cell.cell_type;
            // Source could be an array of strings or a single string
            const sourceText = Array.isArray(cell.source) ? cell.source.join("") : (cell.source || "");

            if (cellType === "markdown") {
              return (
                <div key={idx} className="prose prose-invert max-w-none prose-p:text-[#9BA2B4] prose-headings:text-[#E9EBF0]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sourceText}
                  </ReactMarkdown>
                </div>
              );
            }

            if (cellType === "code") {
              // Outputs
              const outputs = Array.isArray(cell.outputs) ? cell.outputs : [];

              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="w-12 shrink-0 text-right font-mono text-[10px] text-[#5FC9E8] mt-2">
                      {cell.execution_count ? `[${cell.execution_count}]:` : "[ ]:"}
                    </div>
                    <div className="flex-1 bg-[#12151B] border border-[#232733] rounded-xl p-3 overflow-x-auto">
                      <pre className="font-mono text-[13px] text-[#E9EBF0] m-0">
                        <code>{sourceText}</code>
                      </pre>
                    </div>
                  </div>

                  {outputs.length > 0 && (
                    <div className="flex gap-2">
                      <div className="w-12 shrink-0 text-right font-mono text-[10px] text-[#FB7185] mt-2">
                        {outputs.some((o: any) => o.execution_count) ? `[${outputs.find((o: any) => o.execution_count)?.execution_count}]:` : ""}
                      </div>
                      <div className="flex-1 p-3 overflow-x-auto">
                        {outputs.map((out: any, outIdx: number) => {
                          if (out.output_type === "stream") {
                            const text = Array.isArray(out.text) ? out.text.join("") : out.text;
                            return <pre key={outIdx} className="font-mono text-xs text-[#9BA2B4]">{text}</pre>;
                          }
                          if (out.output_type === "execute_result" || out.output_type === "display_data") {
                            if (out.data && out.data["image/png"]) {
                              return <img key={outIdx} src={`data:image/png;base64,${out.data["image/png"]}`} alt="Output" className="max-w-full rounded bg-white" />;
                            }
                            if (out.data && out.data["text/html"]) {
                              const html = Array.isArray(out.data["text/html"]) ? out.data["text/html"].join("") : out.data["text/html"];
                              return <div key={outIdx} dangerouslySetInnerHTML={{ __html: html }} className="bg-white text-black p-2 rounded" />;
                            }
                            if (out.data && out.data["text/plain"]) {
                              const text = Array.isArray(out.data["text/plain"]) ? out.data["text/plain"].join("") : out.data["text/plain"];
                              return <pre key={outIdx} className="font-mono text-xs text-[#9BA2B4]">{text}</pre>;
                            }
                          }
                          if (out.output_type === "error") {
                            const tb = Array.isArray(out.traceback) ? out.traceback.join("\n") : "";
                            return <pre key={outIdx} className="font-mono text-xs text-red-400 bg-red-400/10 p-2 rounded">{tb}</pre>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
