"use client";

import { useSession, signOut } from "next-auth/react";
import { Search, Bell, ChevronDown, Plus, Settings, User, CreditCard, LogOut, Code, FileText, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function TopNav() {
  const { data: session } = useSession();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-[#232733] bg-[#0A0C10]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50 relative">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <SearchBar 
          placeholder="Search repositories, issues…"
          onSearch={(query) => console.log("Searching for:", query)} 
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#9BA2B4] hover:text-[#E9EBF0] border border-[#232733] rounded-lg hover:bg-[#232733]/50 cursor-pointer transition-colors">
          <span>Workspace</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </div>

        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`p-2 rounded-lg transition-all ${
              showQuickActions 
                ? "bg-[#E8B94D]/10 text-[#E8B94D]" 
                : "text-[#5E6577] hover:text-[#E9EBF0] hover:bg-[#232733]/50"
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
          {showQuickActions && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden ring-1 ring-white/5 origin-top-right animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#232733]/50 mb-1">
                <p className="text-[10px] font-bold text-[#5E6577] uppercase tracking-wider">Quick Actions</p>
              </div>
              <button onClick={() => setShowQuickActions(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                <div className="w-6 h-6 rounded-md bg-[#5FC9E8]/10 flex items-center justify-center shrink-0">
                  <Code className="w-3.5 h-3.5 text-[#5FC9E8]" />
                </div>
                Connect Repository
              </button>
              <button onClick={() => setShowQuickActions(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                <div className="w-6 h-6 rounded-md bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#4ADE80]" />
                </div>
                Generate Report
              </button>
              <button onClick={() => setShowQuickActions(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                <div className="w-6 h-6 rounded-md bg-[#FB7185]/10 flex items-center justify-center shrink-0">
                  <Download className="w-3.5 h-3.5 text-[#FB7185]" />
                </div>
                Export PDF
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 text-[#5E6577] hover:text-[#E9EBF0] hover:bg-[#232733]/50 rounded-lg transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FB7185] rounded-full shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative flex items-center pl-2 ml-1 border-l border-[#232733]" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full ring-2 transition-all ${
              showProfileMenu ? "ring-[#E8B94D] ring-offset-2 ring-offset-[#0A0C10]" : "ring-[#232733] hover:ring-[#5E6577]"
            }`}
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#1A1D27] flex items-center justify-center text-[#9BA2B4] text-xs font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-2xl shadow-2xl z-20 py-2 overflow-hidden ring-1 ring-white/5 origin-top-right animate-in fade-in zoom-in-95 duration-100">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-[#232733]/50 flex items-center gap-3 bg-[#0A0C10]/30">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1A1D27] flex items-center justify-center text-[#E9EBF0] font-bold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#E9EBF0] truncate">{session?.user?.name || "User"}</span>
                  <span className="text-xs text-[#5E6577] truncate">{session?.user?.email || "user@example.com"}</span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link onClick={() => setShowProfileMenu(false)} href="/dashboard/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                  <User className="w-4 h-4 text-[#5E6577]" /> Profile
                </Link>
                <Link onClick={() => setShowProfileMenu(false)} href="/dashboard/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                  <Settings className="w-4 h-4 text-[#5E6577]" /> Settings
                </Link>
                <Link onClick={() => setShowProfileMenu(false)} href="/dashboard/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50 transition-colors">
                  <CreditCard className="w-4 h-4 text-[#5E6577]" /> Billing
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-[#232733]/50 pt-1 mt-1">
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
