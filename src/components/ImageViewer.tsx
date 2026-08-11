"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageViewerProps {
  content: string; // The raw content of the file
  fileName: string;
}

export default function ImageViewer({ content, fileName }: ImageViewerProps) {
  const isSvg = fileName.toLowerCase().endsWith(".svg");
  
  // We can render SVG directly if it's text, or if it's a binary image, we might need a base64 Data URL.
  // Since we fetch contents and atob() them in page.tsx, if it's a binary image (like png/jpg), `atob` might garble it, 
  // so typically for binary files we'd rely on a `rawUrl` instead.
  // Assuming `content` here is either raw SVG string or a valid base64 string for images (if handled properly by parent).
  // For SVG, dangerouslySetInnerHTML works perfectly.

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-[#232733] bg-[#0A0C10] shadow-xl">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#232733] bg-[#12151B] shrink-0">
        <ImageIcon className="w-4 h-4 text-[#FB7185]" />
        <span className="font-bold text-xs text-[#E9EBF0] uppercase tracking-wider">Image Preview</span>
        <span className="text-[10px] text-[#5E6577] ml-auto">{fileName}</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-black/40" style={{
        backgroundImage: 'linear-gradient(45deg, #1A1D27 25%, transparent 25%, transparent 75%, #1A1D27 75%, #1A1D27), linear-gradient(45deg, #1A1D27 25%, transparent 25%, transparent 75%, #1A1D27 75%, #1A1D27)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}>
        {isSvg ? (
          <div 
            className="max-w-full max-h-full"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        ) : (
          <img 
            src={`data:image/${fileName.split('.').pop()};base64,${btoa(content)}`} 
            alt={fileName} 
            className="max-w-full max-h-full shadow-lg rounded"
          />
        )}
      </div>
    </div>
  );
}
