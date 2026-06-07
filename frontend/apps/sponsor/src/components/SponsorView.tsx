import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut,
  Globe, Bell, LayoutDashboard, Users, Building2, MessageSquare, Calendar,
  Download, BookmarkPlus, Bookmark, Search, Filter, ChevronRight, Star,
  CheckCircle2, Clock, Send, Settings, FileText, MapPin, Briefcase, GraduationCap,
  Eye, Mail, Phone, Linkedin, ExternalLink, TrendingUp, BarChart3, Award,
  Zap, ChevronDown, Plus, Trash2, Edit3, Check, X, AlertCircle, Info,
  Image, Upload, Video, Package, ArrowRight, UserCheck, UserX, Sparkles,
  LayoutList, CalendarDays, DoorOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageKey = "dashboard" | "talent" | "booth" | "outreach" | "interviews" | "agenda";

// ─── Candidate data ───────────────────────────────────────────────────────────
const candidates = [
  { id:1,  name:"Rania Khalil",      institution:"NYU Abu Dhabi",   country:"AE", field:"LLMs / NLP",          level:"PhD",         gpa:"3.9", exp:2, skills:["PyTorch","LangChain","Arabic NLP"], open:true,  gradient:"from-pink-400 to-rose-500",     views:14, status:"available" },
  { id:2,  name:"Jad Abou-Jaoude",   institution:"AUB",             country:"LB", field:"Machine Learning",    level:"MS",          gpa:"3.8", exp:1, skills:["TensorFlow","MLflow","AWS"],         open:true,  gradient:"from-blue-400 to-indigo-500",   views:9,  status:"available" },
  { id:3,  name:"Ahmed Al-Rashid",   institution:"KAUST",           country:"SA", field:"NLP / Arabic AI",     level:"PhD",         gpa:"4.0", exp:3, skills:["HuggingFace","RLHF","Arabic BERT"],  open:false, gradient:"from-emerald-400 to-teal-500",  views:21, status:"interviewing" },
  { id:4,  name:"Sara Al-Otaibi",    institution:"Saudi Aramco DT", country:"SA", field:"AI in Energy",        level:"Industry",    gpa:"—",   exp:8, skills:["SCADA","Anomaly Det.","Time-Series"],open:true,  gradient:"from-purple-400 to-violet-500", views:33, status:"available" },
  { id:5,  name:"Kareem Nour",       institution:"Cairo Univ.",      country:"EG", field:"Healthcare AI",       level:"PhD",         gpa:"3.7", exp:2, skills:["Grad-CAM","DICOM","FastAPI"],         open:true,  gradient:"from-orange-400 to-amber-500",  views:7,  status:"available" },
  { id:6,  name:"Nour Mansour",      institution:"KFUPM",            country:"SA", field:"Robotics / RL",       level:"MS",          gpa:"3.6", exp:1, skills:["ROS2","PyBullet","C++"],              open:true,  gradient:"from-cyan-400 to-teal-500",     views:5,  status:"available" },
  { id:7,  name:"Dina El-Sayed",     institution:"AAST",             country:"EG", field:"Computer Vision",     level:"BS",          gpa:"3.8", exp:0, skills:["OpenCV","YOLO","Python"],             open:true,  gradient:"from-green-400 to-emerald-500", views:3,  status:"available" },
  { id:8,  name:"Faris Nasser",      institution:"JUST",             country:"JO", field:"Speech Recognition",  level:"PhD",         gpa:"3.9", exp:3, skills:["Kaldi","Whisper","Arabic ASR"],       open:true,  gradient:"from-violet-400 to-purple-500", views:11, status:"available" },
];

const INTERVIEW_ROOMS = [
  { id:"ra", name:"Interview Room A", capacity:4 },
  { id:"rb", name:"Interview Room B", capacity:4 },
  { id:"rc", name:"Interview Room C", capacity:6 },
  { id:"rd", name:"Interview Room D", capacity:4 },
];

type InterviewEntry = {
  id: number; candidate: string; role: string; time: string;
  status: string; gradient: string; roomId: string;
};

const interviews: InterviewEntry[] = [
  { id:1, candidate:"Rania Khalil",    role:"ML Research Intern",   time:"Apr 15 · 10:00",  status:"confirmed",  gradient:"from-pink-400 to-rose-500",     roomId:"ra" },
  { id:2, candidate:"Jad Abou-Jaoude", role:"Backend ML Engineer",  time:"Apr 15 · 14:30",  status:"pending",    gradient:"from-blue-400 to-indigo-500",   roomId:"rb" },
  { id:3, candidate:"Sara Al-Otaibi",  role:"Senior AI Engineer",   time:"Apr 16 · 09:00",  status:"confirmed",  gradient:"from-purple-400 to-violet-500", roomId:"rc" },
];

const messages = [
  { id:1, to:"Faris Nasser",     role:"PhD · JUST",       preview:"Hi Faris, we noticed your work on Arabic ASR…", time:"2h ago",  read:false },
  { id:2, to:"Ahmed Al-Rashid",  role:"PhD · KAUST",      preview:"We'd love to connect at the summit…",           time:"1d ago",  read:true  },
];

