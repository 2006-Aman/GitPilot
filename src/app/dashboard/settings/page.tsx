"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Palette, Key, GitBranch, Cpu, CreditCard, AlertTriangle, Check, FileText, Globe, ChevronDown } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "api-keys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  { id: "github", label: "GitHub Integration", icon: <GitBranch className="w-4 h-4" /> },
  { id: "openai", label: "OpenAI Settings", icon: <Cpu className="w-4 h-4" /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [aiModel, setAiModel] = useState("gpt-4o");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>;

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted">Manage your account and application preferences</p>
      </div>

      {/* Premium Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-[#12151B]/80 backdrop-blur-xl border border-[#232733] rounded-2xl overflow-x-auto custom-scrollbar shadow-inner">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl whitespace-nowrap transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? "text-[#0A0C10] font-bold shadow-[0_0_15px_rgba(232,185,77,0.3)]" 
                  : "text-[#9BA2B4] font-medium hover:text-[#E9EBF0] hover:bg-[#1A1D27]"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-accent w-full h-full" />
              )}
              <span className={`relative z-10 flex items-center gap-2 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                <span className={`${isActive ? "text-[#0A0C10]" : "text-[#5E6577] group-hover:text-accent"} transition-colors duration-300`}>
                  {t.icon}
                </span>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Profile Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-[#232733] bg-[#12151B]">
            {/* Banner Background */}
            <div className="h-32 bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/20 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#12151B] to-transparent"></div>
            </div>
            
            <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-28 h-28 rounded-full border-4 border-[#12151B] bg-[#1A1D27] flex items-center justify-center text-4xl font-bold text-[#E9EBF0] overflow-hidden shadow-2xl">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    session?.user?.name?.[0] || "U"
                  )}
                  {/* Overlay for hover */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-xs text-white font-medium">Change</span>
                  </div>
                </div>
              </div>

              {/* User Info & Actions */}
              <div className="flex-1 text-center md:text-left mb-2">
                <h2 className="text-2xl font-bold text-[#E9EBF0]">{session?.user?.name || "User"}</h2>
                <p className="text-sm text-[#9BA2B4]">{session?.user?.email || "No email provided"}</p>
              </div>
              <div className="mb-2 shrink-0">
                <button onClick={showSaved} className="bg-accent hover:bg-accent-hover text-[#0A0C10] font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(232,185,77,0.3)] hover:shadow-[0_0_25px_rgba(232,185,77,0.5)] active:scale-95 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
              <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-accent" /> Personal Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input type="text" defaultValue={session?.user?.name || ""} placeholder="Your full name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#E9EBF0] placeholder:text-[#5E6577]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input type="email" defaultValue={session?.user?.email || ""} placeholder="Your email address" disabled className="w-full bg-[#0A0C10]/50 border border-border rounded-xl px-4 py-2.5 text-sm text-[#9BA2B4] cursor-not-allowed opacity-70" />
                  <p className="text-[10px] text-muted mt-1.5">* Email is managed by your authentication provider.</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
              <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> Developer Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">Bio / Tagline</label>
                  <input type="text" placeholder="e.g. Full Stack Developer specializing in React" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#E9EBF0] placeholder:text-[#5E6577]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">Website / Portfolio</label>
                  <div className="relative flex items-center">
                    <Globe className="w-4 h-4 text-muted absolute left-3" />
                    <input type="url" placeholder="https://" className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#E9EBF0] placeholder:text-[#5E6577]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
            <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" /> Notification Preferences
            </h3>
            <div className="space-y-2 mb-6">
              {[
                { title: "Weekly performance report", desc: "Get a summary of your coding activity." },
                { title: "New PR review requested", desc: "Alert me when someone requests a review." },
                { title: "Issue assigned to you", desc: "Alert me when an issue is assigned." },
                { title: "Repository sync completed", desc: "Notification when background sync finishes." },
                { title: "Achievement unlocked", desc: "Celebrate when I unlock a new badge." },
                { title: "Deployment status changes", desc: "Alert on Vercel/Netlify deploy success or failure." },
              ].map((n) => (
                <label key={n.title} className="flex items-start justify-between p-4 border border-[#232733] bg-[#0A0C10]/50 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group">
                  <div>
                    <span className="text-sm font-medium text-[#E9EBF0] group-hover:text-accent transition-colors">{n.title}</span>
                    <p className="text-xs text-[#9BA2B4] mt-1">{n.desc}</p>
                  </div>
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-10 h-5 bg-[#232733] rounded-full peer-checked:bg-accent peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner"></div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={showSaved} className="bg-accent hover:bg-accent-hover text-[#0A0C10] font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(232,185,77,0.3)] hover:shadow-[0_0_25px_rgba(232,185,77,0.5)] active:scale-95 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      )}



      {activeTab === "api-keys" && (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
            <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
              <Key className="w-4 h-4 text-accent" /> API Keys
            </h3>
            <p className="text-sm text-[#9BA2B4] mb-6">Manage API keys to access GitPilot data programmatically.</p>
            
            <div className="bg-[#0A0C10] border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block">Default Key</label>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4ADE80]/10 text-[#4ADE80]">Active</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="password" value="sk-dm-••••••••••••••••" readOnly className="flex-1 bg-[#12151B] border border-border rounded-xl px-4 py-3 text-sm font-mono text-muted focus:outline-none" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium bg-[#1A1D27] border border-[#232733] text-[#E9EBF0] rounded-xl hover:bg-[#232733] transition-colors">Copy</button>
                  <button className="px-4 py-2 text-sm font-medium bg-[#1A1D27] border border-[#232733] text-danger rounded-xl hover:bg-danger/10 transition-colors">Revoke</button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#232733]">
              <button className="px-5 py-2.5 text-sm font-bold bg-[#1A1D27] border border-[#232733] text-[#E9EBF0] rounded-xl hover:bg-[#232733] hover:text-accent transition-colors">
                + Generate New Key
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "github" && (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
            <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-accent" /> GitHub Integration
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-br from-[#12151B] to-[#1A1D27] border border-border rounded-xl p-5 mb-6">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-xl bg-[#232733] flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-[#E9EBF0]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#E9EBF0]">Connected as {session?.user?.name || "user"}</p>
                  <p className="text-xs text-[#9BA2B4]">Full access to repositories, issues, and PRs.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80]">
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                { title: "Auto-sync repositories", desc: "Automatically pull new commits every hour." },
                { title: "Sync on page load", desc: "Fetch fresh data when opening the dashboard." },
                { title: "Include private repos", desc: "Show analytics for private repositories." }
              ].map((s) => (
                <label key={s.title} className="flex items-start justify-between p-4 border border-[#232733] bg-[#0A0C10]/50 rounded-xl hover:border-accent/30 transition-colors cursor-pointer group">
                  <div>
                    <span className="text-sm font-medium text-[#E9EBF0] group-hover:text-accent transition-colors">{s.title}</span>
                    <p className="text-xs text-[#9BA2B4] mt-1">{s.desc}</p>
                  </div>
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-10 h-5 bg-[#232733] rounded-full peer-checked:bg-accent peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner"></div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#232733]">
              <button className="px-5 py-2.5 text-sm font-bold bg-danger/10 border border-danger/30 text-danger rounded-xl hover:bg-danger hover:text-white transition-all">
                Disconnect GitHub
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "openai" && (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
            <h3 className="font-semibold text-[#E9EBF0] mb-5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" /> OpenAI Settings
            </h3>
            <p className="text-sm text-[#9BA2B4] mb-6">Configure AI features used across the dashboard (like code review and insights).</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">OpenAI API Key</label>
                <input type="password" placeholder="sk-..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#E9EBF0] placeholder:text-[#5E6577]" />
              </div>
              
              <div className="relative z-50">
                <label className="text-xs font-semibold text-[#5E6577] uppercase tracking-wider block mb-1.5">Preferred AI Model</label>
                <div className="relative group/dropdown">
                  <button className="w-full flex items-center justify-between bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer hover:border-accent/30 transition-colors">
                    <span className="font-medium text-[#E9EBF0]">{aiModel}</span>
                    <ChevronDown className="w-4 h-4 text-muted opacity-70 group-hover/dropdown:text-accent transition-colors" />
                  </button>
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-[#12151B]/95 backdrop-blur-xl border border-[#232733] rounded-xl shadow-2xl z-50 py-1 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all ring-1 ring-white/5 transform translate-y-1 group-hover/dropdown:translate-y-0">
                    {["gpt-4o", "gpt-4o-mini", "gpt-4"].map((model) => (
                      <button
                        key={model}
                        onClick={() => setAiModel(model)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          aiModel === model ? "bg-accent/10 text-accent" : "text-[#9BA2B4] hover:text-[#E9EBF0] hover:bg-[#232733]/50"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#232733]">
              <button onClick={showSaved} className="bg-accent hover:bg-accent-hover text-[#0A0C10] font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(232,185,77,0.3)] hover:shadow-[0_0_25px_rgba(232,185,77,0.5)] active:scale-95 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}



      {activeTab === "danger" && (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#12151B] border border-danger/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(251,113,133,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/50 to-danger"></div>
            <h3 className="font-semibold text-danger mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-sm text-[#9BA2B4] mb-8">Irreversible actions. Please proceed with extreme caution.</p>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0A0C10] border border-danger/20 rounded-xl p-5 gap-4">
                <div>
                  <p className="text-sm font-bold text-[#E9EBF0]">Clear All Data</p>
                  <p className="text-xs text-[#9BA2B4] mt-1">Remove all synced repositories and analytics from the database.</p>
                </div>
                <button className="shrink-0 px-4 py-2 text-sm font-bold text-danger border border-danger/30 rounded-xl hover:bg-danger hover:text-white transition-all shadow-[0_0_10px_rgba(251,113,133,0.1)] hover:shadow-[0_0_20px_rgba(251,113,133,0.4)]">
                  Clear Data
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0A0C10] border border-danger/20 rounded-xl p-5 gap-4">
                <div>
                  <p className="text-sm font-bold text-[#E9EBF0]">Delete Account</p>
                  <p className="text-xs text-[#9BA2B4] mt-1">Permanently delete your account and all associated data.</p>
                </div>
                <button className="shrink-0 px-4 py-2 text-sm font-bold text-white bg-danger rounded-xl hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(251,113,133,0.3)] hover:shadow-[0_0_25px_rgba(251,113,133,0.6)]">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4" /> Settings saved
        </div>
      )}
    </div>
  );
}
