"use client";

import React, { useState, FormEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

export default function SearchBar({
  placeholder = "Search repositories, issues…",
  onSearch,
  onChange,
  className = "",
  defaultValue = "",
  value,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // Use controlled value if provided, else internal state
  const query = value !== undefined ? value : internalQuery;

  const handleQueryChange = (val: string) => {
    if (value === undefined) setInternalQuery(val);
    if (onChange) onChange(val);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full ${className}`}
    >
      <div
        className={`flex items-center w-full rounded-full transition-all duration-200 overflow-hidden ${
          isFocused ? "shadow-[0_0_0_2px_rgba(255,255,255,0.1)] border-[#3b4151]" : "border-[#232733]"
        }`}
        style={{
          background: "#14161C",
          borderWidth: "1px",
          height: "44px",
          borderStyle: "solid",
        }}
      >
        <div className="pl-[20px] pr-[10px] flex items-center justify-center shrink-0">
          <Search
            style={{ color: "#5E6577" }}
            size={16}
            strokeWidth={2.5}
          />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent border-none outline-none text-[14px]"
          style={{
            color: query ? "#E9EBF0" : "#5E6577",
          }}
        />
        
        {/* We use global styles or direct style prop to override default placeholder colors in some browsers if needed, 
            but Tailwind's placeholder pseudo-class handles the placeholder text perfectly when applied correctly, 
            or we can just use inline styles for the text and rely on the browser's default placeholder handling matching the text color if we don't type. */}
        <style jsx>{`
          input::placeholder {
            color: #5E6577;
            opacity: 1;
          }
        `}</style>
      </div>
    </form>
  );
}