const boothTeam = [
  { name:"Dr. Aisha Rahman",  role:"Head of AI Research",   gradient:"from-rose-400 to-pink-500" },
  { name:"Omar Siddiqui",     role:"Talent Acquisition",    gradient:"from-blue-400 to-indigo-500" },
  { name:"Layla Hassan",      role:"Product Manager",        gradient:"from-teal-400 to-emerald-500" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
);

const levelColor: Record<string, string> = {
  PhD: "bg-purple-50 text-purple-700", MS: "bg-blue-50 text-blue-700",
  BS: "bg-green-50 text-green-700", Industry: "bg-orange-50 text-orange-700",
};

// ─── Page: Dashboard ──────────────────────────────────────────────────────────
function DashboardPage({ onNav }: { onNav: (k: PageKey) => void }) {
  return (
    <div className="space-y-4">
      {/* Sponsor banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-16 w-20 h-20 bg-white/5 rounded-full -mb-8" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">G</div>
            <div>
              <div className="text-base font-bold">Google DeepMind MENA</div>
              <div className="text-xs text-blue-200">MENA Summit 2026 · Gold Sponsor</div>
            </div>
            <div className="ml-auto">
              <Pill label="Gold Tier" color="bg-yellow-400/30 text-yellow-200"/>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label:"CV Views",          value:"78" },
              { label:"Bookmarks",         value:"12" },
              { label:"Outreach Sent",     value:"9" },
              { label:"Interviews Booked", value:"3" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-[10px] text-blue-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier benefits */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-yellow-200 bg-yellow-50/50 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-yellow-600"/>
              <div className="text-sm font-bold text-gray-900">Gold Tier Benefits</div>
            </div>
            <div className="space-y-2">
              {[
                "CV access to 100+ attendees",
                "Up to 5 booth staff",
                "2 interview rooms included",
                "Email outreach capability",
                "Booth placement in Hall A",
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-gray-700">
                  <span className="text-yellow-600 font-bold mt-0.5">✓</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-purple-600"/>
              <div className="text-sm font-bold text-gray-900">Upgrade to Platinum</div>
            </div>
            <div className="space-y-2 mb-3">
              {[
                "All Gold benefits, plus:",
                "CV access to all 200+ attendees",
                "Up to 10 booth staff",
                "4 interview rooms included",
                "Keynote speaking slot",
              ].map((b, i) => (
                <div key={i} className="text-[11px] text-gray-700">
                  {b.startsWith("All Gold") ? (
                    <span className="font-semibold text-purple-700">{b}</span>
                  ) : (
                    <span className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold mt-0.5">✓</span>
                      <span>{b}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
              <Zap size={11}/>Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users,    label:"Browse Talent",      sub:"78 attendees with open CVs",       key:"talent"     as PageKey, color:"bg-blue-50",   ic:"text-blue-600"   },
          { icon: Calendar, label:"Schedule Interviews", sub:"3 booked · 2 pending",             key:"interviews" as PageKey, color:"bg-purple-50", ic:"text-purple-600" },
          { icon: Building2,label:"Booth Setup",         sub:"85% complete",                     key:"booth"      as PageKey, color:"bg-teal-50",   ic:"text-teal-600"   },
          { icon: MessageSquare,label:"Outreach",        sub:"9 messages sent · 5 replies",      key:"outreach"   as PageKey, color:"bg-rose-50",   ic:"text-rose-600"   },
        ].map(a => (
          <button key={a.key} onClick={() => onNav(a.key as PageKey)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm text-left transition-all group">
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center flex-shrink-0`}>
              <a.icon size={18} className={a.ic}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800">{a.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{a.sub}</div>
            </div>
            <ChevronRight size={13} className="text-gray-200 group-hover:text-gray-400 flex-shrink-0"/>
          </button>
        ))}
      </div>

      {/* Top candidates */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Recommended Candidates</CardTitle>
            <button onClick={() => onNav("talent")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">View all<ChevronRight size={12}/></button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {candidates.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer transition-all">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800">{c.name}</div>
                <div className="text-[11px] text-gray-500">{c.field} · {c.institution}</div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {c.skills.slice(0,2).map(s => <Pill key={s} label={s} color="bg-gray-100 text-gray-600"/>)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Pill label={c.level} color={levelColor[c.level]}/>
                <div className="text-[10px] text-gray-400 mt-1">{c.exp}yr exp</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interview snapshot */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Upcoming Interviews</CardTitle>
            <button onClick={() => onNav("interviews")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">Manage<ChevronRight size={12}/></button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {interviews.map(iv => (
            <div key={iv.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${iv.gradient} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                {iv.candidate.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800">{iv.candidate}</div>
                <div className="text-[11px] text-gray-500">{iv.role} · {iv.time}</div>
              </div>
              <Pill label={iv.status} color={iv.status==="confirmed"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Talent Hub ─────────────────────────────────────────────────────────
type Candidate = typeof candidates[0];
function TalentPage({ onContact, onSchedule }: {
  onContact: (c: Candidate) => void;
  onSchedule: (c: Candidate) => void;
}) {
  const [bookmarked, setBookmarked] = useState<number[]>([3]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [openId, setOpenId] = useState<number|null>(null);

  const levels = ["All", "PhD", "MS", "BS", "Industry"];

  const shown = candidates.filter(c => {
    const q = search.toLowerCase();
    const matchesQ = !q || c.name.toLowerCase().includes(q) || c.field.toLowerCase().includes(q) ||
      c.institution.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
    const matchesL = levelFilter === "All" || c.level === levelFilter;
    return matchesQ && matchesL;
  });

  const open = shown.find(c => c.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Talent Hub</h2>
          <p className="text-xs text-gray-500 mt-0.5">{candidates.filter(c=>c.open).length} attendees with open CVs</p>
        </div>
        <Button size="sm" variant="outline" className="text-xs gap-1.5"><Download size={12}/>Export List</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
            placeholder="Search name, field, skill, institution..."/>
        </div>
        {levels.map(l => (
          <button key={l} onClick={() => setLevelFilter(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors ${levelFilter===l?"bg-blue-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${open ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Candidate list */}
        <div className="space-y-2.5">
          {shown.map(c => {
            const isBookmarked = bookmarked.includes(c.id);
            const isOpen = openId === c.id;
            return (
              <Card key={c.id}
                onClick={() => setOpenId(isOpen ? null : c.id)}
                className={`border cursor-pointer transition-all shadow-none ${isOpen ? "border-blue-300 bg-blue-50/30" : "border-gray-100 hover:border-gray-200"}`}>
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                        <Pill label={c.level} color={levelColor[c.level]}/>
                        {c.status==="interviewing" && <Pill label="Interviewing" color="bg-amber-100 text-amber-700"/>}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{c.institution} · {c.country} · {c.exp}yr exp</div>
                      <div className="text-[11px] text-blue-600 mt-0.5">{c.field}</div>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {c.skills.map(s => <Pill key={s} label={s} color="bg-gray-100 text-gray-600"/>)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setBookmarked(b => isBookmarked ? b.filter(x=>x!==c.id) : [...b, c.id]); }}
                        className={`p-1 rounded transition-colors ${isBookmarked ? "text-blue-500" : "text-gray-300 hover:text-blue-400"}`}>
                        {isBookmarked ? <Bookmark size={14} className="fill-blue-500"/> : <BookmarkPlus size={14}/>}
                      </button>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Eye size={10}/>{c.views}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {shown.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-400">No candidates match your filters.</div>
          )}
        </div>

        {/* Detail panel */}
        {open && (
          <div className="space-y-3">
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${open.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {open.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900">{open.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{open.institution} · {open.country}</div>
                    <div className="text-xs text-blue-600 mt-0.5">{open.field} · {open.level}</div>
                  </div>
                  <button onClick={() => setOpenId(null)} className="text-gray-300 hover:text-gray-500 p-1"><X size={14}/></button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:"Level",      value:open.level },
                    { label:"Experience", value:`${open.exp} year${open.exp!==1?"s":""}` },
                    { label:"GPA",        value:open.gpa },
                    { label:"Country",    value:open.country },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-lg px-2.5 py-2">
                      <div className="text-[10px] text-gray-400">{f.label}</div>
                      <div className="text-xs font-semibold text-gray-800 mt-0.5">{f.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {open.skills.map(s => <Pill key={s} label={s} color="bg-blue-50 text-blue-700"/>)}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                    <Download size={12}/>Download CV
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-blue-200 text-blue-600"
                    onClick={() => onSchedule(open)}>
                    <Calendar size={12}/>Schedule Interview
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5"
                    onClick={() => onContact(open)}>
                    <MessageSquare size={12}/>Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page: Booth Setup ────────────────────────────────────────────────────────
function BoothPage() {
  const [boothName, setBoothName] = useState("Google DeepMind MENA");
  const [tagline, setTagline] = useState("Building AI that benefits everyone.");
  const [desc, setDesc] = useState("Google DeepMind is a world-leading AI research lab. We'll be showcasing our latest work on Arabic language models, AI safety, and open roles across MENA.");
  const [rolesOpen, setRolesOpen] = useState(["ML Research Intern","Senior AI Engineer","Research Scientist"]);
  const [newRole, setNewRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [bannerUploaded, setBannerUploaded] = useState(true);
  
  const boothDays = ["Apr 15","Apr 16","Apr 17","Apr 18"];
  const boothShifts = ["09:00-12:00","12:00-15:00","15:00-18:00"];
  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>({
    "Apr 15": { "09:00-12:00": "Dr. Aisha Rahman", "12:00-15:00": "Omar Siddiqui", "15:00-18:00": "Layla Hassan" },
    "Apr 16": { "09:00-12:00": "Omar Siddiqui", "12:00-15:00": "Layla Hassan", "15:00-18:00": "Dr. Aisha Rahman" },
    "Apr 17": { "09:00-12:00": "Layla Hassan", "12:00-15:00": "Dr. Aisha Rahman", "15:00-18:00": "Omar Siddiqui" },
    "Apr 18": { "09:00-12:00": "Dr. Aisha Rahman", "12:00-15:00": "Omar Siddiqui", "15:00-18:00": "Layla Hassan" },
  });

  const completedSteps = [bannerUploaded, boothName.length > 0, desc.length > 0, rolesOpen.length > 0, true].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Booth Setup</h2>
          <p className="text-xs text-gray-500 mt-0.5">MENA Summit 2026 · Hall A, Booth #12</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">{completedSteps}/5 steps</div>
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width:`${(completedSteps/5)*100}%` }}/>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={14} className="text-green-600"/>
          <span className="text-xs text-green-700 font-medium">Booth profile saved successfully!</span>
          <button onClick={() => setSaved(false)} className="ml-auto text-green-500 hover:text-green-700"><X size={12}/></button>
        </div>
      )}

      {/* Banner */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Image size={14} className="text-teal-500"/>Booth Banner</CardTitle>
            {bannerUploaded && <Pill label="Uploaded" color="bg-green-100 text-green-700"/>}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {bannerUploaded ? (
            <div className="w-full h-24 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 flex items-center justify-center relative group cursor-pointer" onClick={() => setBannerUploaded(false)}>
              <div className="text-white/60 text-sm font-bold tracking-widest">GOOGLE DEEPMIND MENA</div>
              <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs flex items-center gap-1"><Upload size={12}/>Replace</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 transition-colors" onClick={() => setBannerUploaded(true)}>
              <Upload size={18} className="text-gray-300 mb-1"/>
              <span className="text-xs text-gray-400">Upload banner image (1920×400px recommended)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Building2 size={14} className="text-teal-500"/>Company Profile</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Company Name</label>
            <input value={boothName} onChange={e => setBoothName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-300"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-300"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-teal-300"/>
          </div>
        </CardContent>
      </Card>

      {/* Open roles */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Briefcase size={14} className="text-teal-500"/>Open Roles</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          <div className="space-y-2">
            {rolesOpen.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-teal-50 border border-teal-100 rounded-lg">
                <Briefcase size={12} className="text-teal-500 flex-shrink-0"/>
                <span className="text-xs text-gray-700 flex-1">{r}</span>
                <button onClick={() => setRolesOpen(rs => rs.filter((_,j)=>j!==i))} className="text-gray-300 hover:text-red-400 transition-colors"><X size={12}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newRole} onChange={e => setNewRole(e.target.value)}
              placeholder="Add a role..." onKeyDown={e => { if(e.key==="Enter"&&newRole.trim()){ setRolesOpen(r=>[...r,newRole.trim()]); setNewRole(""); }}}
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-300"/>
            <Button size="sm" variant="outline" onClick={() => { if(newRole.trim()){ setRolesOpen(r=>[...r,newRole.trim()]); setNewRole(""); }}}
              className="text-xs border-teal-200 text-teal-600 px-3">
              <Plus size={13}/>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attending team */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users size={14} className="text-teal-500"/>Attending Team</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {boothTeam.map(m => (
            <div key={m.name} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                {m.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800">{m.name}</div>
                <div className="text-[10px] text-gray-500">{m.role}</div>
              </div>
              <button className="text-gray-300 hover:text-gray-500"><Edit3 size={12}/></button>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs border-dashed gap-1.5">
            <Plus size={12}/>Add Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Booth Attendance Schedule */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Calendar size={14} className="text-teal-500"/>Booth Attendance Schedule</CardTitle>
            <Pill label="Covered" color="bg-green-100 text-green-700"/>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ensure the booth is staffed throughout the event</p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="overflow-x-auto">
            <div className="inline-block w-full min-w-max">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {/* Time shifts column */}
                <div className="flex flex-col bg-gray-50 border-r border-gray-200">
                  <div className="w-[120px] h-10 flex items-center px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200"></div>
                  {boothShifts.map(shift => (
                    <div key={shift} className="w-[120px] h-12 flex items-center px-3 text-[11px] font-semibold text-gray-700 border-b border-gray-100 last:border-b-0">
                      {shift}
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {boothDays.map(day => (
                  <div key={day} className="flex flex-col border-r border-gray-200 last:border-r-0">
                    <div className="w-[140px] h-10 flex items-center justify-center px-3 text-[11px] font-bold text-gray-700 bg-gray-50 border-b border-gray-200">
                      {day}
                    </div>
                    {boothShifts.map(shift => (
                      <div key={`${day}-${shift}`} className="w-[140px] h-12 flex items-center px-2 border-b border-gray-100 last:border-b-0 hover:bg-teal-50/30 transition-colors group">
                        <select 
                          value={schedule[day]?.[shift] || ""}
                          onChange={e => setSchedule(s => ({
                            ...s,
                            [day]: { ...s[day], [shift]: e.target.value }
                          }))}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-300 group-hover:border-teal-300 cursor-pointer">
                          <option value="">Unassigned</option>
                          {boothTeam.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coverage status */}
          <div className="mt-4 space-y-2">
            {boothDays.map(day => {
              const shifts = boothShifts.map(s => schedule[day]?.[s]).filter(Boolean);
              const allCovered = shifts.length === boothShifts.length;
              return (
                <div key={day} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${allCovered ? "bg-green-500" : "bg-amber-400"}`}/>
                  <span className="flex-1 text-gray-700 font-medium">{day}</span>
                  <span className={allCovered ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
                    {shifts.length}/{boothShifts.length} shifts covered
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs" onClick={() => setSaved(true)}>
        <Check size={13} className="mr-1.5"/>Save Booth Profile
      </Button>
    </div>
  );
}

// ─── Page: Event Agenda ────────────────────────────────────────────────────────
function EventAgendaPage() {
  const [selectedDay, setSelectedDay] = useState("Apr 15");
  const [viewMode, setViewMode] = useState<"list"|"agenda">("list");
  const days = ["Apr 15","Apr 16","Apr 17","Apr 18"];
  
  const eventSchedule: Record<string, Array<{time: string; title: string; location: string; type: "keynote" | "workshop" | "lunch" | "break"}>> = {
    "Apr 15": [
      { time:"09:00-09:30", title:"Opening Keynote: The Future of AI in MENA", location:"Main Hall", type:"keynote" },
      { time:"09:45-11:00", title:"Workshop: Building Arabic NLP Models", location:"Hall A", type:"workshop" },
      { time:"11:15-12:30", title:"Workshop: AI Safety & Ethics", location:"Hall B", type:"workshop" },
      { time:"12:30-13:30", title:"Lunch Break", location:"Cafeteria", type:"lunch" },
      { time:"13:30-14:45", title:"Panel: The Future of AI Careers", location:"Main Hall", type:"workshop" },
      { time:"15:00-16:00", title:"Networking Session", location:"Exhibition Hall", type:"break" },
      { time:"16:00-17:00", title:"Closing Remarks", location:"Main Hall", type:"keynote" },
    ],
    "Apr 16": [
      { time:"09:00-10:15", title:"Workshop: Prompt Engineering & LLMs", location:"Hall A", type:"workshop" },
      { time:"10:30-11:45", title:"Technical Talk: Scaling AI Infrastructure", location:"Hall C", type:"workshop" },
      { time:"12:00-13:00", title:"Lunch Break", location:"Cafeteria", type:"lunch" },
      { time:"13:00-14:30", title:"Pitch Competition", location:"Main Hall", type:"workshop" },
      { time:"14:45-16:00", title:"Workshop: Computer Vision Applications", location:"Hall B", type:"workshop" },
      { time:"16:15-17:15", title:"Networking & Refreshments", location:"Exhibition Hall", type:"break" },
    ],
    "Apr 17": [
      { time:"09:00-10:30", title:"Workshop: Building Production ML Systems", location:"Hall A", type:"workshop" },
      { time:"10:45-12:00", title:"Panel: Starting an AI Startup", location:"Main Hall", type:"workshop" },
      { time:"12:00-13:00", title:"Lunch Break", location:"Cafeteria", type:"lunch" },
      { time:"13:00-14:15", title:"Workshop: Data Privacy & Compliance", location:"Hall C", type:"workshop" },
      { time:"14:30-15:45", title:"Roundtable: Women in AI/ML", location:"Hall B", type:"workshop" },
      { time:"16:00-17:00", title:"Coffee & Conversations", location:"Exhibition Hall", type:"break" },
    ],
    "Apr 18": [
      { time:"09:00-10:30", title:"Workshop: AI for Social Good", location:"Hall A", type:"workshop" },
      { time:"10:45-12:00", title:"Technical Deep Dive: Transformers & Beyond", location:"Main Hall", type:"workshop" },
      { time:"12:00-13:00", title:"Lunch Break", location:"Cafeteria", type:"lunch" },
      { time:"13:00-14:30", title:"Workshop: Monetizing AI Products", location:"Hall B", type:"workshop" },
      { time:"14:45-15:45", title:"Awards & Closing Ceremony", location:"Main Hall", type:"keynote" },
      { time:"16:00+", title:"Networking Dinner (By Invitation)", location:"Dubai Ballroom", type:"break" },
    ],
  };

  const typeColors: Record<string, { bg: string; text: string; icon: string }> = {
    keynote: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: "🎯" },
    workshop: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: "📚" },
    lunch: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "🍽️" },
    break: { bg: "bg-teal-50 border-teal-200", text: "text-teal-700", icon: "☕" },
  };

  const daySchedule = eventSchedule[selectedDay] || [];

  const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const locations = Array.from(new Set(daySchedule.map(s => s.location))).sort();

  function getSessionsForTimeLocation(time: string, location: string) {
    return daySchedule.filter(s => {
      const [startStr] = s.time.split("-");
      return startStr.startsWith(time.slice(0,2)) && s.location === location;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Event Agenda</h2>
          <p className="text-xs text-gray-500 mt-0.5">MENA Summit 2026 · April 15–18, Dubai</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <LayoutList size={11}/>List
          </button>
          <button onClick={() => setViewMode("agenda")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === "agenda" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <CalendarDays size={11}/>Agenda
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2">
        {days.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium flex-shrink-0 transition-colors ${selectedDay===d?"bg-blue-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
            {d.replace("Apr ","Apr ")}
          </button>
        ))}
      </div>

      {viewMode === "list" ? (
        <>
          {/* List View */}
          <div className="space-y-2">
            {daySchedule.map((session, i) => {
              const colors = typeColors[session.type];
              return (
                <div key={i} className={`border rounded-lg p-3 ${colors.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`text-lg flex-shrink-0 mt-0.5`}>{colors.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${colors.text}`}>{session.title}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs ${colors.text} font-semibold`}>{session.time}</span>
                        <span className={`text-xs ${colors.text} opacity-70`}>📍 {session.location}</span>
                      </div>
                    </div>
                    <button className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${colors.text} ${colors.bg} hover:shadow-sm flex-shrink-0`}>
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Agenda View */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: Math.max(800, locations.length * 200 + 120) }}>
                <div className="flex border-b border-gray-100 bg-gray-50">
                  <div className="w-[100px] flex-shrink-0 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide border-r border-gray-100">Time</div>
                  {locations.map(loc => (
                    <div key={loc} style={{ minWidth: "180px" }} className="flex-1 px-3 py-2 text-[10px] font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                      {loc}
                    </div>
                  ))}
                </div>

                {timeSlots.map((slot, idx) => (
                  <div key={slot} className={`flex border-b border-gray-100 last:border-b-0 ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <div className="w-[100px] flex-shrink-0 px-3 py-2 text-[10px] font-semibold text-gray-600 border-r border-gray-100 bg-gray-50">
                      {slot}
                    </div>
                    {locations.map(loc => {
                      const sessions = getSessionsForTimeLocation(slot, loc);
                      const session = sessions[0];
                      return (
                        <div key={`${slot}-${loc}`} style={{ minWidth: "180px" }} className="flex-1 px-2 py-2 border-r border-gray-100 last:border-r-0 min-h-[60px] flex items-center">
                          {session ? (
                            <div className={`w-full rounded p-2 text-[10px] font-medium ${typeColors[session.type].bg} ${typeColors[session.type].text}`}>
                              <div className="font-bold truncate">{typeColors[session.type].icon} {session.title.split(":")[1]?.trim() || session.title}</div>
                              <div className="text-[9px] opacity-75 mt-0.5">{session.time}</div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      <Card className="border-gray-100 shadow-none bg-gray-50/50">
        <CardContent className="p-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Session Types</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(typeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-base">{colors.icon}</span>
                <span className="text-xs text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Outreach ───────────────────────────────────────────────────────────
function OutreachPage({ preSelected }: { preSelected?: Candidate | null }) {
  const [to, setTo] = useState(preSelected?.name ?? "");
  const [role, setRole] = useState("ML Research Intern");
  const [body, setBody] = useState(preSelected
    ? `Hi ${preSelected.name.split(" ")[0]},\n\nWe noticed your impressive work on ${preSelected.field} and would love to connect at the MENA Summit 2026.\n\nWe have an exciting opportunity that might be a great fit for your background.\n\nLooking forward to meeting you at our booth #12!\n\nBest,\nGoogle DeepMind MENA Team`
    : "");
  const [sent, setSent] = useState<string[]>([]);
  const [tab, setTab] = useState<"compose"|"sent">("compose");

  function send() {
    if (!to.trim() || !body.trim()) return;
    setSent(s => [...s, to]);
    setTo(""); setBody("");
    setTab("sent");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Outreach</h2>
        <p className="text-xs text-gray-500 mt-0.5">Reach out to attendees directly</p>
      </div>

      <div className="flex gap-2 border-b border-gray-100 pb-2">
        {(["compose","sent"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab===t?"bg-rose-600 text-white":"text-gray-600 hover:bg-gray-50"}`}>
            {t === "sent" ? `Sent (${messages.length + sent.length})` : "Compose"}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <Card className="border-gray-100 shadow-none">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">To (Attendee name or email)</label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={to} onChange={e => setTo(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300"
                  placeholder="e.g. Rania Khalil or rania@nyu.edu"/>
              </div>
            </div>

            {/* Template suggestion */}
            {!preSelected && (
              <div>
                <label className="text-xs font-medium text-gray-700">Template</label>
                <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                  {["Intro & Connect","Role Offer","Booth Invite","Research Collab"].map(t => (
                    <button key={t} onClick={() => setBody(`Hi [Name],\n\nWe're excited to connect with you at MENA Summit 2026. [Personalize here]\n\nBest,\nGoogle DeepMind MENA`)}
                      className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-600 transition-colors flex items-center gap-1">
                      <Sparkles size={10}/>{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Role of Interest</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white">
                <option>ML Research Intern</option>
                <option>Senior AI Engineer</option>
                <option>Research Scientist</option>
                <option>General Interest</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7}
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
                placeholder="Write a personalised message..."/>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5" onClick={send}>
                <Send size={12}/>Send Message
              </Button>
              <Button variant="outline" size="sm" className="text-xs px-3">Save Draft</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {[...messages, ...sent.map((name, i) => ({ id:100+i, to:name, role:"Attendee", preview:"Sent via outreach form", time:"Just now", read:false }))].map((m, i) => (
            <Card key={i} className="border-gray-100 shadow-none">
              <CardContent className="p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {("to" in m ? m.to : "").split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800">{"to" in m ? m.to : ""}</span>
                    {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"/>}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{"role" in m ? m.role : ""}</div>
                  <div className="text-[11px] text-gray-500 mt-1 truncate">{m.preview}</div>
                </div>
                <div className="text-[10px] text-gray-400 flex-shrink-0">{m.time}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page: Interview Scheduler ────────────────────────────────────────────────
const days = ["Apr 15", "Apr 16", "Apr 17", "Apr 18"];
const slots = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];

function roomName(roomId: string) {
  return INTERVIEW_ROOMS.find(r => r.id === roomId)?.name ?? roomId;
}
function roomShort(roomId: string) {
  return roomName(roomId).replace("Interview ", "");
}

const STATUS_BLOCK_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "bg-green-500", text: "text-white" },
  pending:   { bg: "bg-amber-400", text: "text-white" },
};

function AgendaView({ booked, selectedDay, onDelete }: {
  booked: InterviewEntry[]; selectedDay: string;
  onDelete: (id: number) => void;
}) {
  const [detailId, setDetailId] = useState<number|null>(null);
  useEffect(() => { setDetailId(null); }, [selectedDay]);
  const dayInterviews = booked.filter(b => b.time.startsWith(selectedDay));
  const agendaSlots = slots;
  const roomIds = INTERVIEW_ROOMS.map(r => r.id);
  const detailInterview = detailId !== null ? booked.find(b => b.id === detailId) : null;

  function getSlotIndex(time: string) {
    const slot = time.split("· ")[1];
    return agendaSlots.indexOf(slot);
  }

  const now = new Date();
  const nowSlotIdx = (() => {
    const eventDates: Record<string,string> = { "Apr 15":"2026-04-15", "Apr 16":"2026-04-16", "Apr 17":"2026-04-17", "Apr 18":"2026-04-18" };
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (eventDates[selectedDay] !== todayStr) return -1;
    const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    let closest = -1;
    for (let i = 0; i < agendaSlots.length; i++) {
      if (agendaSlots[i] <= hhmm) closest = i;
    }
    return closest;
  })();

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: agendaSlots.length * 80 + 120 }}>
            <div className="flex border-b border-gray-100 bg-gray-50">
              <div className="w-[120px] flex-shrink-0 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide border-r border-gray-100">
                Room
              </div>
              {agendaSlots.map((s, idx) => (
                <div key={s} className={`flex-1 min-w-[80px] px-1 py-2 text-center text-[10px] font-semibold border-r border-gray-50 last:border-r-0 ${idx === nowSlotIdx ? "text-purple-700 bg-purple-50/50" : "text-gray-500"}`}>
                  {s}
                </div>
              ))}
            </div>

            {roomIds.map(rId => {
              const room = INTERVIEW_ROOMS.find(r => r.id === rId)!;
              const roomInterviews = dayInterviews.filter(iv => iv.roomId === rId);

              return (
                <div key={rId} className="flex border-b border-gray-50 last:border-b-0 group/row hover:bg-gray-50/30">
                  <div className="w-[120px] flex-shrink-0 px-3 py-3 border-r border-gray-100 flex items-center gap-1.5">
                    <DoorOpen size={11} className="text-gray-400 flex-shrink-0"/>
                    <div>
                      <div className="text-[11px] font-semibold text-gray-700">{room.name.replace("Interview ","")}</div>
                      <div className="text-[9px] text-gray-400">{room.capacity} pax</div>
                    </div>
                  </div>
                  <div className="flex-1 flex relative" style={{ minHeight: 56 }}>
                    {agendaSlots.map((s, idx) => (
                      <div key={s} className={`flex-1 min-w-[80px] border-r border-gray-50 last:border-r-0 ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}/>
                    ))}
                    {nowSlotIdx >= 0 && (
                      <div className="absolute top-0 bottom-0 w-[2px] bg-purple-500 z-10"
                        style={{ left: `${(nowSlotIdx + 0.5) * (100 / agendaSlots.length)}%` }}/>
                    )}
                    {roomInterviews.map(iv => {
                      const slotIdx = getSlotIndex(iv.time);
                      if (slotIdx < 0) return null;
                      const left = slotIdx * (100 / agendaSlots.length);
                      const width = 100 / agendaSlots.length;
                      const sc = STATUS_BLOCK_COLORS[iv.status] || STATUS_BLOCK_COLORS.pending;
                      const isSelected = detailId === iv.id;
                      return (
                        <div key={iv.id}
                          onClick={() => setDetailId(isSelected ? null : iv.id)}
                          className={`absolute top-1 bottom-1 rounded-lg ${sc.bg} ${sc.text} px-2 py-1 flex flex-col justify-center overflow-hidden cursor-pointer hover:shadow-md transition-all group/block ${isSelected ? "ring-2 ring-purple-400 ring-offset-1 shadow-lg" : ""}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${iv.candidate} · ${iv.role} · ${roomShort(iv.roomId)} · ${iv.time}`}
                        >
                          <div className="flex items-center gap-1">
                            <div className="text-[10px] font-bold truncate leading-tight">{iv.candidate}</div>
                            <span className={`flex-shrink-0 text-[7px] font-semibold px-1 py-px rounded ${iv.status === "confirmed" ? "bg-white/30" : "bg-white/25"}`}>
                              {iv.status === "confirmed" ? "✓" : "⏳"}
                            </span>
                          </div>
                          <div className="text-[8px] opacity-90 truncate leading-tight">{iv.role}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[7px] opacity-80">{iv.time.split("· ")[1]}</span>
                            <span className="text-[7px] opacity-80">·</span>
                            <span className="text-[7px] opacity-80">{roomShort(iv.roomId)}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(iv.id); }}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded opacity-0 group-hover/block:opacity-100 hover:bg-white/20 transition-opacity">
                            <X size={8}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-[9px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500 inline-block"/>Confirmed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400 inline-block"/>Pending</span>
          {nowSlotIdx >= 0 && <span className="flex items-center gap-1"><span className="w-[8px] h-[2px] bg-purple-500 inline-block rounded"/>Now</span>}
          <span className="ml-auto">{dayInterviews.length} interview{dayInterviews.length !== 1 ? "s" : ""} on {selectedDay}</span>
        </div>
      </div>

      {detailInterview && (
        <Card className="border-purple-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${detailInterview.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {detailInterview.candidate.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{detailInterview.candidate}</span>
                  <Pill label={detailInterview.status} color={detailInterview.status==="confirmed"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}/>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{detailInterview.role}</div>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-600">
                  <span className="flex items-center gap-1"><Clock size={10} className="text-gray-400"/>{detailInterview.time}</span>
                  <span className="flex items-center gap-1"><DoorOpen size={10} className="text-gray-400"/>{roomName(detailInterview.roomId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><MessageSquare size={14}/></button>
                <button onClick={() => { onDelete(detailInterview.id); setDetailId(null); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                <button onClick={() => setDetailId(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X size={14}/></button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InterviewsPage({ preSchedule }: { preSchedule?: Candidate | null }) {
  const [booked, setBooked] = useState<InterviewEntry[]>([...interviews]);
  const [selectedDay, setSelectedDay] = useState("Apr 15");
  const [selectedSlot, setSelectedSlot] = useState<string|null>(null);
  const [selectedRoom, setSelectedRoom] = useState(INTERVIEW_ROOMS[0].id);
  const [candidate, setCandidate] = useState(preSchedule?.name ?? "");
  const [role, setRole] = useState("ML Research Intern");
  const [mode, setMode] = useState<"list"|"book">(preSchedule ? "book" : "list");
  const [viewMode, setViewMode] = useState<"list"|"agenda">("list");
  const [confirming, setConfirming] = useState(false);

  function isSlotFullyBooked(day: string, slot: string) {
    return INTERVIEW_ROOMS.every(r => booked.some(b => b.roomId === r.id && b.time === `${day} · ${slot}`));
  }

  function roomTakenForSlot(roomId: string, day: string, slot: string | null) {
    if (!slot) return false;
    return booked.some(b => b.roomId === roomId && b.time === `${day} · ${slot}`);
  }

  function roomsAvailableForSlot(day: string, slot: string | null) {
    if (!slot) return INTERVIEW_ROOMS.length;
    return INTERVIEW_ROOMS.filter(r => !booked.some(b => b.roomId === r.id && b.time === `${day} · ${slot}`)).length;
  }

  function book() {
    if (!selectedSlot || !candidate.trim() || roomTakenForSlot(selectedRoom, selectedDay, selectedSlot)) return;
    setBooked(b => [...b, { id:Date.now(), candidate, role, time:`${selectedDay} · ${selectedSlot}`, status:"pending", gradient:"from-gray-400 to-gray-500", roomId: selectedRoom }]);
    setConfirming(true);
    setMode("list");
  }

  function handleDelete(id: number) {
    setBooked(b => b.filter(x => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Interview Scheduler</h2>
          <p className="text-xs text-gray-500 mt-0.5">{booked.length} interviews booked · on-site at Booth #12</p>
        </div>
        <div className="flex items-center gap-2">
          {mode !== "book" && (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <LayoutList size={11}/>List
              </button>
              <button onClick={() => { setViewMode("agenda"); if (selectedDay === "All") setSelectedDay("Apr 15"); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === "agenda" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <CalendarDays size={11}/>Agenda
              </button>
            </div>
          )}
          <Button size="sm" onClick={() => { setMode("book"); setConfirming(false); }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5">
            <Plus size={12}/>Book Slot
          </Button>
        </div>
      </div>

      {confirming && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={14} className="text-green-600"/>
          <span className="text-xs text-green-700 font-medium">Interview request sent! The candidate will be notified.</span>
          <button onClick={() => setConfirming(false)} className="ml-auto text-green-500"><X size={12}/></button>
        </div>
      )}

      {mode === "book" ? (
        <Card className="border-purple-200 shadow-sm">
          <CardHeader className="pt-4 pb-2 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800">New Interview</CardTitle>
              <button onClick={() => setMode("list")} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Candidate</label>
              <input value={candidate} onChange={e => setCandidate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300"
                placeholder="Candidate name..."/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white">
                <option>ML Research Intern</option>
                <option>Senior AI Engineer</option>
                <option>Research Scientist</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Room</label>
              <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white">
                {INTERVIEW_ROOMS.map(r => {
                  const taken = roomTakenForSlot(r.id, selectedDay, selectedSlot);
                  return (
                    <option key={r.id} value={r.id} disabled={taken}>
                      {r.name} ({r.capacity} pax){taken ? " — Booked" : ""}
                    </option>
                  );
                })}
              </select>
              {selectedSlot && roomTakenForSlot(selectedRoom, selectedDay, selectedSlot) && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1">
                  <AlertCircle size={10}/>This room is booked for the selected slot. Pick another room.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Day</label>
              <div className="flex gap-2">
                {days.map(d => (
                  <button key={d} onClick={() => { setSelectedDay(d); setSelectedSlot(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedDay===d?"bg-purple-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {d.replace("Apr ","")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Time Slot</label>
              <div className="grid grid-cols-4 gap-1.5">
                {slots.map(s => {
                  const fullyBooked = isSlotFullyBooked(selectedDay, s);
                  const availRooms = roomsAvailableForSlot(selectedDay, s);
                  const selected = selectedSlot === s;
                  return (
                    <button key={s} disabled={fullyBooked} onClick={() => setSelectedSlot(s)}
                      className={`py-1.5 text-xs rounded-lg border transition-all ${
                        fullyBooked ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : selected ? "border-purple-400 bg-purple-50 text-purple-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
                      }`}>
                      {fullyBooked ? "—" : s}
                      {!fullyBooked && availRooms < INTERVIEW_ROOMS.length && (
                        <span className="block text-[8px] opacity-60">{availRooms} room{availRooms !== 1 ? "s" : ""}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-100 border border-gray-200 inline-block"/>All rooms taken</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-100 border border-purple-300 inline-block"/>Selected</span>
              </div>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
              disabled={!selectedSlot || !candidate.trim() || roomTakenForSlot(selectedRoom, selectedDay, selectedSlot)} onClick={book}>
              <Calendar size={12}/>Send Interview Invite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            {(viewMode === "agenda" ? days : ["All", ...days]).map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium flex-shrink-0 transition-colors ${selectedDay===d?"bg-purple-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                {d}
              </button>
            ))}
          </div>

          {viewMode === "agenda" ? (
            <AgendaView booked={booked} selectedDay={selectedDay} onDelete={handleDelete}/>
          ) : (
            <div className="space-y-2.5">
              {booked.filter(b => selectedDay==="All" || b.time.startsWith(selectedDay)).map(iv => (
                <Card key={iv.id} className="border-gray-100 shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${iv.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {iv.candidate.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800">{iv.candidate}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{iv.role}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-400"/>
                          <span className="text-[11px] text-gray-600 font-medium">{iv.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <DoorOpen size={10} className="text-gray-400"/>
                          <span className="text-[10px] text-purple-600 font-medium bg-purple-50 px-1.5 py-0.5 rounded">{roomShort(iv.roomId)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Pill label={iv.status} color={iv.status==="confirmed"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}/>
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500"><MessageSquare size={12}/></button>
                        <button onClick={() => handleDelete(iv.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-400"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {booked.filter(b => selectedDay==="All" || b.time.startsWith(selectedDay)).length === 0 && (
                <div className="text-center py-10 text-xs text-gray-400">No interviews for this day.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const navItems: { icon: React.ElementType; label: string; key: PageKey; badge?: string }[] = [
  { icon: LayoutDashboard, label:"Dashboard",          key:"dashboard" },
  { icon: Users,           label:"Talent Hub",         key:"talent",     badge:"78" },
  { icon: Building2,       label:"Booth Setup",        key:"booth" },
  { icon: MessageSquare,   label:"Outreach",           key:"outreach",   badge:"5" },
  { icon: Calendar,        label:"Interviews",         key:"interviews", badge:"3" },
  { icon: CalendarDays,    label:"Event Agenda",       key:"agenda" },
];

const pageTitles: Record<PageKey, string> = {
  dashboard:"Dashboard", talent:"Talent Hub",
  booth:"Booth Setup", outreach:"Outreach", interviews:"Interviews", agenda:"Event Agenda",
};

export function SponsorView({ onLogout }: { onLogout?: () => void } = {}) {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [preCandidate, setPreCandidate] = useState<Candidate|null>(null);

  function goContact(c: Candidate) { setPreCandidate(c); setPage("outreach"); }
  function goSchedule(c: Candidate) { setPreCandidate(c); setPage("interviews"); }

  function handleNav(k: PageKey) {
    if (k !== page) setPreCandidate(null);
    setPage(k);
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe size={15} className="text-white"/>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">MenaML</span>
              <div className="text-[10px] text-gray-400 -mt-0.5">Sponsor Portal</div>
            </div>
          </div>
        </div>

        {/* Sponsor identity */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">G</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-gray-900 truncate">Google DeepMind</div>
              <div className="text-[9px] text-gray-500">Booth #12 · Hall A</div>
            </div>
            <Award size={12} className="text-yellow-500 flex-shrink-0"/>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
          {[
            { label:"CVs",       value:"78" },
            { label:"Msgs",      value:"9" },
            { label:"Intv.",     value:"3" },
          ].map(s => (
            <div key={s.label} className="bg-white px-2 py-2 text-center">
              <div className="text-sm font-bold text-gray-800">{s.value}</div>
              <div className="text-[9px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = page === item.key;
            return (
              <button key={item.key} onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                <Icon size={14} className={isActive ? "text-blue-600" : "text-gray-400"}/>
                <span className="flex-1 text-left text-xs">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AR</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">Dr. Aisha Rahman</div>
              <div className="text-[9px] text-gray-400">Head of AI Research</div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600"><Settings size={12}/></button>
            <button onClick={onLogout} title="Sign out" className="p-1 text-gray-400 hover:text-red-600"><LogOut size={12}/></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900">{pageTitles[page]}</h1>
            <p className="text-[10px] text-gray-500">MENA Summit 2026 · April 15–18, Dubai · Gold Sponsor</p>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={14}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>
          </button>
          <Badge className="bg-yellow-100 text-yellow-700 text-[10px] font-medium border-0 flex items-center gap-1">
            <Award size={10}/>Gold
          </Badge>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {page === "dashboard"  && <DashboardPage onNav={handleNav}/>}
          {page === "talent"     && <TalentPage onContact={goContact} onSchedule={goSchedule}/>}
          {page === "booth"      && <BoothPage/>}
          {page === "outreach"   && <OutreachPage preSelected={preCandidate}/>}
          {page === "interviews" && <InterviewsPage preSchedule={preCandidate}/>}
          {page === "agenda"     && <EventAgendaPage/>}
        </div>
      </main>
    </div>
  );
}
