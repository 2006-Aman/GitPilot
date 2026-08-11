"use client";

import React, { useMemo } from "react";
import { Table } from "lucide-react";

interface CsvViewerProps {
  content: string;
}

export default function CsvViewer({ content }: CsvViewerProps) {
  const { headers, rows } = useMemo(() => {
    if (!content) return { headers: [], rows: [] };
    
    // A simple CSV parser (splits by newline, then by commas not inside quotes)
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map(s => s.trim().replace(/^"|"$/g, ''));
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(line => parseLine(line));

    return { headers, rows };
  }, [content]);

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-[#232733] bg-[#0A0C10] shadow-xl">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#232733] bg-[#12151B] shrink-0">
        <Table className="w-4 h-4 text-[#5FC9E8]" />
        <span className="font-bold text-xs text-[#E9EBF0] uppercase tracking-wider">CSV Data Preview</span>
        <span className="text-[10px] text-[#5E6577] ml-auto">{rows.length} rows, {headers.length} columns</span>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar p-0 m-0">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 bg-[#1A1D27] text-[#9BA2B4] border-b border-[#232733] z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 border-r border-[#232733]/50 font-semibold w-12 text-center text-[10px]">#</th>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 border-r border-[#232733]/50 font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232733]/50 text-[#E9EBF0]">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#12151B] transition-colors">
                <td className="px-4 py-2 border-r border-[#232733]/50 text-[10px] text-[#5E6577] text-center w-12">
                  {rowIndex + 1}
                </td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border-r border-[#232733]/50 whitespace-nowrap truncate max-w-xs">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-[#5E6577]">No data available or empty CSV file.</div>
        )}
      </div>
    </div>
  );
}
