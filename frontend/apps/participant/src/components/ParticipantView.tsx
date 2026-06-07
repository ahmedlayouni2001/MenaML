import { useState, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe, Bell, MapPin, Clock, Award, Calendar, Mic2, Users, Heart,
  MessageSquare, Download, ChevronRight, CheckCircle2, Wifi, FileText,
  Upload, Plane, Hotel, GraduationCap, Trophy, Share2, LogOut, Settings,
  ChevronDown, Star, Send, Instagram, Twitter, Linkedin, UserPlus,
  Bed, Bus, Ticket, BookOpen, Medal, TrendingUp, PlusCircle, ThumbsUp,
  Lock, AlertCircle, ChevronUp, ExternalLink, ClipboardList, Paperclip,
  AlignLeft, Camera, CheckCircle, ClipboardCheck,
  Briefcase, Building2, XCircle, RotateCcw, CalendarClock,
  QrCode, SmilePlus, Frown, Meh, Smile, Laugh, ScanLine,
  ChevronLeft, Network, Edit3, Radio,
  CalendarDays, Bookmark, BookmarkCheck, Coffee, Utensils, Presentation,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageKey =
  | "home" | "application"
  | "registration" | "pre-arrival"
  | "travel" | "accommodation" | "transportation"
  | "mentorship" | "challenges" | "attendees" | "socials" | "faq" | "interviews"
  | "attendance" | "feedback" | "networking" | "agenda";

// ─── Status: accepted or pending ─────────────────────────────────────────────
const USER_STATUS: "pending" | "accepted" = "accepted";

// ─── Nav ─────────────────────────────────────────────────────────────────────
const navItems: {
  icon: React.ElementType; label: string; key: PageKey;
  requiresAccepted?: boolean; badge?: string;
  children?: { label: string; key: PageKey }[];
}[] = [
  { icon: Globe,        label: "Home",              key: "home" },
  { icon: FileText,     label: "Application",        key: "application" },
  { icon: ClipboardList,  label: "Registration",       key: "registration" },
  { icon: CalendarDays,   label: "Agenda",             key: "agenda" },
  { icon: ClipboardCheck, label: "Pre-arrival Form",   key: "pre-arrival",    requiresAccepted: true },
  { icon: Plane,          label: "Travel & Accommodation", key: "travel",         requiresAccepted: true,
    children: [
      { label: "Ticket Info",       key: "travel" },
      { label: "Transportation",    key: "transportation" },
      { label: "Accommodation",     key: "accommodation" },
    ],
  },
  { icon: GraduationCap,label: "Mentorship",         key: "mentorship",     requiresAccepted: true },
  { icon: Trophy,       label: "Challenges",         key: "challenges",     requiresAccepted: true, badge: "🔥" },
  { icon: Users,        label: "Attendees",          key: "attendees",      requiresAccepted: true },
  { icon: Share2,       label: "Socials",            key: "socials",        requiresAccepted: true },
  { icon: BookOpen,     label: "FAQ",                key: "faq" },
  { icon: Briefcase,    label: "On-site Interviews", key: "interviews",     requiresAccepted: true, badge: "2" },
  { icon: Network,      label: "Networking",           key: "networking",     requiresAccepted: true },
  { icon: QrCode,       label: "Attendance",           key: "attendance",     requiresAccepted: true },
  { icon: SmilePlus,    label: "Feedback",             key: "feedback",       requiresAccepted: true },
];

// ─── Shared ───────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
);

const LockedPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
      <Lock size={24} className="text-gray-400" />
    </div>
    <div className="text-sm font-semibold text-gray-700">{title} is locked</div>
    <p className="text-xs text-gray-400 max-w-xs">This section becomes available once your application is accepted.</p>
  </div>
);

// ─── Page: Home ───────────────────────────────────────────────────────────────
const ORGANIZER_NOTIFS = [
  {
    id: "n1", unread: true,
    tag: "Logistics",  tagColor: "bg-amber-100 text-amber-700",
    title: "Shuttle schedule change — Apr 16",
    body: "The 18:00 shuttle from DWTC to the Marriott is cancelled on Apr 16. Use the 17:30 or 19:00 service instead. Full schedule available in Transportation.",
    time: "2h ago",
  },
  {
    id: "n2", unread: true,
    tag: "Programme", tagColor: "bg-blue-100 text-blue-700",
    title: "Poster slot assigned: B7, Hall C",
    body: "Your poster has been placed in Slot B7, Hall C (Apr 16, 15:00–16:30). Please arrive 30 min early to set up. Printing is arranged — no action needed.",
    time: "1d ago",
  },
  {
    id: "n3", unread: false,
    tag: "Welcome",   tagColor: "bg-emerald-100 text-emerald-700",
    title: "Badge collection opens Apr 14 at 16:00",
    body: "Collect your badge and welcome pack at Registration Desk A (lobby level, DWTC). Bring your acceptance email or passport. Desk is open 16:00–20:00.",
    time: "3d ago",
  },
];

function HomePage({ onNav }: { onNav: (k: PageKey) => void }) {
  const [readIds, setReadIds]   = useState<string[]>([]);
  const [openNid, setOpenNid]   = useState<string|null>(null);
  const [wifiOpen, setWifiOpen] = useState(false);

  const markRead = (id: string) => { setReadIds(r => r.includes(id) ? r : [...r, id]); };
  const unreadCount = ORGANIZER_NOTIFS.filter(n => n.unread && !readIds.includes(n.id)).length;

  const TODO_ITEMS = [
    { label: "Complete pre-arrival form",     done: false, nav: "pre-arrival"    as PageKey, urgent: true  },
    { label: "Submit travel request",         done: false, nav: "travel"         as PageKey, urgent: false },
    { label: "Choose accommodation type",     done: false, nav: "accommodation"  as PageKey, urgent: false },
    { label: "Book a mentor session",         done: false, nav: "mentorship"     as PageKey, urgent: false },
    { label: "Upload poster abstract",        done: true,  nav: "home"           as PageKey, urgent: false },
  ];
  const doneCount = TODO_ITEMS.filter(t => t.done).length;

  return (
    <div className="space-y-4">
      {/* ── Banner ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full -mb-8" />
        <div className="relative">
          <div className="text-xs text-emerald-100 mb-0.5 font-medium">Welcome back,</div>
          <div className="text-xl font-bold mb-2.5">Mohammed Al-Rashid</div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
              <MapPin size={11}/><span className="text-xs">Dubai, UAE</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
              <Clock size={11}/><span className="text-xs">28 days away</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
              <CheckCircle2 size={11}/><span className="text-xs font-semibold">Accepted ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Organizer Notifications ── */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={13} className="text-gray-500"/>
            <span className="text-sm font-semibold text-gray-800">From the Organizers</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {ORGANIZER_NOTIFS.map(n => {
            const isUnread = n.unread && !readIds.includes(n.id);
            const isOpen   = openNid === n.id;
            return (
              <button key={n.id} onClick={() => { markRead(n.id); setOpenNid(isOpen ? null : n.id); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2.5">
                  {isUnread
                    ? <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"/>
                    : <div className="w-2 h-2 rounded-full bg-transparent flex-shrink-0 mt-1.5"/>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${n.tagColor}`}>{n.tag}</span>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <div className={`text-xs font-semibold ${isUnread ? "text-gray-900" : "text-gray-600"}`}>{n.title}</div>
                    {isOpen && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{n.body}</p>}
                  </div>
                  <ChevronDown size={13} className={`text-gray-300 flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}/>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── To-Do List ── */}
      <Card className="border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={13} className="text-gray-500"/>
            <span className="text-sm font-semibold text-gray-800">Your To-Do List</span>
          </div>
          <span className="text-[11px] text-gray-400">{doneCount}/{TODO_ITEMS.length} done</span>
        </div>
        {/* progress bar */}
        <div className="mx-4 mb-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${(doneCount/TODO_ITEMS.length)*100}%`}}/>
        </div>
        <CardContent className="px-4 pb-4 space-y-1.5">
          {TODO_ITEMS.map(item => (
            <button key={item.label}
              onClick={() => !item.done && onNav(item.nav)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left group transition-colors ${item.done ? "opacity-60" : "hover:bg-gray-50"}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? "border-emerald-500 bg-emerald-500" : item.urgent ? "border-amber-400" : "border-gray-300"}`}>
                {item.done && <CheckCircle size={11} className="text-white"/>}
              </div>
              <span className={`text-xs flex-1 ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>{item.label}</span>
              {!item.done && item.urgent && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Due soon</span>}
              {!item.done && <ChevronRight size={13} className="text-gray-300 group-hover:text-emerald-400"/>}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ── WiFi & Logistics ── */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <button className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          onClick={()=>setWifiOpen(o=>!o)}>
          <div className="flex items-center gap-2">
            <Wifi size={13} className="text-purple-500"/>
            <span className="text-sm font-semibold text-gray-800">WiFi &amp; Logistics</span>
          </div>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${wifiOpen?"rotate-180":""}`}/>
        </button>
        {/* collapsed summary */}
        {!wifiOpen && (
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Wifi size={11} className="text-purple-500"/>
              <span className="font-mono font-bold">MENA2026</span>
            </div>
            <div className="text-gray-300">·</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Award size={11} className="text-emerald-500"/>
              <span>Badge #0312</span>
            </div>
            <div className="text-gray-300">·</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Hotel size={11} className="text-blue-500"/>
              <span>Marriott, Rm 1204</span>
            </div>
          </div>
        )}
        {/* expanded */}
        {wifiOpen && (
          <div className="px-4 pb-4 pt-3 space-y-3">
            {/* Venue WiFi */}
            <div className="bg-purple-50 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5"><Wifi size={11}/>Conference Venue (DWTC)</div>
              <div className="grid grid-cols-2 gap-2">
                {[{label:"Network",password:"DWTC_MENAML2026"},{label:"Password",password:"Summit@2026"}].map(f=>(
                  <div key={f.label}>
                    <div className="text-[10px] text-purple-500 mb-0.5">{f.label}</div>
                    <div className="font-mono text-xs font-bold text-purple-900 bg-purple-100 rounded-lg px-2 py-1.5">{f.password}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hotel WiFi */}
            <div className="bg-blue-50 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5"><Hotel size={11}/>Marriott Downtown Dubai</div>
              <div className="grid grid-cols-2 gap-2">
                {[{label:"Network",password:"Marriott_Guest"},{label:"Room code",password:"MENA2026"}].map(f=>(
                  <div key={f.label}>
                    <div className="text-[10px] text-blue-500 mb-0.5">{f.label}</div>
                    <div className="font-mono text-xs font-bold text-blue-900 bg-blue-100 rounded-lg px-2 py-1.5">{f.password}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Award,    label: "Badge No.",      value: "#0312",                  color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Hotel,    label: "Hotel Room",     value: "Room 1204",               color: "text-blue-600",    bg: "bg-blue-50" },
                { icon: MapPin,   label: "Venue",          value: "DWTC, Level 2",           color: "text-rose-500",    bg: "bg-rose-50" },
                { icon: Bus,      label: "Shuttle pickup", value: "Hotel lobby, every hour", color: "text-amber-600",   bg: "bg-amber-50" },
              ].map(f=>{
                const Icon = f.icon;
                return (
                  <div key={f.label} className={`${f.bg} rounded-xl p-2.5 flex items-start gap-2`}>
                    <Icon size={12} className={`${f.color} flex-shrink-0 mt-0.5`}/>
                    <div>
                      <div className="text-[10px] text-gray-500">{f.label}</div>
                      <div className={`text-xs font-semibold ${f.color}`}>{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ── Upcoming Sessions ── */}
      <Card className="border-gray-100 shadow-none">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Calendar size={13} className="text-gray-500"/>
          <span className="text-sm font-semibold text-gray-800">Upcoming Sessions</span>
        </div>
        <CardContent className="px-4 pb-4 space-y-2">
          {[
            { time: "09:00", title: "Opening Keynote",      room: "Hall A",  date: "Apr 15" },
            { time: "14:00", title: "Workshop: Arabic NLP", room: "Room B",  date: "Apr 15" },
            { time: "15:00", title: "Poster Session — Slot B7", room: "Hall C", date: "Apr 16" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 cursor-pointer transition-all">
              <div className="text-center flex-shrink-0 w-10">
                <div className="text-[10px] text-gray-400">{s.date}</div>
                <div className="text-xs font-mono font-bold text-gray-600">{s.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800">{s.title}</div>
                <div className="flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-gray-300"/><span className="text-[10px] text-gray-400">{s.room}</span></div>
              </div>
              <Heart size={13} className="text-gray-300 hover:text-rose-400 cursor-pointer flex-shrink-0"/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Application ────────────────────────────────────────────────────────
function ApplicationPage() {
  const [submitted] = useState(true);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Application</h2>
        <p className="text-xs text-gray-500 mt-0.5">MENA Summit 2026 · Submitted Mar 10, 2026</p>
      </div>

      {/* Status */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0"/>
        <div>
          <div className="text-sm font-semibold text-emerald-800">Application Accepted</div>
          <div className="text-xs text-emerald-600 mt-0.5">Congratulations! You've been accepted to MENA Summit 2026.</div>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Application Summary</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {[
            { label: "Full Name",          value: "Mohammed Al-Rashid" },
            { label: "Institution",        value: "King Abdullah University (KAUST)" },
            { label: "Country",            value: "Saudi Arabia" },
            { label: "Role",               value: "PhD Student — Machine Learning" },
            { label: "Application Type",   value: "Participant + Poster" },
            { label: "Research Area",      value: "Natural Language Processing" },
          ].map(f => (
            <div key={f.label} className="flex gap-3">
              <span className="text-xs text-gray-400 w-36 flex-shrink-0">{f.label}</span>
              <span className="text-xs font-medium text-gray-800">{f.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scholarship */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Scholarship Awarded</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {[
            { label: "Registration Fee",   value: "Waived",         icon: CheckCircle2, color: "text-green-500" },
            { label: "Travel Grant",       value: "$800",            icon: CheckCircle2, color: "text-green-500" },
            { label: "Accommodation",      value: "Covered (3 nights)", icon: CheckCircle2, color: "text-green-500" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon size={14} className={item.color}/>
                <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800">{item.value}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {!submitted && (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
          <Send size={14} className="mr-2"/>Submit Application
        </Button>
      )}
    </div>
  );
}

// ─── Page: Uploads ────────────────────────────────────────────────────────────
function UploadsPage() {
  const [posterDone, setPosterDone] = useState(true);
  const [demoDone, setDemoDone] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Uploads</h2>
        <p className="text-xs text-gray-500 mt-0.5">Submit your poster and startup demo before April 10</p>
      </div>

      {/* Poster */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Poster Abstract</CardTitle>
            {posterDone ? <Pill label="Submitted" color="bg-green-100 text-green-700"/> : <Pill label="Required" color="bg-red-100 text-red-600"/>}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {posterDone ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <FileText size={20} className="text-emerald-600 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 truncate">arabic_nlp_poster_v2.pdf</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Uploaded Mar 12 · 2.4 MB</div>
              </div>
              <div className="flex gap-1.5">
                <button className="text-gray-400 hover:text-blue-500 p-1"><ExternalLink size={13}/></button>
                <button onClick={() => setPosterDone(false)} className="text-gray-400 hover:text-gray-600 p-1"><Upload size={13}/></button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 cursor-pointer transition-colors" onClick={() => setPosterDone(true)}>
              <Upload size={22} className="text-gray-300 mx-auto mb-2"/>
              <div className="text-xs font-medium text-gray-600">Click to upload poster (PDF, max 10MB)</div>
              <div className="text-[11px] text-gray-400 mt-1">A0 portrait or landscape format</div>
            </div>
          )}
          <div className="text-[11px] text-gray-400">Deadline: <span className="font-semibold text-gray-600">April 10, 2026</span></div>
        </CardContent>
      </Card>

      {/* Startup demo */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">Startup Demo</CardTitle>
            {demoDone ? <Pill label="Submitted" color="bg-green-100 text-green-700"/> : <Pill label="Optional" color="bg-gray-100 text-gray-500"/>}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-500">If you're showcasing a startup or project, upload a 3-minute demo video or slide deck.</p>
          {demoDone ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <FileText size={20} className="text-blue-600 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 truncate">startup_demo_v1.mp4</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Uploaded · 48 MB</div>
              </div>
              <button onClick={() => setDemoDone(false)} className="text-gray-400 hover:text-gray-600 p-1"><Upload size={13}/></button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 cursor-pointer transition-colors" onClick={() => setDemoDone(true)}>
              <Upload size={22} className="text-gray-300 mx-auto mb-2"/>
              <div className="text-xs font-medium text-gray-600">Upload demo video or slides (MP4, PDF)</div>
              <div className="text-[11px] text-gray-400 mt-1">Max 100MB · 3 minutes</div>
            </div>
          )}
          <div className="text-[11px] text-gray-400">Deadline: <span className="font-semibold text-gray-600">April 10, 2026</span></div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Travel ─────────────────────────────────────────────────────────────
function TravelPage({ onNav }: { onNav: (k: PageKey) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Travel</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage your travel logistics for MENA Summit 2026</p>
      </div>

      {/* Flight info */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center gap-2">
            <Ticket size={15} className="text-blue-500"/>
            <CardTitle className="text-sm font-semibold text-gray-800">Ticket Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">Departure</div>
                <div className="text-sm font-bold text-gray-900">RUH → DXB</div>
                <div className="text-[11px] text-gray-500">Apr 14 · 16:30 — Apr 14 · 18:15</div>
              </div>
              <Plane size={22} className="text-blue-400 rotate-45"/>
              <div className="flex-1 text-right">
                <div className="text-xs text-gray-500 mb-0.5">Return</div>
                <div className="text-sm font-bold text-gray-900">DXB → RUH</div>
                <div className="text-[11px] text-gray-500">Apr 19 · 20:00</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
              <Pill label="EK 723" color="bg-white text-blue-700"/>
              <Pill label="Confirmed" color="bg-green-100 text-green-700"/>
              <button className="ml-auto text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Download size={11}/>E-Ticket</button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Your travel grant covers economy class tickets up to <span className="font-semibold text-gray-700">$800</span>. Reimbursement form due within 30 days of event.
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// ─── Page: Transportation ─────────────────────────────────────────────────────
const SHUTTLE_TIMES_ARR = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
const SHUTTLE_TIMES_DEP = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

function TransportationPage() {
  const [tab, setTab] = useState<"arrival"|"departure">("arrival");
  const [flightNo, setFlightNo] = useState("");
  const [flightTime, setFlightTime] = useState("15:00");
  const [pickupTime, setPickupTime] = useState("16:00");
  const [passengers, setPassengers] = useState(1);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState<"arrival"|"departure"|null>(null);

  const times = tab === "arrival" ? SHUTTLE_TIMES_ARR : SHUTTLE_TIMES_DEP;
  const label = tab === "arrival" ? "Arrival" : "Departure";
  const submitted_this = submitted === tab;

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white";
  const Field = ({ label: l, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{l}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-gray-900">Airport Transportation</h2>
        <p className="text-xs text-gray-500 mt-0.5">Free shuttle service · Dubai International Airport ↔ Marriott Downtown</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 items-start">
        <Bus size={14} className="text-blue-500 flex-shrink-0 mt-0.5"/>
        <div className="text-xs text-blue-700 space-y-0.5">
          <p className="font-semibold">Complimentary shuttle included with your scholarship</p>
          <p className="text-blue-600">Shuttles run every hour. Please book at least 48h in advance so we can plan seating.</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(["arrival","departure"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${tab===t?"bg-white shadow text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
            {t==="arrival" ? "✈ Airport → Hotel" : "✈ Hotel → Airport"}
          </button>
        ))}
      </div>

      {submitted_this ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <CheckCircle2 size={36} className="text-emerald-500"/>
          <p className="text-sm font-semibold text-gray-800">{label} shuttle booked!</p>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            {tab==="arrival"
              ? `Pickup at Terminal ${flightNo ? `(Flight ${flightNo})` : "2"} at ${pickupTime}. Look for the MenaML sign.`
              : `Hotel pickup at ${pickupTime}. A driver will meet you at the lobby.`}
          </p>
          <button onClick={()=>setSubmitted(null)} className="text-xs text-emerald-600 underline mt-1">Modify booking</button>
        </div>
      ) : (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Flight number">
                <input value={flightNo} onChange={e=>setFlightNo(e.target.value)} placeholder="e.g. EK204" className={inp}/>
              </Field>
              <Field label={tab==="arrival" ? "Flight landing time" : "Flight departure time"}>
                <select value={flightTime} onChange={e=>setFlightTime(e.target.value)} className={inp}>
                  {times.map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={tab==="arrival" ? "Shuttle pickup time" : "Hotel pickup time"}>
                <select value={pickupTime} onChange={e=>setPickupTime(e.target.value)} className={inp}>
                  {times.map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Number of passengers">
                <select value={passengers} onChange={e=>setPassengers(Number(e.target.value))} className={inp}>
                  {[1,2,3,4].map(n=><option key={n}>{n}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Additional notes (optional)">
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. large luggage, wheelchair access..." className={inp}/>
            </Field>
            <button
              onClick={()=>setSubmitted(tab)}
              className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 size={13}/> Book {label} Shuttle
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccommodationPage() {
  const [pref, setPref] = useState<"single"|"paired"|null>("paired");
  const [pairingNote, setPairingNote] = useState("");
  const [pairingSubmitted, setPairingSubmitted] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Accommodation</h2>
        <p className="text-xs text-gray-500 mt-0.5">Marriott Downtown Dubai · April 14–19</p>
      </div>

      {/* Hotel info */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center gap-2">
            <Hotel size={15} className="text-blue-500"/>
            <CardTitle className="text-sm font-semibold text-gray-800">Accommodation Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:"Hotel",       value:"Marriott Downtown Dubai" },
              { label:"Room Type",   value:"Standard Double" },
              { label:"Check-in",    value:"Apr 14, 2026" },
              { label:"Check-out",   value:"Apr 19, 2026" },
              { label:"Nights",      value:"5 nights" },
              { label:"Covered By",  value:"Scholarship (full)" },
            ].map(f => (
              <div key={f.label} className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-400">{f.label}</div>
                <div className="text-xs font-semibold text-gray-800 mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <Wifi size={13} className="text-blue-500 flex-shrink-0"/>
            <span className="text-xs text-blue-700">WiFi code: <strong>MENA2026</strong> · Breakfast included</span>
          </div>
        </CardContent>
      </Card>

      {/* Room preference */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex items-center gap-2">
            <Bed size={15} className="text-purple-500"/>
            <CardTitle className="text-sm font-semibold text-gray-800">Room Preference</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-500">Scholarship recipients sharing a room reduces costs. Choose your preference below.</p>
          <div className="space-y-2">
            <button onClick={() => setPref("paired")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${pref === "paired" ? "border-emerald-400 bg-emerald-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pref === "paired" ? "bg-emerald-100" : "bg-gray-100"}`}>
                <Users size={14} className={pref === "paired" ? "text-emerald-600" : "text-gray-400"}/>
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold text-gray-800">Request Roommate Pairing</div>
                <div className="text-[11px] text-gray-500 mt-0.5">We'll match you with another attendee</div>
              </div>
              {pref === "paired" && <CheckCircle2 size={15} className="text-emerald-500"/>}
            </button>
            <button onClick={() => setPref("single")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${pref === "single" ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pref === "single" ? "bg-blue-100" : "bg-gray-100"}`}>
                <Bed size={14} className={pref === "single" ? "text-blue-600" : "text-gray-400"}/>
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold text-gray-800">Request Single Room</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Subject to availability · may incur extra cost</div>
              </div>
              {pref === "single" && <CheckCircle2 size={15} className="text-blue-500"/>}
            </button>
          </div>

          {pref === "paired" && (
            pairingSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center gap-2">
                <CheckCircle2 size={22} className="text-emerald-500"/>
                <p className="text-xs font-semibold text-emerald-800">Pairing request submitted!</p>
                <p className="text-[11px] text-emerald-700 text-center">We'll email your roommate match within 5 business days.</p>
                <button onClick={()=>setPairingSubmitted(false)} className="text-[11px] text-emerald-600 underline mt-1">Edit request</button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                <div className="text-xs font-semibold text-gray-700">Roommate Preferences (optional)</div>
                <input
                  value={pairingNote}
                  onChange={e=>setPairingNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
                  placeholder="Research area / country / language preference..."/>
                <button
                  onClick={()=>setPairingSubmitted(true)}
                  className="w-full py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Users size={12}/> Submit Pairing Request
                </button>
              </div>
            )
          )}
          {pref === "single" && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertCircle size={13}/><span>Single rooms are limited. We'll confirm availability within 48h.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Mentorship ─────────────────────────────────────────────────────────
type MRTTable = { id:string; topic:string; mentor:string; org:string; capacity:number; enrolled:number; gradient:string; };
type MRTSession = { id:string; date:string; time:string; duration:string; tables:MRTTable[]; };

const MENTORSHIP_SESSIONS: MRTSession[] = [
  { id:"ms1", date:"Apr 15", time:"10:00", duration:"90 min", tables:[
    { id:"ms1-t1", topic:"Arabic NLP & Low-resource Languages",   mentor:"Prof. Khalid Ibrahim",  org:"JUST",        capacity:8, enrolled:7, gradient:"from-purple-400 to-indigo-500" },
    { id:"ms1-t2", topic:"Computer Vision for Medical Imaging",   mentor:"Dr. Nadia Al-Farsi",    org:"UAE Univ.",   capacity:8, enrolled:8, gradient:"from-rose-400 to-pink-500"    },
    { id:"ms1-t3", topic:"Building AI Startups in MENA",          mentor:"Mohammed Al-Sayed",     org:"Flat6Labs",   capacity:6, enrolled:4, gradient:"from-amber-400 to-orange-500" },
    { id:"ms1-t4", topic:"Healthcare AI & Ethics",                mentor:"Dr. Leila Bahri",       org:"Karolinska",  capacity:8, enrolled:5, gradient:"from-teal-400 to-emerald-500" },
  ]},
  { id:"ms2", date:"Apr 16", time:"14:00", duration:"90 min", tables:[
    { id:"ms2-t1", topic:"Reinforcement Learning in Practice",    mentor:"Dr. Rami Khoury",       org:"AUB",         capacity:6, enrolled:6, gradient:"from-blue-400 to-cyan-500"    },
    { id:"ms2-t2", topic:"LLMs & Fine-tuning Strategies",         mentor:"Sara Al-Mansouri",      org:"TII",         capacity:8, enrolled:3, gradient:"from-emerald-400 to-green-500"},
    { id:"ms2-t3", topic:"Data Collection in Low-data Regimes",   mentor:"Prof. Fatima Zahra",    org:"UM6P",        capacity:6, enrolled:6, gradient:"from-fuchsia-400 to-pink-500" },
    { id:"ms2-t4", topic:"ML for Climate & Sustainability",       mentor:"Dr. Omar Shaikh",       org:"KFUPM",       capacity:8, enrolled:2, gradient:"from-lime-400 to-emerald-500" },
    { id:"ms2-t5", topic:"Research Paper Writing & Publishing",   mentor:"Dr. Yasmine Boussetta", org:"EPFL",        capacity:6, enrolled:5, gradient:"from-violet-400 to-purple-500"},
  ]},
  { id:"ms3", date:"Apr 17", time:"11:00", duration:"60 min", tables:[
    { id:"ms3-t1", topic:"PhD Career Paths in AI",                mentor:"Prof. Hend Al-Khalifa", org:"IMAMU",       capacity:8, enrolled:8, gradient:"from-sky-400 to-blue-500"     },
    { id:"ms3-t2", topic:"Industry vs. Academia: Trade-offs",     mentor:"Nour Boulares",         org:"Google",      capacity:8, enrolled:6, gradient:"from-orange-400 to-red-500"   },
    { id:"ms3-t3", topic:"Open-source AI & Community Building",   mentor:"Tariq Al-Masri",        org:"Hugging Face",capacity:6, enrolled:3, gradient:"from-pink-400 to-rose-500"    },
  ]},
];

function MentorshipPage() {
  const [activeSession, setActiveSession] = useState("ms1");
  const [joined, setJoined] = useState<Record<string,boolean>>({});
  const [waitlisted, setWaitlisted] = useState<Record<string,boolean>>({});
  const [expandedTable, setExpandedTable] = useState<string|null>(null);

  const session = MENTORSHIP_SESSIONS.find(s=>s.id===activeSession)!;
  const myJoinedTable = session.tables.find(t=>joined[t.id]);

  function join(tableId: string) {
    const prev = Object.keys(joined).find(k=>joined[k] && MENTORSHIP_SESSIONS.find(s=>s.id===activeSession)?.tables.find(t=>t.id===k));
    setJoined(j=>({...j, [tableId]:true, ...(prev?{[prev]:false}:{})}));
    setWaitlisted(w=>({...w, [tableId]:false}));
  }
  function joinWait(tableId: string) {
    setWaitlisted(w=>({...w, [tableId]:true}));
  }
  function leave(tableId: string) {
    setJoined(j=>({...j, [tableId]:false}));
    setWaitlisted(w=>({...w, [tableId]:false}));
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Mentorship Round Tables</h2>
        <p className="text-xs text-gray-500 mt-0.5">Join a topic-based round table and discuss with an expert mentor</p>
      </div>

      {/* My booking banner */}
      {myJoinedTable && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0"/>
          <span className="text-xs text-emerald-700 flex-1">
            You're in <strong>{myJoinedTable.topic}</strong> with {myJoinedTable.mentor} · {session.date} at {session.time}
          </span>
          <button onClick={()=>leave(myJoinedTable.id)} className="text-[11px] text-gray-400 hover:text-red-500 transition-colors">Leave</button>
        </div>
      )}

      {/* Session tabs */}
      <div className="flex gap-1.5">
        {MENTORSHIP_SESSIONS.map(s=>{
          const myTable = s.tables.find(t=>joined[t.id]);
          return (
            <button key={s.id} onClick={()=>setActiveSession(s.id)}
              className={`flex-1 rounded-xl py-2.5 px-2 text-center transition-colors border ${activeSession===s.id?"bg-emerald-600 border-emerald-600 text-white":"bg-white border-gray-100 text-gray-600 hover:border-emerald-200"}`}>
              <div className="text-[11px] font-bold">{s.date}</div>
              <div className="text-[10px] opacity-80">{s.time} · {s.duration}</div>
              {myTable && <div className="mt-1 text-[9px] font-semibold opacity-90">✓ Joined</div>}
            </button>
          );
        })}
      </div>

      {/* Round tables */}
      <div className="space-y-2">
        {session.tables.map(t=>{
          const isFull = t.enrolled >= t.capacity;
          const isJoined = !!joined[t.id];
          const isWaitlisted = !!waitlisted[t.id];
          const pct = Math.round((t.enrolled/t.capacity)*100);
          const free = t.capacity - t.enrolled;
          const isExpanded = expandedTable === t.id;

          return (
            <Card key={t.id} className={`border transition-colors ${isJoined?"border-emerald-300 bg-emerald-50/40":isWaitlisted?"border-amber-200 bg-amber-50/30":"border-gray-100"}`}>
              <CardContent className="p-0">
                {/* Table header row */}
                <button className="w-full text-left p-3 flex items-center gap-3" onClick={()=>setExpandedTable(isExpanded?null:t.id)}>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                    {t.mentor.split(" ").filter(n=>n[0]===n[0].toUpperCase()).map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 leading-tight">{t.topic}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{t.mentor} · {t.org}</div>
                  </div>
                  {/* Availability pill */}
                  <div className="flex-shrink-0 text-right">
                    {isJoined ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">Joined</span>
                    ) : isWaitlisted ? (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">Waitlisted</span>
                    ) : isFull ? (
                      <span className="text-[10px] font-semibold text-red-500 bg-red-50 rounded-full px-2 py-0.5">Full</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">{free} seat{free!==1?"s":""} left</span>
                    )}
                  </div>
                  <ChevronDown size={13} className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded?"rotate-180":""}`}/>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
                    {/* Seat bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>{t.enrolled}/{t.capacity} seats filled</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isFull?"bg-red-400":pct>=75?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${pct}%`}}/>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isJoined ? (
                      <div className="flex gap-2">
                        <div className="flex-1 py-2 text-xs text-center font-semibold text-emerald-700 bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={12}/> You're in this table
                        </div>
                        <button onClick={()=>leave(t.id)} className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          Leave
                        </button>
                      </div>
                    ) : isWaitlisted ? (
                      <div className="flex gap-2">
                        <div className="flex-1 py-2 text-xs text-center font-semibold text-amber-700 bg-amber-100 rounded-lg flex items-center justify-center gap-1.5">
                          <Clock size={12}/> On waiting list
                        </div>
                        <button onClick={()=>leave(t.id)} className="px-3 py-2 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    ) : isFull ? (
                      <button onClick={()=>joinWait(t.id)} className="w-full py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5">
                        <PlusCircle size={12}/> Join Waiting List
                      </button>
                    ) : myJoinedTable ? (
                      <button onClick={()=>join(t.id)} className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5">
                        <Users size={12}/> Switch to This Table
                      </button>
                    ) : (
                      <button onClick={()=>join(t.id)} className="w-full py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Users size={12}/> Join This Table
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: Challenges ─────────────────────────────────────────────────────────
const leaderboard = [
  { rank:1, name:"Rania Khalil",       org:"NYU Abu Dhabi",   pts:2840, delta:"+120" },
  { rank:2, name:"Jad Abou-Jaoude",    org:"AUB",             pts:2650, delta:"+95" },
  { rank:3, name:"Mohammed Al-Rashid", org:"KAUST",           pts:2480, delta:"+80",  isMe:true },
  { rank:4, name:"Sara Al-Otaibi",     org:"Aramco",          pts:2200, delta:"+55" },
  { rank:5, name:"Faris Nasser",       org:"JUST",            pts:1980, delta:"+30" },
];
const challenges = [
  { title:"Reproducibility Challenge", desc:"Reproduce a published ML paper and document your findings.", pts:500, due:"Apr 10", done:false },
  { title:"Arabic NLP Hackathon",      desc:"Build an NLP model for Arabic dialect classification.",       pts:800, due:"Apr 16", done:false },
  { title:"Research Pitch",            desc:"3-minute pitch of your poster to a panel of judges.",          pts:300, due:"Apr 17", done:false },
];
function ChallengesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Challenges</h2>
        <p className="text-xs text-gray-500 mt-0.5">Compete, earn points, and win prizes</p>
      </div>

      {/* My rank */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Medal size={22} className="text-white"/>
          </div>
          <div>
            <div className="text-xs text-amber-100">Your Current Rank</div>
            <div className="text-2xl font-bold">#3 <span className="text-sm font-normal text-amber-100">of 312</span></div>
            <div className="text-xs text-amber-100">2,480 pts · +80 this week</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Leaderboard</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {leaderboard.map((p) => (
            <div key={p.rank} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${p.isMe ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.rank===1?"bg-yellow-400 text-white":p.rank===2?"bg-gray-300 text-white":p.rank===3?"bg-orange-400 text-white":"bg-gray-100 text-gray-600"}`}>
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${p.isMe ? "text-amber-800" : "text-gray-800"}`}>{p.name} {p.isMe && <span className="text-[10px] font-normal text-amber-600">(you)</span>}</div>
                <div className="text-[10px] text-gray-400">{p.org}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-800">{p.pts.toLocaleString()} pts</div>
                <div className="text-[10px] text-green-500">{p.delta}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Open challenges */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-gray-700">Open Challenges</div>
        {challenges.map((c) => (
          <Card key={c.title} className="border-gray-100 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="text-xs font-semibold text-gray-800">{c.title}</div>
                <Pill label={`+${c.pts} pts`} color="bg-amber-100 text-amber-700"/>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">{c.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Due: {c.due}</span>
                <Button size="sm" className="h-6 text-[11px] px-3 bg-gray-900 hover:bg-gray-700 text-white">Start</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Page: Attendees ──────────────────────────────────────────────────────────
const peeps = [
  { name:"Lara Sarkis",     org:"AUB",         country:"LB", field:"NLP",         gradient:"from-pink-400 to-rose-500",    connected:true },
  { name:"Jad Abou-Jaoude", org:"Google DM",   country:"LB", field:"LLMs",        gradient:"from-blue-400 to-indigo-500",  connected:true },
  { name:"Reem Khalil",     org:"Cairo Univ.", country:"EG", field:"Vision",      gradient:"from-yellow-400 to-orange-500",connected:false },
  { name:"Nour Mansour",    org:"KFUPM",       country:"SA", field:"Robotics",    gradient:"from-green-400 to-emerald-500",connected:false },
  { name:"Faisal Haddad",   org:"JUST",        country:"JO", field:"Healthcare AI",gradient:"from-purple-400 to-violet-500",connected:false },
  { name:"Dina El-Sayed",   org:"AAST",        country:"EG", field:"NLP",         gradient:"from-teal-400 to-cyan-500",    connected:false },
];
function AttendeesPage() {
  const [connected, setConnected] = useState<string[]>(peeps.filter(p=>p.connected).map(p=>p.name));
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Attendees</h2>
        <p className="text-xs text-gray-500 mt-0.5">Connect with 312 fellow participants</p>
      </div>
      <input className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-300" placeholder="Search by name, field, or institution..."/>
      <div className="space-y-2.5">
        {peeps.map((p) => {
          const isConn = connected.includes(p.name);
          return (
            <Card key={p.name} className="border-gray-100 shadow-none">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {p.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{p.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{p.org} · {p.country}</div>
                  <Pill label={p.field} color="bg-gray-100 text-gray-600"/>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><MessageSquare size={13}/></button>
                  <button onClick={() => setConnected(c => isConn ? c.filter(n=>n!==p.name) : [...c, p.name])}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${isConn ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
                    {isConn ? <><CheckCircle2 size={11}/>Connected</> : <><UserPlus size={11}/>Connect</>}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: Socials ────────────────────────────────────────────────────────────
const socialPosts = [
  { platform:"Twitter/X", handle:"@MENAMLSummit", content:"🎉 Excited to announce our keynote speakers for #MENASummit2026! Join 300+ AI researchers in Dubai this April.", likes:284, time:"2h ago" },
  { platform:"LinkedIn",  handle:"MenaML",        content:"Applications for MENA Summit 2026 are now open. This premier AI conference brings together researchers across the Arab world.", likes:512, time:"1d ago" },
  { platform:"Instagram", handle:"@menaml",       content:"✨ Venue reveal! Dubai World Trade Centre will host the MENA ML Summit 2026. See you there! 🇦🇪 #AI #MachineLearning", likes:1024, time:"3d ago" },
];
function SocialsPage() {
  const [liked, setLiked] = useState<number[]>([]);

  // Performance Night
  const [perfTab, setPerfTab] = useState<"perform"|"karaoke">("perform");
  const [perfSubmitted, setPerfSubmitted] = useState(false);
  const [karSubmitted, setKarSubmitted] = useState(false);
  const [perfName, setPerfName] = useState("Mohammed Al-Rashid");
  const [perfType, setPerfType] = useState("music");
  const [perfDesc, setPerfDesc] = useState("");
  const [karSong, setKarSong] = useState("");
  const [karArtist, setKarArtist] = useState("");

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white";

  const communityLinks = [
    { icon: Linkedin,  label: "LinkedIn Page",    sub: "MenaML",           color: "text-blue-600",   bg: "bg-blue-50",   href:"#" },
    { icon: Twitter,   label: "Twitter / X",       sub: "@MENAMLSummit",    color: "text-sky-500",    bg: "bg-sky-50",    href:"#" },
    { icon: Instagram, label: "Instagram",          sub: "@menaml",          color: "text-pink-500",   bg: "bg-pink-50",   href:"#" },
    { icon: MessageSquare, label: "Slack Channel", sub: "#menaml-2026",     color: "text-amber-600",  bg: "bg-amber-50",  href:"#" },
    { icon: Send,      label: "WhatsApp Group",    sub: "Participants 2026", color: "text-green-600",  bg: "bg-green-50",  href:"#" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">Socials</h2>
        <p className="text-xs text-gray-500 mt-0.5">Connect, perform, and follow MENA Summit 2026</p>
      </div>

      {/* ── Performance Night ── */}
      <Card className="border-purple-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 flex items-center gap-2">
          <Mic2 size={16} className="text-white"/>
          <div>
            <div className="text-xs font-bold text-white">Performance Night</div>
            <div className="text-[11px] text-purple-200">Apr 16 · 20:00 · Marriott Grand Ballroom</div>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          {/* Tab */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([["perform","🎤 Register a Performance"],["karaoke","🎵 Suggest a Karaoke Song"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>setPerfTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${perfTab===t?"bg-white shadow text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
                {l}
              </button>
            ))}
          </div>

          {perfTab === "perform" ? (
            perfSubmitted ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <CheckCircle2 size={28} className="text-purple-500"/>
                <p className="text-xs font-semibold text-gray-800">Performance registered!</p>
                <p className="text-[11px] text-gray-500 text-center">The team will review your slot request and confirm by email.</p>
                <button onClick={()=>setPerfSubmitted(false)} className="text-[11px] text-purple-600 underline mt-1">Edit submission</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Performer name</label>
                    <input value={perfName} onChange={e=>setPerfName(e.target.value)} className={inp} placeholder="Your name or group name"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Performance type</label>
                    <select value={perfType} onChange={e=>setPerfType(e.target.value)} className={inp}>
                      {["music","spoken word / poetry","comedy","dance","other"].map(t=>(
                        <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Brief description</label>
                  <textarea value={perfDesc} onChange={e=>setPerfDesc(e.target.value)} rows={2}
                    className={inp + " resize-none"} placeholder="Describe your act (instrument, song choice, duration…)"/>
                </div>
                <button onClick={()=>setPerfSubmitted(true)}
                  className="w-full py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Mic2 size={12}/> Submit Performance Request
                </button>
              </div>
            )
          ) : (
            karSubmitted ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <CheckCircle2 size={28} className="text-fuchsia-500"/>
                <p className="text-xs font-semibold text-gray-800">Song suggestion added!</p>
                <p className="text-[11px] text-gray-500 text-center"><strong>{karSong}</strong>{karArtist ? ` — ${karArtist}` : ""} added to the karaoke queue.</p>
                <button onClick={()=>{setKarSubmitted(false);setKarSong("");setKarArtist("");}} className="text-[11px] text-fuchsia-600 underline mt-1">Suggest another</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Song title</label>
                    <input value={karSong} onChange={e=>setKarSong(e.target.value)} className={inp} placeholder="e.g. Blinding Lights"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Artist (optional)</label>
                    <input value={karArtist} onChange={e=>setKarArtist(e.target.value)} className={inp} placeholder="e.g. The Weeknd"/>
                  </div>
                </div>
                <button onClick={()=>karSong.trim()&&setKarSubmitted(true)}
                  disabled={!karSong.trim()}
                  className="w-full py-2 text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Send size={12}/> Add to Karaoke Queue
                </button>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* ── Community Links ── */}
      <div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">MenaML Community</div>
        <div className="grid grid-cols-1 gap-2">
          {communityLinks.map(l => {
            const Icon = l.icon;
            return (
              <a key={l.label} href={l.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                <div className={`w-8 h-8 rounded-lg ${l.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={l.color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{l.label}</div>
                  <div className="text-[11px] text-gray-400">{l.sub}</div>
                </div>
                <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-400"/>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── Social feed ── */}
      <div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Recent Posts</div>
        <div className="space-y-3">
          {socialPosts.map((post, i) => {
            const icons: Record<string, React.ElementType> = {"Twitter/X": Twitter, LinkedIn: Linkedin, Instagram: Instagram};
            const colors: Record<string, string> = {"Twitter/X":"text-sky-500 bg-sky-50", LinkedIn:"text-blue-600 bg-blue-50", Instagram:"text-pink-500 bg-pink-50"};
            const Icon = icons[post.platform];
            const isLiked = liked.includes(i);
            return (
              <Card key={i} className="border-gray-100 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[post.platform].split(" ")[1]}`}>
                      <Icon size={13} className={colors[post.platform].split(" ")[0]}/>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{post.handle}</div>
                      <div className="text-[10px] text-gray-400">{post.time}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                    <button onClick={() => setLiked(l => isLiked ? l.filter(x=>x!==i) : [...l, i])}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"}`}>
                      <Heart size={13} className={isLiked?"fill-rose-500":""}/>
                      {post.likes + (isLiked ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400">
                      <MessageSquare size={13}/>Comment
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 ml-auto">
                      <ExternalLink size={12}/>View
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Registration (3-step wizard) ──────────────────────────────────────
function RegistrationPage() {
  const [step, setStep] = useState<1|2|3>(1);

  // Step 1 — personal info
  const [info, setInfo] = useState({
    firstName:"Mohammed", lastName:"Al-Rashid",
    email:"m.alrashid@kaust.edu.sa", phone:"+966 55 234 5678",
    institution:"KAUST", country:"Saudi Arabia", careerStage:"phd",
    bio:"Researching cross-lingual NLP for Arabic and low-resource languages. Interested in transformer models, multilingual transfer learning, and AI applications for the Arab world.",
    website:"https://malrashid.kaust.edu.sa",
  });

  // Step 2 — CV
  const [cvUploaded, setCvUploaded] = useState(true);
  const [cvConsent,  setCvConsent]  = useState(false);

  // Step 3 — abstract & poster
  const [paperTitle,     setPaperTitle]     = useState("Cross-lingual Transfer for Arabic NLP in Low-resource Settings");
  const [abstract,       setAbstract]       = useState("We explore cross-lingual transfer learning for Arabic natural language processing in low-resource environments. Our approach fine-tunes multilingual transformer models on a novel Arabic-English parallel corpus, achieving significant improvements on benchmark tasks including sentiment analysis, named entity recognition, and machine translation. Results show that targeted data augmentation closes the performance gap between Arabic and high-resource languages by up to 23%.");
  const [posterUploaded, setPosterUploaded] = useState(true);

  const MAX_WORDS = 300;
  const wordCount = abstract.trim().split(/\s+/).filter(Boolean).length;

  const steps: {num:1|2|3; label:string; done:boolean}[] = [
    {num:1, label:"Personal Info",     done: !!(info.firstName&&info.email&&info.institution)},
    {num:2, label:"CV Upload",         done: cvUploaded},
    {num:3, label:"Abstract & Poster", done: !!(paperTitle&&wordCount>0&&posterUploaded)},
  ];

  return (
    <div className="space-y-5 max-w-xl">

      {/* ── Stepper ── */}
      <div className="flex items-start">
        {steps.map((s, i) => (
          <Fragment key={s.num}>
            <button onClick={()=>setStep(s.num)} className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                step===s.num
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : s.done
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-white border-gray-300 text-gray-400"
              }`}>
                {s.done && step!==s.num ? <CheckCircle2 size={14}/> : s.num}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${step===s.num?"text-emerald-700":"text-gray-400"}`}>{s.label}</span>
            </button>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mt-4 mx-1 ${s.done?"bg-emerald-400":"bg-gray-200"}`}/>
            )}
          </Fragment>
        ))}
      </div>

      {/* ══ Step 1: Personal Information ══ */}
      {step===1 && (
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="pt-4 pb-2 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Personal Information</CardTitle>
            <p className="text-[11px] text-gray-500 mt-0.5">This information appears on your badge and attendee profile.</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {([["firstName","First Name",true],["lastName","Last Name",true]] as [keyof typeof info, string, boolean][]).map(([k,lbl,req])=>(
                <div key={k}>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">{lbl}{req?" *":""}</label>
                  <input value={info[k]} onChange={e=>setInfo(d=>({...d,[k]:e.target.value}))}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Email *</label>
                <input value={info.email} onChange={e=>setInfo(d=>({...d,email:e.target.value}))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Phone <span className="font-normal text-gray-400">(optional)</span></label>
                <input value={info.phone} onChange={e=>setInfo(d=>({...d,phone:e.target.value}))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Institution / Affiliation *</label>
                <input value={info.institution} onChange={e=>setInfo(d=>({...d,institution:e.target.value}))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Country *</label>
                <select value={info.country} onChange={e=>setInfo(d=>({...d,country:e.target.value}))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white">
                  {["Saudi Arabia","UAE","Egypt","Morocco","Jordan","Tunisia","Lebanon","Kuwait","Qatar","Bahrain","Oman","Iraq","Algeria","Libya","Palestine","Yemen","Sudan","Somalia","Mauritania"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-2">Career Stage *</label>
              <div className="flex flex-wrap gap-2">
                {[
                  {val:"undergrad",label:"Undergraduate"},{val:"masters",label:"Master's"},
                  {val:"phd",label:"PhD"},{val:"industry",label:"Industry"},
                  {val:"academia",label:"Academia"},{val:"transitioning",label:"Career Change"},
                ].map(opt=>(
                  <button key={opt.val} onClick={()=>setInfo(d=>({...d,careerStage:opt.val}))}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${info.careerStage===opt.val?"bg-emerald-600 border-emerald-600 text-white":"bg-white border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Research Interests / Short Bio *</label>
              <textarea value={info.bio} onChange={e=>setInfo(d=>({...d,bio:e.target.value}))} rows={3}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Website / LinkedIn <span className="font-normal text-gray-400">(optional)</span></label>
              <input value={info.website} onChange={e=>setInfo(d=>({...d,website:e.target.value}))} placeholder="https://"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={()=>setStep(2)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5">
                Continue <ChevronRight size={13}/>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══ Step 2: CV Upload ══ */}
      {step===2 && (
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="pt-4 pb-2 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">CV / Résumé</CardTitle>
            <p className="text-[11px] text-gray-500 mt-0.5">Upload your CV so mentors and reviewers can learn about your background.</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {cvUploaded ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">cv_mohammed_alrashid_2026.pdf</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">340 KB · Uploaded Feb 28</div>
                </div>
                <div className="flex gap-1.5">
                  <button className="text-gray-400 hover:text-blue-500 p-1"><ExternalLink size={13}/></button>
                  <button onClick={()=>setCvUploaded(false)} className="text-gray-400 hover:text-gray-600 p-1" title="Replace"><Upload size={13}/></button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-300 cursor-pointer transition-colors" onClick={()=>setCvUploaded(true)}>
                <Paperclip size={22} className="text-gray-300 mx-auto mb-2"/>
                <div className="text-xs font-medium text-gray-600">Click to upload your CV or résumé</div>
                <div className="text-[11px] text-gray-400 mt-1">PDF or DOCX · Max 5 MB</div>
              </div>
            )}

            {/* Sponsor sharing consent */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Sponsor Sharing Consent</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={cvConsent} onChange={e=>setCvConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 flex-shrink-0 cursor-pointer"/>
                <span className="text-[11px] text-gray-700 leading-relaxed">
                  I consent to share my CV with conference sponsors for recruitment and networking purposes.
                  Sponsors may contact me about internships, jobs, or research collaborations.
                </span>
              </label>
              <div className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2.5">
                <AlertCircle size={12} className="text-blue-500 mt-0.5 flex-shrink-0"/>
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Without consent your CV is visible <strong>only</strong> to your matched mentors and the review committee.
                  You can update this preference any time before April 10.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-1">
              <button onClick={()=>setStep(1)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <ChevronRight size={12} className="rotate-180"/> Back
              </button>
              <button onClick={()=>setStep(3)} disabled={!cvUploaded}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${cvUploaded?"bg-emerald-600 hover:bg-emerald-700 text-white":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                Continue <ChevronRight size={13}/>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══ Step 3: Abstract & Poster ══ */}
      {step===3 && (
        <div className="space-y-4">
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">Research Abstract</CardTitle>
              <p className="text-[11px] text-gray-500 mt-0.5">Describe your research or project. This appears in the conference programme.</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Paper / Project Title *</label>
                <input value={paperTitle} onChange={e=>setPaperTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"/>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-600">Abstract * <span className="font-normal text-gray-400">(max {MAX_WORDS} words)</span></label>
                  <span className={`text-[10px] font-mono ${wordCount>MAX_WORDS?"text-red-500 font-bold":"text-gray-400"}`}>{wordCount}/{MAX_WORDS}</span>
                </div>
                <textarea value={abstract} onChange={e=>setAbstract(e.target.value)} rows={6}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"/>
                {wordCount > MAX_WORDS && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {wordCount-MAX_WORDS} words over the limit</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Poster</CardTitle>
                <Pill label={posterUploaded?"Submitted":"Required"} color={posterUploaded?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}/>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">A0 portrait or landscape, PDF only, max 10 MB. Printing is handled by the organisers.</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {posterUploaded ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <FileText size={18} className="text-emerald-600 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800">arabic_nlp_poster_v2.pdf</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">2.4 MB · Uploaded Mar 12</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="text-gray-400 hover:text-blue-500 p-1"><ExternalLink size={13}/></button>
                    <button onClick={()=>setPosterUploaded(false)} className="text-gray-400 hover:text-gray-600 p-1"><Upload size={13}/></button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 cursor-pointer transition-colors" onClick={()=>setPosterUploaded(true)}>
                  <Upload size={20} className="text-gray-300 mx-auto mb-2"/>
                  <div className="text-xs font-medium text-gray-600">Click to upload poster PDF</div>
                  <div className="text-[11px] text-gray-400 mt-1">PDF only · A0 format · Max 10 MB</div>
                </div>
              )}
              <p className="text-[11px] text-gray-400">Deadline: <span className="font-semibold text-gray-600">April 10, 2026</span></p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <button onClick={()=>setStep(2)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1">
              <ChevronRight size={12} className="rotate-180"/> Back
            </button>
            <button disabled={!(paperTitle && wordCount>0 && wordCount<=MAX_WORDS && posterUploaded)}
              className={`px-6 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${(paperTitle&&wordCount>0&&wordCount<=MAX_WORDS&&posterUploaded)?"bg-emerald-600 hover:bg-emerald-700 text-white":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              <CheckCircle2 size={13}/> Submit Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page: Pre-arrival Form ───────────────────────────────────────────────────
function PreArrivalPage() {
  const [diet, setDiet] = useState("none");
  const [tshirt, setTshirt] = useState("M");
  const [arrivalDate, setArrivalDate] = useState("April 14");
  const [arrivalMode, setArrivalMode] = useState("flight");
  const [flightNo, setFlightNo] = useState("");
  const [emergName, setEmergName] = useState("");
  const [emergPhone, setEmergPhone] = useState("");
  const [emergRel, setEmergRel] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mobility, setMobility] = useState(false);
  const [visaLetter, setVisaLetter] = useState(false);

  if (submitted) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <CheckCircle2 size={40} className="text-emerald-500"/>
      <p className="text-base font-semibold text-gray-800">Pre-arrival form submitted!</p>
      <p className="text-xs text-gray-500 text-center max-w-xs">The organising team will review your details. You'll receive a confirmation email shortly.</p>
      <button onClick={()=>setSubmitted(false)} className="mt-2 text-xs text-emerald-600 underline">Edit responses</button>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const sel = inp + " bg-white";

  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-[11px] text-gray-500">Please fill this in at least <span className="font-semibold text-gray-700">7 days before the event</span>. Your answers help us prepare your welcome pack and logistics.</p>

      {/* Arrival */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-gray-700 flex items-center gap-2"><Plane size={13} className="text-emerald-500"/> Arrival Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expected arrival date">
              <select value={arrivalDate} onChange={e=>setArrivalDate(e.target.value)} className={sel}>
                {["April 13","April 14","April 15"].map(d=><option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Mode of arrival">
              <select value={arrivalMode} onChange={e=>setArrivalMode(e.target.value)} className={sel}>
                {["flight","train","car","other"].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          {arrivalMode==="flight" && (
            <Field label="Flight number (optional)">
              <input value={flightNo} onChange={e=>setFlightNo(e.target.value)} placeholder="e.g. EK204" className={inp}/>
            </Field>
          )}
        </CardContent>
      </Card>

      {/* Dietary & T-shirt */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-gray-700 flex items-center gap-2"><Award size={13} className="text-emerald-500"/> Preferences</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dietary requirement">
              <select value={diet} onChange={e=>setDiet(e.target.value)} className={sel}>
                {["none","vegetarian","vegan","halal","gluten-free","other"].map(d=><option key={d} value={d}>{d==="none"?"No restriction":d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="T-shirt size">
              <select value={tshirt} onChange={e=>setTshirt(e.target.value)} className={sel}>
                {["XS","S","M","L","XL","XXL"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="mobility" checked={mobility} onChange={e=>setMobility(e.target.checked)} className="accent-emerald-500"/>
            <label htmlFor="mobility" className="text-xs text-gray-600">I require mobility or accessibility assistance</label>
          </div>
        </CardContent>
      </Card>

      {/* Emergency contact */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-gray-700 flex items-center gap-2"><AlertCircle size={13} className="text-emerald-500"/> Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name">
              <input value={emergName} onChange={e=>setEmergName(e.target.value)} placeholder="e.g. Sara Al-Rashid" className={inp}/>
            </Field>
            <Field label="Relationship">
              <input value={emergRel} onChange={e=>setEmergRel(e.target.value)} placeholder="e.g. Spouse, Parent" className={inp}/>
            </Field>
          </div>
          <Field label="Phone number">
            <input value={emergPhone} onChange={e=>setEmergPhone(e.target.value)} placeholder="+971 50 000 0000" className={inp}/>
          </Field>
        </CardContent>
      </Card>

      {/* Visa */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold text-gray-700 flex items-center gap-2"><FileText size={13} className="text-emerald-500"/> Visa & Documentation</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="visaLetter" checked={visaLetter} onChange={e=>setVisaLetter(e.target.checked)} className="accent-emerald-500"/>
            <label htmlFor="visaLetter" className="text-xs text-gray-600">I need an invitation / visa support letter</label>
          </div>
          {visaLetter && (
            <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              The organising team will email your support letter within 5 business days. Ensure your passport details in your profile are up to date.
            </p>
          )}
        </CardContent>
      </Card>

      <button
        onClick={()=>setSubmitted(true)}
        className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
        <CheckCircle2 size={13}/> Submit Pre-arrival Form
      </button>
    </div>
  );
}

// ─── Page: FAQ ────────────────────────────────────────────────────────────────
const FAQ_ITEMS: { q: string; a: string; category: string }[] = [
  { category:"Application", q:"When does the application deadline close?",              a:"Applications close on February 28, 2026 at 23:59 UTC. Late applications are not accepted. Results are sent by March 20, 2026." },
  { category:"Application", q:"Can I apply if I am not currently enrolled in a PhD?",   a:"Yes. The event welcomes PhD students, early-career researchers (within 3 years of graduating), and in exceptional cases, outstanding MSc students. All applicants are evaluated on research quality." },
  { category:"Application", q:"Can I submit more than one abstract?",                   a:"You may submit up to two abstracts, but you can only present one poster. If both are accepted, the programme committee will select the stronger one." },
  { category:"Scholarship", q:"What does the scholarship cover?",                       a:"The full scholarship covers economy-class flights (up to $800), hotel accommodation (April 14–19 at the Marriott Downtown Dubai), and all meals during the conference. It does not cover visa fees or personal expenses." },
  { category:"Scholarship", q:"How do I claim my travel reimbursement?",               a:"Submit your reimbursement form within 30 days of the event end. Upload your boarding passes and receipts via the Uploads section. Payments are processed in 4–6 weeks." },
  { category:"Scholarship", q:"I need a visa support letter. How do I request one?",   a:"Tick the 'Visa support letter' checkbox in the Pre-arrival Form. Allow 5 business days for processing. Ensure your passport details in your profile are correct before requesting." },
  { category:"Programme",   q:"What is the format of the poster session?",             a:"Posters are A1 size (portrait). You will stand by your poster for a 90-minute session and discuss your work with attendees. Printing is arranged by the organisers — submit your final PDF at least 5 days before the event." },
  { category:"Programme",   q:"Can I attend sessions I haven't pre-registered for?",   a:"Yes, most sessions are open to all attendees. Mentorship round tables and some workshops require pre-registration through the portal due to limited capacity." },
  { category:"Programme",   q:"Will sessions be recorded?",                            a:"Keynote talks will be recorded and shared with participants after the event. Workshops and round tables will not be recorded to encourage candid discussion." },
  { category:"On-site",     q:"Where is the conference venue?",                        a:"Dubai World Trade Centre, Sheikh Zayed Road, Dubai, UAE. The conference hotel is the Marriott Downtown Dubai. A complimentary shuttle runs between the two venues every hour." },
  { category:"On-site",     q:"What is the dress code?",                               a:"Smart casual. There is no formal dress code, but please dress modestly in line with UAE cultural norms, especially for sessions at the venue." },
  { category:"On-site",     q:"Is there a prayer room on-site?",                       a:"Yes. A designated prayer room with ablution facilities is available at both the venue and the hotel. Directions are in the welcome pack you'll receive at registration." },
  { category:"On-site",     q:"Who do I contact if I have an emergency on-site?",      a:"The on-site team is reachable at the registration desk and via the WhatsApp group (link in the Socials section). For medical emergencies call 998 (UAE ambulance)." },
];

const FAQ_CATEGORIES = Array.from(new Set(FAQ_ITEMS.map(f=>f.category)));

function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number|null>(null);
  const [activecat, setActivecat] = useState<string>("All");
  const [query, setQuery] = useState("");

  const cats = ["All", ...FAQ_CATEGORIES];
  const filtered = FAQ_ITEMS.filter(f =>
    (activecat==="All" || f.category===activecat) &&
    (!query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>
        <p className="text-xs text-gray-500 mt-0.5">Can't find an answer? Email <span className="text-emerald-600 font-medium">participants@menaml.org</span></p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 pl-8 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"/>
        <BookOpen size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {cats.map(c=>(
          <button key={c} onClick={()=>setActivecat(c)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${activecat===c?"bg-emerald-600 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Q&A list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">No results for "{query}"</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className={`rounded-xl border transition-colors ${isOpen?"border-emerald-200 bg-emerald-50/30":"border-gray-100 bg-white"}`}>
                <button className="w-full flex items-start gap-3 p-3.5 text-left" onClick={()=>setOpenIdx(isOpen?null:i)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-0.5">{f.category}</div>
                    <div className="text-xs font-semibold text-gray-800 leading-snug">{f.q}</div>
                  </div>
                  <ChevronDown size={13} className={`text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${isOpen?"rotate-180":""}`}/>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5">
                    <p className="text-xs text-gray-600 leading-relaxed border-t border-emerald-100 pt-2.5">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page: On-site Interviews ─────────────────────────────────────────────────
type InterviewStatus = "pending" | "accepting" | "accepted" | "reschedule_flow" | "reschedule_sent" | "reject_confirm" | "rejected";

const INTERVIEWS = [
  {
    id: "iv1",
    company: "Inception AI",
    companyColor: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    role: "ML Research Engineer",
    level: "Full-time · Dubai",
    description: "Join our core research team working on large-scale Arabic language models and multimodal AI systems. Ideal candidate has strong publication record in NLP or computer vision.",
    skills: ["LLMs", "PyTorch", "Arabic NLP", "Research"],
    slots: [
      { id:"s1a", label:"Apr 15 · 14:00–14:30", venue:"Room 4B, Level 2" },
      { id:"s1b", label:"Apr 16 · 10:00–10:30", venue:"Sponsor Lounge, Level 1" },
    ],
    initialStatus: "pending" as InterviewStatus,
  },
  {
    id: "iv2",
    company: "Algorithmics MENA",
    companyColor: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    role: "NLP Research Intern",
    level: "6-month internship · Remote-friendly",
    description: "Research internship focused on low-resource machine translation for Arabic dialects. You'll work alongside senior researchers and co-author publications.",
    skills: ["Seq2Seq", "Transformers", "Research", "Arabic dialects"],
    slots: [
      { id:"s2a", label:"Apr 16 · 15:30–16:00", venue:"Meeting Room C" },
      { id:"s2b", label:"Apr 17 · 09:30–10:00", venue:"Sponsor Lounge, Level 1" },
    ],
    initialStatus: "pending" as InterviewStatus,
  },
  {
    id: "iv3",
    company: "DataBridge MENA",
    companyColor: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    role: "AI Research Scientist",
    level: "Full-time · Riyadh or Remote",
    description: "Focus on applied ML solutions for financial data across the Gulf region. We're looking for researchers who can bridge theory and production deployment.",
    skills: ["Applied ML", "Time-series", "MLOps", "Finance"],
    slots: [
      { id:"s3a", label:"Apr 15 · 11:00–11:30", venue:"Executive Suite, Level 3" },
    ],
    initialStatus: "accepted" as InterviewStatus,
    acceptedSlotId: "s3a",
  },
];

function InterviewsPage() {
  const init = Object.fromEntries(INTERVIEWS.map(iv => [iv.id, iv.initialStatus]));
  const initSlots = Object.fromEntries(INTERVIEWS.map(iv => [iv.id, (iv as any).acceptedSlotId ?? ""]));

  const [statuses, setStatuses] = useState<Record<string, InterviewStatus>>(init);
  const [selSlot,  setSelSlot]  = useState<Record<string, string>>(initSlots);
  const [notes,    setNotes]    = useState<Record<string, string>>({});

  const setStatus = (id: string, s: InterviewStatus) => setStatuses(p=>({...p,[id]:s}));
  const setNote   = (id: string, v: string)           => setNotes(p=>({...p,[id]:v}));

  const pendingCount = INTERVIEWS.filter(iv => statuses[iv.id] === "pending").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">On-site Interviews</h2>
        <p className="text-xs text-gray-500 mt-0.5">Sponsors can invite you to interview for a role during the summit</p>
      </div>

      {/* summary banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <CalendarClock size={14} className="text-amber-600 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-amber-800">
            You have <strong>{pendingCount} pending interview {pendingCount===1?"invitation":"invitations"}</strong>. Review the position details and confirm your preferred time slot before Apr 13.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {INTERVIEWS.map(iv => {
          const status = statuses[iv.id];
          const slot   = selSlot[iv.id];
          const note   = notes[iv.id] ?? "";
          const confirmedSlot = iv.slots.find(s=>s.id===slot);

          return (
            <Card key={iv.id} className={`shadow-sm border overflow-hidden transition-opacity ${status==="rejected"?"opacity-50":""}`}>
              {/* Header stripe */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${iv.dot}`}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${iv.companyColor}`}>{iv.company}</span>
                    {status==="accepted"    && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Confirmed ✓</span>}
                    {status==="reschedule_sent" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Reschedule requested</span>}
                    {status==="rejected"    && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Declined</span>}
                    {status==="pending"     && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Awaiting response</span>}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{iv.level}</div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Role & description */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={12} className="text-gray-400"/>
                    <span className="text-sm font-bold text-gray-900">{iv.role}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{iv.description}</p>
                </div>

                {/* Skills */}
                <div className="flex gap-1.5 flex-wrap">
                  {iv.skills.map(s=>(
                    <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
                  ))}
                </div>

                {/* ── Accepted state ── */}
                {status==="accepted" && confirmedSlot && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5"/>
                    <div>
                      <div className="text-xs font-semibold text-emerald-800">Interview confirmed</div>
                      <div className="text-xs text-emerald-700 mt-0.5">{confirmedSlot.label}</div>
                      <div className="text-[11px] text-emerald-600">{confirmedSlot.venue}</div>
                    </div>
                  </div>
                )}

                {/* ── Reschedule sent state ── */}
                {status==="reschedule_sent" && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5">
                    <RotateCcw size={13} className="text-sky-600 flex-shrink-0 mt-0.5"/>
                    <div>
                      <div className="text-xs font-semibold text-sky-800">Reschedule request sent</div>
                      <div className="text-xs text-sky-700 mt-0.5">Awaiting sponsor confirmation. You'll be notified by email.</div>
                    </div>
                  </div>
                )}

                {/* ── Reschedule flow ── */}
                {status==="reschedule_flow" && (
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Reason / preferred alternative times</div>
                    <textarea value={note} onChange={e=>setNote(iv.id,e.target.value)} rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="e.g. I have a session conflict on Apr 15. I'm available Apr 17 morning or anytime Apr 18…"/>
                    <div className="flex gap-2">
                      <button onClick={()=>setStatus(iv.id,"pending")}
                        className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button onClick={()=>note.trim()&&setStatus(iv.id,"reschedule_sent")}
                        disabled={!note.trim()}
                        className="flex-1 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Send size={11}/> Send Request
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Reject confirm ── */}
                {status==="reject_confirm" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2.5">
                    <p className="text-xs text-red-800 font-semibold">Decline this interview invitation?</p>
                    <p className="text-[11px] text-red-600">The sponsor will be notified that you're not interested. This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={()=>setStatus(iv.id,"pending")}
                        className="flex-1 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                        Keep it
                      </button>
                      <button onClick={()=>setStatus(iv.id,"rejected")}
                        className="flex-1 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        Yes, decline
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Pending / accepting: slot picker + actions ── */}
                {(status==="pending" || status==="accepting") && (
                  <div className="space-y-2.5 pt-1 border-t border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Suggested time slots</div>
                    <div className="space-y-1.5">
                      {iv.slots.map(s=>(
                        <label key={s.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${slot===s.id?"border-emerald-400 bg-emerald-50":"border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <input type="radio" name={`slot-${iv.id}`} value={s.id}
                            checked={slot===s.id} onChange={()=>setSelSlot(p=>({...p,[iv.id]:s.id}))}
                            className="mt-0.5 accent-emerald-600"/>
                          <div>
                            <div className="text-xs font-semibold text-gray-800">{s.label}</div>
                            <div className="text-[11px] text-gray-500">{s.venue}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-0.5">
                      <button
                        onClick={()=>slot&&setStatus(iv.id,"accepted")}
                        disabled={!slot}
                        className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12}/> Accept
                      </button>
                      <button onClick={()=>setStatus(iv.id,"reschedule_flow")}
                        className="py-2 px-3 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                        <RotateCcw size={11}/> Reschedule
                      </button>
                      <button onClick={()=>setStatus(iv.id,"reject_confirm")}
                        className="py-2 px-3 text-xs font-semibold border border-red-200 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5">
                        <XCircle size={11}/> Decline
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: Agenda ─────────────────────────────────────────────────────────────
type AgendaSession = {
  id:string; time:string; endTime:string; title:string; type:string;
  room:string; speaker?:string; description?:string; yours?:boolean; parallel?:boolean;
};

const AGENDA: Record<string, AgendaSession[]> = {
  "Apr 14": [
    { id:"a14-1", time:"16:00", endTime:"20:00", title:"Badge Collection & Registration",              type:"ceremony", room:"Desk A, DWTC Lobby",        description:"Pick up your badge, lanyard, and welcome pack. Bring your acceptance email or passport. Both floors open." },
    { id:"a14-2", time:"19:00", endTime:"21:30", title:"Welcome Dinner",                               type:"social",   room:"Marriott Grand Ballroom",    description:"An informal welcome dinner for all participants, mentors, and sponsors. Dress code: smart casual." },
  ],
  "Apr 15": [
    { id:"a15-0", time:"08:30", endTime:"09:00", title:"Late Registration",                            type:"break",    room:"DWTC Foyer" },
    { id:"a15-1", time:"09:00", endTime:"10:00", title:"Opening Ceremony & Welcome Keynote",           type:"keynote",  room:"Hall A",            speaker:"Dr. Aisha Al-Mansoori · MBZUAI",          description:"Formal opening of MENA Summit 2026, followed by the first keynote on Arabic AI research capacity and the region's growing role in global ML." },
    { id:"a15-2", time:"10:00", endTime:"10:30", title:"Coffee Break",                                 type:"break",    room:"Exhibition Foyer" },
    { id:"a15-3", time:"10:30", endTime:"11:30", title:"Keynote: Multilingual LLMs for the Arab World",type:"keynote",  room:"Hall A",            speaker:"Prof. Karim El-Tayeb · AUB",              description:"Examining the gap in LLM coverage of Arabic dialects, code-switching, and low-resource languages of the region. Presents recent benchmarks and open datasets." },
    { id:"a15-4", time:"11:30", endTime:"12:30", title:"Keynote: Responsible AI Governance in MENA",  type:"keynote",  room:"Hall A",            speaker:"Dr. Nadia Al-Farsi · UAE AI Office",       description:"Policy perspectives on AI regulation, data sovereignty, and institutional frameworks being developed across the Gulf and Levant." },
    { id:"a15-5", time:"12:30", endTime:"14:00", title:"Lunch",                                        type:"break",    room:"Marriott Restaurant, Level 1" },
    { id:"a15-6", time:"14:00", endTime:"16:00", title:"Workshop: Arabic NLP Tooling & Datasets",     type:"workshop", room:"Room B",            speaker:"Prof. Yusuf Benali",                       description:"Hands-on workshop covering CAMeL Tools, AraBERT fine-tuning, and annotation pipelines for dialectal Arabic. Bring your laptop.",    parallel:true },
    { id:"a15-7", time:"14:00", endTime:"16:00", title:"Workshop: Vision-Language Models",             type:"workshop", room:"Room C",            speaker:"Dr. Hana Qasim · KAUST",                  description:"Practical session on building Arabic-captioning systems and multimodal datasets. Participants will train a lightweight VLM on a shared cluster.", parallel:true },
    { id:"a15-8", time:"16:00", endTime:"16:30", title:"Coffee Break",                                 type:"break",    room:"Exhibition Foyer" },
    { id:"a15-9", time:"16:30", endTime:"18:00", title:"Poster Session — Part 1",                     type:"poster",   room:"Hall C",                                                                description:"First block of poster presentations. Browse and discuss research with presenters." },
    { id:"a15-10",time:"18:00", endTime:"19:30", title:"Birds of a Feather: Arabic NLP",              type:"social",   room:"Rooftop Terrace, Marriott",                                             description:"Attendee-organised informal gathering for Arabic NLP researchers. All welcome." },
    { id:"a15-11",time:"19:30", endTime:"21:30", title:"Evening Reception",                            type:"social",   room:"Marriott Lobby Bar" },
  ],
  "Apr 16": [
    { id:"a16-1", time:"09:00", endTime:"10:00", title:"Keynote: The Next Arabic LLM Frontier",       type:"keynote",  room:"Hall A",            speaker:"Dr. Fatima Al-Zahrani · KAUST",            description:"What will it take to build a truly multilingual, culturally-aware Arabic foundation model? Open challenges, data gaps, and the community's role." },
    { id:"a16-2", time:"10:00", endTime:"10:30", title:"Coffee Break",                                 type:"break",    room:"Exhibition Foyer" },
    { id:"a16-3", time:"11:00", endTime:"12:30", title:"MRT Session 1: Mentorship Round Tables",      type:"mrt",      room:"Rooms 3A / 3B / 3C",                                                    description:"Small-group mentorship discussions across three parallel tracks: Career Development (3B), Ethics in AI Research (3A), and Navigating Publishing (3C)." },
    { id:"a16-4", time:"12:30", endTime:"14:00", title:"Lunch",                                        type:"break",    room:"Marriott Restaurant, Level 1" },
    { id:"a16-5", time:"14:00", endTime:"15:30", title:"Challenge Finals: AI for Arabic Education",   type:"challenge",room:"Hall B",                                                                description:"Finalists present their AI tools designed to improve Arabic literacy and STEM education. Judged by a panel of researchers and educators." },
    { id:"a16-6", time:"15:00", endTime:"16:30", title:"Poster Session — Part 2 (incl. Slot B7)",    type:"poster",   room:"Hall C",                                                                description:"Second poster block. Slot B7 is in this session — arrive 30 min early to set up.", yours:true },
    { id:"a16-7", time:"16:30", endTime:"17:30", title:"Sponsor Showcase & Networking",               type:"social",   room:"Exhibition Floor, DWTC" },
    { id:"a16-8", time:"17:30", endTime:"19:00", title:"Panel: Women in AI — MENA Perspectives",     type:"panel",    room:"Hall A",            speaker:"Moderated by Prof. Mariam Al-Qahtani",      description:"A candid conversation with six researchers and practitioners on representation, mentorship, and systemic change in MENA's AI ecosystem." },
    { id:"a16-9", time:"20:00", endTime:"23:00", title:"Performance Night",                            type:"social",   room:"Marriott Grand Ballroom",                                               description:"An evening of music, spoken word, and karaoke with your fellow participants. Formal attire optional — just come ready to have fun." },
  ],
  "Apr 17": [
    { id:"a17-1", time:"09:00", endTime:"10:00", title:"Keynote: Future of AI MENA",                  type:"keynote",  room:"Hall A",            speaker:"Prof. Omar Khalid · JUST",                description:"A forward-looking address on computing infrastructure, research funding pipelines, and international collaboration shaping the next decade of MENA AI." },
    { id:"a17-2", time:"10:00", endTime:"10:30", title:"Coffee Break",                                 type:"break",    room:"Exhibition Foyer" },
    { id:"a17-3", time:"10:30", endTime:"12:00", title:"MRT Session 2: Mentorship Round Tables",      type:"mrt",      room:"Rooms 3A / 3B / 3C",                                                    description:"Second mentorship block: Research Commercialisation (3A), PhD Student Wellbeing (3B), and Open-source in Academia (3C)." },
    { id:"a17-4", time:"12:00", endTime:"13:30", title:"Lunch",                                        type:"break",    room:"Marriott Restaurant, Level 1" },
    { id:"a17-5", time:"13:30", endTime:"15:00", title:"Workshop: MLOps & Production AI",             type:"workshop", room:"Room B",            speaker:"Dr. Amir Hosseini · AUB",                 description:"From notebook to production: experiment tracking, model registries, CI/CD for ML, and monitoring in low-resource environments.",   parallel:true },
    { id:"a17-6", time:"13:30", endTime:"15:00", title:"Workshop: AI Ethics in Practice",             type:"workshop", room:"Room C",            speaker:"Prof. Layla Hassan · Cairo University",   description:"Case-study driven workshop on value alignment, dataset biases, fairness auditing, and responsible deployment of Arabic-language systems.", parallel:true },
    { id:"a17-7", time:"15:00", endTime:"15:30", title:"Coffee Break",                                 type:"break",    room:"Exhibition Foyer" },
    { id:"a17-8", time:"15:30", endTime:"16:30", title:"Challenge Awards Ceremony",                    type:"ceremony", room:"Hall A",                                                                description:"Winners of the AI for Arabic Education Challenge are announced and awarded. All participants attend." },
    { id:"a17-9", time:"16:30", endTime:"17:30", title:"Closing Keynote & Remarks",                   type:"keynote",  room:"Hall A",            speaker:"Conference Chairs",                        description:"Reflections on the summit, thanks to sponsors and volunteers, and a preview of MENA Summit 2027." },
    { id:"a17-10",time:"18:30", endTime:"20:30", title:"Evening Walk — Dubai Creek",                  type:"social",   room:"Hotel Lobby (meet here)",                                               description:"Attendee-organised casual walk along Dubai Creek. All welcome, no registration needed." },
  ],
  "Apr 18": [
    { id:"a18-1", time:"09:00", endTime:"11:30", title:"Optional: Old Dubai City Tour",               type:"social",   room:"Hotel Lobby (departs 09:00)",                                           description:"Guided walk through the Al Fahidi district, the Spice Souk, and the Gold Souk. Free for participants — book through the WhatsApp group." },
    { id:"a18-2", time:"10:00", endTime:"12:00", title:"Optional: AI Research Centre Lab Visit",      type:"workshop", room:"DWTC Level 4",       speaker:"Hosted by MBZUAI",                        description:"Tour and short talks at MBZUAI's Dubai research node. Space limited to 20 — register via the Pre-arrival Form (Lab Visits section)." },
    { id:"a18-3", time:"12:00", endTime:"12:00", title:"Hotel Checkout",                              type:"ceremony", room:"Marriott Downtown Dubai",                                               description:"Standard checkout time is 12:00. Late checkout until 14:00 available on request at the front desk." },
  ],
};

const ATYPE_STYLE: Record<string,{bar:string,badge:string,icon:React.ElementType}> = {
  keynote:   { bar:"bg-amber-400",  badge:"bg-amber-100 text-amber-700",   icon:Presentation },
  workshop:  { bar:"bg-blue-400",   badge:"bg-blue-100 text-blue-700",     icon:GraduationCap },
  poster:    { bar:"bg-teal-400",   badge:"bg-teal-100 text-teal-700",     icon:AlignLeft },
  mrt:       { bar:"bg-purple-400", badge:"bg-purple-100 text-purple-700", icon:Users },
  social:    { bar:"bg-pink-400",   badge:"bg-pink-100 text-pink-700",     icon:Heart },
  panel:     { bar:"bg-orange-400", badge:"bg-orange-100 text-orange-700", icon:MessageSquare },
  challenge: { bar:"bg-rose-400",   badge:"bg-rose-100 text-rose-700",     icon:Trophy },
  ceremony:  { bar:"bg-emerald-400",badge:"bg-emerald-100 text-emerald-700",icon:Award },
  break:     { bar:"bg-gray-300",   badge:"bg-gray-100 text-gray-400",     icon:Coffee },
};

const ATYPE_LABELS: Record<string,string> = {
  keynote:"Keynote", workshop:"Workshop", poster:"Poster", mrt:"MRT",
  social:"Social", panel:"Panel", challenge:"Challenge", ceremony:"Ceremony", break:"Break",
};

const CONFERENCE_DAYS = ["Apr 14","Apr 15","Apr 16","Apr 17","Apr 18"];
const DAY_LABELS: Record<string,string> = {
  "Apr 14":"Pre-conf","Apr 15":"Day 1","Apr 16":"Day 2","Apr 17":"Day 3","Apr 18":"Departure"
};

function AgendaPage() {
  const [activeDay,   setActiveDay]   = useState("Apr 15");
  const [bookmarked,  setBookmarked]  = useState<string[]>(["a15-1","a15-6","a16-6"]);
  const [expandedId,  setExpandedId]  = useState<string|null>(null);
  const [filterType,  setFilterType]  = useState<string>("all");
  const [showSaved,   setShowSaved]   = useState(false);

  const toggleBookmark = (id:string) =>
    setBookmarked(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const daySessions = AGENDA[activeDay] ?? [];
  const allSessions = Object.values(AGENDA).flat();
  const savedSessions = allSessions.filter(s => bookmarked.includes(s.id));
  const types = Array.from(new Set(daySessions.map(s=>s.type)));

  const displayed = (showSaved ? savedSessions : daySessions)
    .filter(s => filterType==="all" || s.type===filterType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Conference Agenda</h2>
          <p className="text-xs text-gray-500 mt-0.5">MENA Summit 2026 · Apr 15–18 · Dubai</p>
        </div>
        <button onClick={()=>{setShowSaved(s=>!s); setFilterType("all");}}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${showSaved?"bg-emerald-600 text-white border-emerald-600":"border-gray-200 text-gray-600 hover:border-gray-300"}`}>
          {showSaved ? <BookmarkCheck size={13}/> : <Bookmark size={13}/>}
          Saved {bookmarked.length > 0 && `(${bookmarked.length})`}
        </button>
      </div>

      {/* Day tabs */}
      {!showSaved && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {CONFERENCE_DAYS.map(d=>(
            <button key={d} onClick={()=>{setActiveDay(d);setFilterType("all");setExpandedId(null);}}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeDay===d?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              <div>{d}</div>
              <div className={`text-[10px] font-normal ${activeDay===d?"text-gray-300":"text-gray-400"}`}>{DAY_LABELS[d]}</div>
            </button>
          ))}
        </div>
      )}

      {/* Type filter pills */}
      {!showSaved && types.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={()=>setFilterType("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${filterType==="all"?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            All
          </button>
          {types.filter(t=>t!=="break").map(t=>{
            const st = ATYPE_STYLE[t];
            return (
              <button key={t} onClick={()=>setFilterType(filterType===t?"all":t)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${filterType===t?`${st.badge} ring-1 ring-inset ring-current`:st.badge} opacity-80 hover:opacity-100`}>
                {ATYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      )}

      {/* Saved header */}
      {showSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <BookmarkCheck size={13} className="text-emerald-600"/>
          <span className="text-xs text-emerald-800 font-semibold">{bookmarked.length} sessions saved across all days</span>
        </div>
      )}

      {/* Session list */}
      {displayed.length === 0 ? (
        <div className="text-center py-10 text-xs text-gray-400">
          {showSaved ? "No saved sessions yet — tap the bookmark on any session." : "No sessions match this filter."}
        </div>
      ) : (
        <div className="space-y-0">
          {displayed.map((s, idx) => {
            const st = ATYPE_STYLE[s.type] ?? ATYPE_STYLE.break;
            const isExp = expandedId === s.id;
            const isBookmarked = bookmarked.includes(s.id);
            const isBreak = s.type === "break";
            const showDayLabel = showSaved && (idx===0 || displayed[idx-1].id.slice(0,3)!==s.id.slice(0,3));
            const dayKey = CONFERENCE_DAYS.find(d=>(AGENDA[d]??[]).some(x=>x.id===s.id));

            return (
              <Fragment key={s.id}>
                {showSaved && showDayLabel && dayKey && (
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide pt-3 pb-1 px-1">{dayKey} — {DAY_LABELS[dayKey]}</div>
                )}
                <div className={`flex gap-0 ${idx<displayed.length-1?"mb-0":""}`}>
                  {/* Time column */}
                  <div className="w-14 flex-shrink-0 pt-3 pb-1 pr-2 text-right">
                    <div className="text-[11px] font-mono font-bold text-gray-500">{s.time}</div>
                    <div className="text-[10px] text-gray-300">{s.endTime}</div>
                  </div>
                  {/* Connector line */}
                  <div className="flex flex-col items-center mr-3 flex-shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full mt-3.5 flex-shrink-0 ${isBreak?"bg-gray-300":st.bar}`}/>
                    {idx < displayed.length-1 && <div className="w-0.5 flex-1 bg-gray-100 mt-1"/>}
                  </div>
                  {/* Card */}
                  <div className={`flex-1 min-w-0 mb-2 rounded-xl border overflow-hidden transition-all ${
                    s.yours ? "border-teal-300 bg-teal-50/40" : isBreak ? "border-gray-100 bg-gray-50/50" : "border-gray-100 bg-white"
                  }`}>
                    <button className="w-full text-left p-3" onClick={()=>s.description&&setExpandedId(isExp?null:s.id)}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {!isBreak && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${st.badge}`}>{ATYPE_LABELS[s.type]}</span>
                            )}
                            {s.yours && <span className="text-[10px] font-bold text-teal-700">★ Your slot</span>}
                            {s.parallel && <span className="text-[10px] text-gray-400">parallel session</span>}
                          </div>
                          <div className={`text-xs font-semibold leading-snug ${isBreak?"text-gray-400":"text-gray-800"}`}>{s.title}</div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <div className="flex items-center gap-1"><MapPin size={10} className="text-gray-300"/><span className="text-[11px] text-gray-400">{s.room}</span></div>
                            {s.speaker && <><span className="text-gray-200 text-[10px]">·</span><span className="text-[11px] text-gray-500 truncate">{s.speaker}</span></>}
                          </div>
                        </div>
                        {!isBreak && (
                          <button onClick={e=>{e.stopPropagation();toggleBookmark(s.id);}}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors mt-0.5">
                            {isBookmarked
                              ? <BookmarkCheck size={14} className="text-emerald-600 fill-emerald-100"/>
                              : <Bookmark size={14} className="text-gray-300"/>}
                          </button>
                        )}
                      </div>
                    </button>
                    {isExp && s.description && (
                      <div className="px-3 pb-3 pt-0">
                        <div className={`h-px w-full mb-2.5 ${s.yours?"bg-teal-200":"bg-gray-100"}`}/>
                        <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page: Networking ─────────────────────────────────────────────────────────
type ChatMsg  = { from:"me"|"them"; text:string; time:string };
type NetEvent = { id:string; title:string; date:string; time:string; location:string; description:string; organizer:string; capacity:number|null; joined:number; isYours?:boolean };

const NET_CONTACTS = [
  { id:"nc1", name:"Fatima Al-Zahrani",  institution:"KAUST",            research:"Arabic NLP",         avatar:"FA", color:"bg-rose-500",   online:true,
    initMsgs:[ {from:"them",text:"Hey! Great to meet you at the opening keynote 👋",time:"09:45"}, {from:"me",text:"Same! Really enjoyed the discussion on Arabic transformers",time:"09:47"}, {from:"them",text:"Are you joining the Birds of a Feather session tonight?",time:"09:48"} ] as ChatMsg[] },
  { id:"nc2", name:"Amir Hosseini",      institution:"AUB, Beirut",      research:"Computer Vision",    avatar:"AH", color:"bg-blue-500",    online:true,
    initMsgs:[ {from:"them",text:"Saw your poster abstract — really interesting work on cross-lingual embeddings!",time:"1d ago"} ] as ChatMsg[] },
  { id:"nc3", name:"Layla Hassan",       institution:"Cairo University",  research:"Reinforcement Learning", avatar:"LH", color:"bg-violet-500", online:false, initMsgs:[] as ChatMsg[] },
  { id:"nc4", name:"Omar Al-Khatib",     institution:"JUST, Jordan",     research:"Graph Neural Networks",  avatar:"OK", color:"bg-amber-500",  online:false,
    initMsgs:[ {from:"me",text:"Looking forward to your poster on heterogeneous graphs!",time:"2d ago"}, {from:"them",text:"Thanks! Let's catch up during the poster session 🤝",time:"2d ago"} ] as ChatMsg[] },
];

const INIT_NET_EVENTS: NetEvent[] = [
  { id:"ne1", title:"Arabic NLP Birds of a Feather",        date:"Apr 15", time:"18:00", location:"Hotel Rooftop Terrace",        description:"Informal gathering for researchers working on Arabic NLP. Share your work, challenges, and connect with fellow researchers.", organizer:"Fatima Al-Zahrani", capacity:20, joined:8 },
  { id:"ne2", title:"PhD Students Lunch",                    date:"Apr 16", time:"12:30", location:"Marriott Restaurant, Level 1", description:"Lunch meetup for PhD students to connect, discuss research journeys, and explore post-PhD career paths.",                 organizer:"Amir Hosseini",     capacity:null, joined:12 },
  { id:"ne3", title:"Research → Product Roundtable",         date:"Apr 16", time:"13:00", location:"Meeting Room D",               description:"Discussion on translating research into products. Learn from those who've made the leap from academia to startups.",        organizer:"Layla Hassan",       capacity:15, joined:5 },
  { id:"ne4", title:"Evening Walk — Dubai Creek",            date:"Apr 17", time:"18:30", location:"Hotel Lobby (meet here)",      description:"A casual evening stroll along Dubai Creek. No agenda — just good company and fresh air after a long day.",                  organizer:"Omar Al-Khatib",    capacity:null, joined:7 },
];

function NetworkingPage() {
  const [tab,        setTab]        = useState<"chat"|"events">("chat");
  const [activeChat, setActiveChat] = useState<string|null>(null);
  const [messages,   setMessages]   = useState<Record<string,ChatMsg[]>>(
    Object.fromEntries(NET_CONTACTS.map(c=>[c.id, c.initMsgs]))
  );
  const [chatInput,  setChatInput]  = useState("");
  const [unread,     setUnread]     = useState<Record<string,number>>({nc1:1, nc2:1});

  const [events,     setEvents]     = useState<NetEvent[]>(INIT_NET_EVENTS);
  const [joinedIds,  setJoinedIds]  = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [evTitle,    setEvTitle]    = useState("");
  const [evDate,     setEvDate]     = useState("Apr 15");
  const [evTime,     setEvTime]     = useState("");
  const [evLoc,      setEvLoc]      = useState("");
  const [evDesc,     setEvDesc]     = useState("");
  const [evCap,      setEvCap]      = useState("");

  const openChat = (id: string) => {
    setActiveChat(id);
    setUnread(p=>({...p,[id]:0}));
  };

  const sendMsg = () => {
    if (!chatInput.trim() || !activeChat) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setMessages(p=>({...p,[activeChat]:[...(p[activeChat]??[]),{from:"me",text:chatInput.trim(),time:t}]}));
    setChatInput("");
  };

  const toggleJoin = (id: string) => {
    setJoinedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
    setEvents(p => p.map(e => e.id===id ? {...e, joined: joinedIds.includes(id) ? e.joined-1 : e.joined+1} : e));
  };

  const createEvent = () => {
    if (!evTitle.trim() || !evTime.trim() || !evLoc.trim()) return;
    const newEv: NetEvent = {
      id:`ne${Date.now()}`, title:evTitle, date:evDate, time:evTime,
      location:evLoc, description:evDesc, organizer:"Mohammed Al-Rashid",
      capacity:evCap?Number(evCap):null, joined:1, isYours:true,
    };
    setEvents(p=>[...p, newEv]);
    setJoinedIds(p=>[...p, newEv.id]);
    setShowCreate(false);
    setEvTitle(""); setEvTime(""); setEvLoc(""); setEvDesc(""); setEvCap("");
  };

  const totalUnread = Object.values(unread).reduce((a,b)=>a+b,0);
  const contact = activeChat ? NET_CONTACTS.find(c=>c.id===activeChat) : null;
  const thread  = activeChat ? (messages[activeChat]??[]) : [];
  const finp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white";

  return (
    <div className="space-y-4">
      {/* Header */}
      {!activeChat && (
        <div>
          <h2 className="text-base font-bold text-gray-900">Networking</h2>
          <p className="text-xs text-gray-500 mt-0.5">Connect with fellow attendees and discover meetups</p>
        </div>
      )}

      {/* Chat thread view */}
      {activeChat && contact ? (
        <div className="flex flex-col" style={{height:"calc(100vh - 130px)"}}>
          {/* Thread header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <button onClick={()=>setActiveChat(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} className="text-gray-600"/>
            </button>
            <div className={`w-8 h-8 rounded-full ${contact.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {contact.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900">{contact.name}</div>
              <div className="text-[10px] text-gray-400">{contact.institution} · {contact.research}</div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online?"bg-emerald-500":"bg-gray-300"}`}/>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-0">
            {thread.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">No messages yet — say hello!</div>
            )}
            {thread.map((msg, i) => (
              <div key={i} className={`flex ${msg.from==="me"?"justify-end":"justify-start"}`}>
                {msg.from==="them" && (
                  <div className={`w-6 h-6 rounded-full ${contact.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5`}>
                    {contact.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] space-y-0.5`}>
                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.from==="me"
                      ?"bg-emerald-600 text-white rounded-tr-sm"
                      :"bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`text-[10px] text-gray-400 px-1 ${msg.from==="me"?"text-right":""}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMsg()}
              placeholder="Type a message…"
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"/>
            <button onClick={sendMsg} disabled={!chatInput.trim()}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0">
              <Send size={13} className="text-white"/>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([["chat","💬 Chat"],["events","📅 Events"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${tab===t?"bg-white shadow text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
                {l}
                {t==="chat" && totalUnread>0 && (
                  <span className="ml-1.5 text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">{totalUnread}</span>
                )}
                {t==="events" && joinedIds.length>0 && (
                  <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">{joinedIds.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Chat list ── */}
          {tab==="chat" && (
            <div className="space-y-2">
              {NET_CONTACTS.map(c => {
                const thread = messages[c.id]??[];
                const last = thread[thread.length-1];
                const unc = unread[c.id]??0;
                return (
                  <button key={c.id} onClick={()=>openChat(c.id)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 text-left transition-all">
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {c.avatar}
                      </div>
                      {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-semibold text-gray-900 ${unc>0?"font-bold":""}`}>{c.name}</span>
                        {last && <span className="text-[10px] text-gray-400 flex-shrink-0">{last.time}</span>}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{c.institution} · {c.research}</div>
                      {last && (
                        <div className={`text-[11px] truncate mt-0.5 ${unc>0?"text-gray-800 font-semibold":"text-gray-400"}`}>
                          {last.from==="me"?"You: ":""}{last.text}
                        </div>
                      )}
                    </div>
                    {unc>0 && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-white font-bold">{unc}</span>
                      </div>
                    )}
                  </button>
                );
              })}
              <div className="text-center pt-1">
                <button className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mx-auto">
                  <Users size={12}/> Find more attendees to connect with
                </button>
              </div>
            </div>
          )}

          {/* ── Events list ── */}
          {tab==="events" && (
            <div className="space-y-3">
              {/* Create button */}
              {!showCreate ? (
                <button onClick={()=>setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <PlusCircle size={14}/> Create a networking event
                </button>
              ) : (
                <Card className="border-emerald-200 shadow-sm overflow-hidden">
                  <div className="bg-emerald-600 px-4 py-2.5 flex items-center gap-2">
                    <Edit3 size={13} className="text-white"/>
                    <span className="text-xs font-bold text-white">New Networking Event</span>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Event title <span className="text-red-400">*</span></label>
                      <input value={evTitle} onChange={e=>setEvTitle(e.target.value)} className={finp} placeholder="e.g. Late-night coffee & papers"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                        <select value={evDate} onChange={e=>setEvDate(e.target.value)} className={finp}>
                          {["Apr 14","Apr 15","Apr 16","Apr 17","Apr 18"].map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Time <span className="text-red-400">*</span></label>
                        <input value={evTime} onChange={e=>setEvTime(e.target.value)} className={finp} placeholder="e.g. 19:00"/>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Location <span className="text-red-400">*</span></label>
                      <input value={evLoc} onChange={e=>setEvLoc(e.target.value)} className={finp} placeholder="e.g. Hotel Lobby, Rooftop, Room B…"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                      <textarea value={evDesc} onChange={e=>setEvDesc(e.target.value)} rows={2}
                        className={finp+" resize-none"} placeholder="What's the vibe? Who should join?"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Max attendees (leave blank for unlimited)</label>
                      <input value={evCap} onChange={e=>setEvCap(e.target.value)} type="number" min="2" className={finp} placeholder="e.g. 10"/>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setShowCreate(false)}
                        className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                      <button onClick={createEvent} disabled={!evTitle.trim()||!evTime.trim()||!evLoc.trim()}
                        className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
                        Create Event
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event cards */}
              {events.map(ev => {
                const joined = joinedIds.includes(ev.id);
                const full   = ev.capacity !== null && ev.joined >= ev.capacity && !joined;
                return (
                  <Card key={ev.id} className={`border shadow-none overflow-hidden ${joined?"border-emerald-200":"border-gray-100"}`}>
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-start gap-2 justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900 leading-snug">{ev.title}</div>
                          {ev.isYours && <span className="text-[10px] font-bold text-emerald-600">Your event</span>}
                        </div>
                        {joined && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Going ✓</span>}
                        {full  && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Full</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {[
                          {Icon:Calendar, val:`${ev.date} · ${ev.time}`},
                          {Icon:MapPin,   val:ev.location},
                          {Icon:Users,    val:`${ev.joined}${ev.capacity?` / ${ev.capacity}`:""} going`},
                          {Icon:UserPlus, val:ev.organizer},
                        ].map(({Icon,val})=>(
                          <div key={val} className="flex items-start gap-1.5">
                            <Icon size={10} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                            <span className="text-[11px] text-gray-500 leading-snug">{val}</span>
                          </div>
                        ))}
                      </div>

                      {ev.description && (
                        <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">{ev.description}</p>
                      )}

                      <button
                        onClick={()=>!full&&toggleJoin(ev.id)}
                        disabled={full}
                        className={`w-full py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                          joined
                            ?"bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                            :full
                              ?"bg-gray-100 text-gray-400 cursor-not-allowed"
                              :"bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}>
                        {joined ? (<><XCircle size={12}/> Leave event</>) : full ? "Event full" : (<><CheckCircle2 size={12}/> Join event</>)}
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page: Attendance ─────────────────────────────────────────────────────────
type CheckInStatus = "upcoming" | "scanning" | "checked_in" | "missed";

const ATTEND_SESSIONS = [
  { id:"a1", date:"Apr 15", time:"09:00", title:"Opening Keynote",           room:"Hall A",              type:"Keynote",   status:"checked_in" as CheckInStatus, checkedAt:"09:03" },
  { id:"a2", date:"Apr 15", time:"14:00", title:"Workshop: Arabic NLP",      room:"Room B",              type:"Workshop",  status:"upcoming"   as CheckInStatus },
  { id:"a3", date:"Apr 16", time:"11:00", title:"MRT: Career Development",   room:"Room 3B, Level 2",    type:"Mentorship",status:"upcoming"   as CheckInStatus },
  { id:"a4", date:"Apr 16", time:"15:00", title:"Poster Session — Slot B7",  room:"Hall C",              type:"Poster",    status:"upcoming"   as CheckInStatus },
  { id:"a5", date:"Apr 16", time:"20:00", title:"Performance Night",         room:"Marriott Ballroom",   type:"Social",    status:"upcoming"   as CheckInStatus },
  { id:"a6", date:"Apr 17", time:"10:00", title:"Keynote: Future of AI MENA",room:"Hall A",              type:"Keynote",   status:"upcoming"   as CheckInStatus },
];

const TYPE_COLORS: Record<string, string> = {
  Keynote:"bg-amber-100 text-amber-700", Workshop:"bg-blue-100 text-blue-700",
  Mentorship:"bg-purple-100 text-purple-700", Poster:"bg-teal-100 text-teal-700",
  Social:"bg-pink-100 text-pink-700",
};

function AttendancePage() {
  const initStatuses = Object.fromEntries(ATTEND_SESSIONS.map(s=>[s.id, s.status]));
  const initCheckedAt = Object.fromEntries(
    ATTEND_SESSIONS.filter(s=>s.checkedAt).map(s=>[s.id, s.checkedAt!])
  );
  const [statuses,   setStatuses]   = useState<Record<string,CheckInStatus>>(initStatuses);
  const [checkedAt,  setCheckedAt]  = useState<Record<string,string>>(initCheckedAt);
  const [scanningId, setScanningId] = useState<string|null>(null);

  const checkedCount = Object.values(statuses).filter(s=>s==="checked_in").length;

  const startScan = (id: string) => {
    setStatuses(p=>({...p,[id]:"scanning"}));
    setScanningId(id);
  };
  const confirmScan = (id: string) => {
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setStatuses(p=>({...p,[id]:"checked_in"}));
    setCheckedAt(p=>({...p,[id]:t}));
    setScanningId(null);
  };
  const cancelScan = (id: string) => {
    setStatuses(p=>({...p,[id]:"upcoming"}));
    setScanningId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Attendance</h2>
        <p className="text-xs text-gray-500 mt-0.5">Scan the QR code at each session entrance to log your attendance</p>
      </div>

      {/* Progress */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <QrCode size={16} className="text-emerald-600 flex-shrink-0"/>
        <div className="flex-1">
          <div className="text-xs font-semibold text-emerald-800">{checkedCount} of {ATTEND_SESSIONS.length} sessions checked in</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-emerald-200 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${(checkedCount/ATTEND_SESSIONS.length)*100}%`}}/>
          </div>
        </div>
      </div>

      {/* Scanner overlay */}
      {scanningId && (
        <Card className="border-2 border-dashed border-emerald-400 bg-emerald-50/30 shadow-none overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <div className="text-xs font-semibold text-emerald-700">Point your camera at the session QR code</div>
            {/* Faux scanner viewfinder */}
            <div className="relative w-44 h-44 rounded-2xl bg-gray-900 flex items-center justify-center overflow-hidden">
              {/* corner brackets */}
              {[["top-2 left-2","border-t-2 border-l-2"],["top-2 right-2","border-t-2 border-r-2"],
                ["bottom-2 left-2","border-b-2 border-l-2"],["bottom-2 right-2","border-b-2 border-r-2"]].map(([pos,cls],i)=>(
                <div key={i} className={`absolute ${pos} w-6 h-6 ${cls} border-emerald-400 rounded-sm`}/>
              ))}
              {/* scanning line */}
              <div className="absolute w-full h-0.5 bg-emerald-400/70 top-1/2 animate-pulse"/>
              <QrCode size={56} className="text-gray-600"/>
            </div>
            <div className="text-[11px] text-gray-500 text-center">Align the QR code from the session entrance within the frame</div>
            <div className="flex gap-2 w-full">
              <button onClick={()=>cancelScan(scanningId)}
                className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-white">
                Cancel
              </button>
              <button onClick={()=>confirmScan(scanningId)}
                className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <ScanLine size={12}/> Simulate scan
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session list */}
      <div className="space-y-2.5">
        {ATTEND_SESSIONS.map(s => {
          const status = statuses[s.id];
          const at = checkedAt[s.id];
          return (
            <Card key={s.id} className={`shadow-none border transition-all ${status==="checked_in"?"border-emerald-200 bg-emerald-50/20":"border-gray-100"}`}>
              <CardContent className="p-3.5 flex items-start gap-3">
                <div className="text-center flex-shrink-0 w-10 pt-0.5">
                  <div className="text-[10px] text-gray-400">{s.date}</div>
                  <div className="text-xs font-mono font-bold text-gray-600">{s.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[s.type]}`}>{s.type}</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{s.title}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-gray-300"/>
                    <span className="text-[11px] text-gray-400">{s.room}</span>
                  </div>
                  {status==="checked_in" && at && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={11} className="text-emerald-500"/>
                      <span className="text-[11px] text-emerald-600 font-semibold">Checked in at {at}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {status==="checked_in" ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-600"/>
                    </div>
                  ) : status==="scanning" ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center animate-pulse">
                      <ScanLine size={14} className="text-emerald-700"/>
                    </div>
                  ) : (
                    <button onClick={()=>startScan(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-[11px] font-bold transition-colors">
                      <QrCode size={11}/> Scan
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: Feedback (helpers + component) ─────────────────────────────────────
const FB_SESSIONS = [
  { id:"fs1", date:"Apr 15", time:"09:00", title:"Opening Keynote",           type:"Keynote",   speaker:"Dr. Aisha Al-Mansoori", room:"Hall A" },
  { id:"fs2", date:"Apr 15", time:"14:00", title:"Workshop: Arabic NLP",      type:"Workshop",  speaker:"Prof. Yusuf Benali",    room:"Room B" },
  { id:"fs3", date:"Apr 16", time:"11:00", title:"MRT: Career Development",   type:"Mentorship",speaker:"Mentor panel",          room:"Room 3B" },
  { id:"fs4", date:"Apr 16", time:"15:00", title:"Poster Session — Slot B7",  type:"Poster",    speaker:"Various presenters",    room:"Hall C" },
  { id:"fs5", date:"Apr 17", time:"10:00", title:"Keynote: Future of AI MENA",type:"Keynote",   speaker:"Prof. Omar Khalid",     room:"Hall A" },
];

const MOOD_ICONS = [
  { score:1, Icon:Frown, label:"Poor",      color:"text-red-500",    active:"bg-red-100"    },
  { score:2, Icon:Frown, label:"Below avg", color:"text-orange-500", active:"bg-orange-100" },
  { score:3, Icon:Meh,   label:"Average",   color:"text-amber-500",  active:"bg-amber-100"  },
  { score:4, Icon:Smile, label:"Good",      color:"text-teal-500",   active:"bg-teal-100"   },
  { score:5, Icon:Laugh, label:"Excellent", color:"text-emerald-500",active:"bg-emerald-100"},
];

function StarRating({ value, onChange, size=20 }: { value: number; onChange: (n: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>onChange(n)}
          className="transition-transform hover:scale-110">
          <Star size={size} className={`transition-colors ${n<=(hover||value)?"fill-amber-400 text-amber-400":"text-gray-200"}`}/>
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = ["","Poor","Below average","Average","Good","Excellent"];
const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400";

function FeedbackPage() {
  const [tab, setTab] = useState<"sessions"|"event">("sessions");

  // ── Session feedback state (one entry per session) ──
  const [openSession,  setOpenSession]  = useState<string|null>(null);
  const [sfContent,    setSfContent]    = useState<Record<string,number>>({});
  const [sfSpeaker,    setSfSpeaker]    = useState<Record<string,number>>({});
  const [sfPacing,     setSfPacing]     = useState<Record<string,number>>({});
  const [sfComment,    setSfComment]    = useState<Record<string,string>>({});
  const [sfSubmitted,  setSfSubmitted]  = useState<string[]>([]);

  const submitSession = (id: string) => {
    setSfSubmitted(p => p.includes(id) ? p : [...p, id]);
    setOpenSession(null);
  };

  // ── Overall / end-of-event feedback state ──
  const [overallRating, setOverallRating] = useState(0);
  const [mood,          setMood]          = useState<number|null>(null);
  const [enjoyed,       setEnjoyed]       = useState("");
  const [improve,       setImprove]       = useState("");
  const [nps,           setNps]           = useState<number|null>(null);
  const [logistics,     setLogistics]     = useState(0);
  const [networking,    setNetworking]    = useState(0);
  const [evSubmitted,   setEvSubmitted]   = useState(false);

  const submittedCount = sfSubmitted.length;

  // Session tab ──────────────────────────────────────────────────────────────
  const SessionsTab = () => (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
        <MessageSquare size={13} className="text-blue-500 flex-shrink-0"/>
        <p className="text-xs text-blue-800">
          <strong>{submittedCount}/{FB_SESSIONS.length}</strong> session{submittedCount!==1?"s":""} rated · feedback is submitted immediately per session
        </p>
      </div>

      {FB_SESSIONS.map(s => {
        const done     = sfSubmitted.includes(s.id);
        const isOpen   = openSession === s.id;
        const content  = sfContent[s.id]  ?? 0;
        const speaker  = sfSpeaker[s.id]  ?? 0;
        const pacing   = sfPacing[s.id]   ?? 0;
        const comment  = sfComment[s.id]  ?? "";
        const canSub   = content > 0;

        return (
          <Card key={s.id} className={`shadow-none border overflow-hidden transition-all ${done?"border-emerald-200 bg-emerald-50/20":"border-gray-100"}`}>
            <button className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50/70 transition-colors"
              onClick={()=>!done&&setOpenSession(isOpen?null:s.id)}>
              <div className="text-center flex-shrink-0 w-10 pt-0.5">
                <div className="text-[10px] text-gray-400">{s.date}</div>
                <div className="text-xs font-mono font-bold text-gray-500">{s.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[s.type]}`}>{s.type}</span>
                  {done && <span className="text-[10px] font-bold text-emerald-600">Rated ✓</span>}
                </div>
                <div className="text-xs font-semibold text-gray-800">{s.title}</div>
                <div className="text-[11px] text-gray-400">{s.speaker}</div>
                {done && sfContent[s.id] && (
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n=>(
                      <Star key={n} size={11} className={n<=sfContent[s.id]?"fill-amber-400 text-amber-400":"text-gray-200"}/>
                    ))}
                  </div>
                )}
              </div>
              {!done && (
                <ChevronDown size={13} className={`text-gray-400 flex-shrink-0 mt-1 transition-transform ${isOpen?"rotate-180":""}`}/>
              )}
            </button>

            {isOpen && !done && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
                {/* Content quality */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Content quality <span className="text-red-400">*</span></div>
                  <StarRating value={content} onChange={v=>setSfContent(p=>({...p,[s.id]:v}))} size={18}/>
                  {content>0 && <span className="text-[11px] text-gray-400">{STAR_LABELS[content]}</span>}
                </div>
                {/* Speaker */}
                {s.type !== "Poster" && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Speaker / presenter</div>
                    <StarRating value={speaker} onChange={v=>setSfSpeaker(p=>({...p,[s.id]:v}))} size={18}/>
                    {speaker>0 && <span className="text-[11px] text-gray-400">{STAR_LABELS[speaker]}</span>}
                  </div>
                )}
                {/* Pacing */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Pacing</div>
                  <div className="flex gap-2">
                    {["Too slow","Just right","Too fast"].map(lbl=>(
                      <button key={lbl} onClick={()=>setSfPacing(p=>({...p,[s.id]:lbl==="Too slow"?1:lbl==="Just right"?2:3}))}
                        className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                          (pacing===1&&lbl==="Too slow")||(pacing===2&&lbl==="Just right")||(pacing===3&&lbl==="Too fast")
                            ?"bg-emerald-600 text-white border-emerald-600"
                            :"border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Comment */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Your thoughts (optional)</div>
                  <textarea value={comment} onChange={e=>setSfComment(p=>({...p,[s.id]:e.target.value}))} rows={2}
                    className={inp} placeholder="What stood out? Any suggestions for the speaker or organizers…"/>
                </div>
                <button onClick={()=>submitSession(s.id)} disabled={!canSub}
                  className="w-full py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12}/> Submit session feedback
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  // Event tab ────────────────────────────────────────────────────────────────
  const EventTab = () => {
    if (evSubmitted) return (
      <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <Laugh size={32} className="text-emerald-600"/>
        </div>
        <div className="text-lg font-bold text-gray-900">Thank you!</div>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Your event feedback has been submitted. It helps us make MENA Summit even better each year.</p>
        <button onClick={()=>setEvSubmitted(false)} className="text-xs text-emerald-600 underline mt-1">Edit feedback</button>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Overall rating */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-800">Overall, how would you rate MENA Summit 2026? <span className="text-red-400">*</span></div>
            <StarRating value={overallRating} onChange={setOverallRating}/>
            {overallRating>0 && <div className="text-xs text-gray-400">{STAR_LABELS[overallRating]}</div>}
          </CardContent>
        </Card>

        {/* Aspects */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm font-semibold text-gray-800">Rate specific aspects</div>
            {[
              { label:"Logistics & organisation", value:logistics, set:setLogistics },
              { label:"Networking opportunities",  value:networking, set:setNetworking },
            ].map(a=>(
              <div key={a.label} className="space-y-1.5">
                <div className="text-xs text-gray-600">{a.label}</div>
                <StarRating value={a.value} onChange={a.set} size={18}/>
                {a.value>0 && <div className="text-[11px] text-gray-400">{STAR_LABELS[a.value]}</div>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mood */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-800">How are you leaving the event feeling?</div>
            <div className="flex justify-between">
              {MOOD_ICONS.map(({score,Icon,label,color,active})=>(
                <button key={score} onClick={()=>setMood(score)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${mood===score?active:"hover:bg-gray-50"}`}>
                  <Icon size={22} className={mood===score?color:"text-gray-300"}/>
                  <span className="text-[10px] text-gray-500">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open text */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-800">Open questions</div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">What did you enjoy most?</label>
              <textarea value={enjoyed} onChange={e=>setEnjoyed(e.target.value)} rows={2} className={inp} placeholder="Talks, networking, workshops, food…"/>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">What could be improved?</label>
              <textarea value={improve} onChange={e=>setImprove(e.target.value)} rows={2} className={inp} placeholder="Schedule, venue, content, catering…"/>
            </div>
          </CardContent>
        </Card>

        {/* NPS */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-800">How likely are you to recommend MenaML to a colleague?</div>
            <div className="flex gap-1 flex-wrap">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n=>(
                <button key={n} onClick={()=>setNps(n)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${nps===n?"bg-emerald-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 px-1">
              <span>Not likely</span><span>Very likely</span>
            </div>
          </CardContent>
        </Card>

        <button onClick={()=>overallRating>0&&setEvSubmitted(true)} disabled={overallRating===0}
          className="w-full py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2">
          <Send size={14}/> Submit Event Feedback
        </button>
        {overallRating===0 && <p className="text-center text-[11px] text-gray-400 -mt-2">Please give an overall rating to submit</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Feedback</h2>
        <p className="text-xs text-gray-500 mt-0.5">Help us improve — all responses are anonymous</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {([["sessions","💬 Session Feedback"],["event","🏆 End-of-Event"]] as const).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${tab===t?"bg-white shadow text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
            {l}
            {t==="sessions" && submittedCount>0 && (
              <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">{submittedCount}/{FB_SESSIONS.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab==="sessions" ? <SessionsTab/> : <EventTab/>}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function ParticipantView({ onLogout }: { onLogout?: () => void } = {}) {
  const [active, setActive] = useState<PageKey>("home");
  const [openSections, setOpenSections] = useState<Record<string,boolean>>({travel:true});

  const accepted = USER_STATUS === "accepted";

  function renderPage() {
    if (!accepted && navItems.find(n=>n.key===active)?.requiresAccepted)
      return <LockedPage title={navItems.find(n=>n.key===active)?.label ?? ""}/>;
    switch (active) {
      case "home":          return <HomePage onNav={setActive}/>;
      case "application":   return <ApplicationPage/>;
      case "registration":  return <RegistrationPage/>;
      case "pre-arrival":     return <PreArrivalPage/>;
      case "transportation":  return <TransportationPage/>;
      case "travel":        return <TravelPage onNav={setActive}/>;
      case "accommodation": return <AccommodationPage/>;
      case "mentorship":    return <MentorshipPage/>;
      case "challenges":    return <ChallengesPage/>;
      case "attendees":     return <AttendeesPage/>;
      case "socials":       return <SocialsPage/>;
      case "faq":           return <FaqPage/>;
      case "interviews":    return <InterviewsPage/>;
      case "agenda":        return <AgendaPage/>;
      case "networking":    return <NetworkingPage/>;
      case "attendance":    return <AttendancePage/>;
      case "feedback":      return <FeedbackPage/>;
      default:              return <HomePage onNav={setActive}/>;
    }
  }

  const pageTitle: Record<PageKey, string> = {
    home:"Home", application:"Application", registration:"Registration", "pre-arrival":"Pre-arrival Form",
    travel:"Travel & Accommodation", transportation:"Transportation", accommodation:"Accommodation",
    mentorship:"Mentorship", challenges:"Challenges",
    attendees:"Attendees", socials:"Socials", faq:"FAQ", interviews:"On-site Interviews",
    agenda:"Agenda", networking:"Networking", attendance:"Attendance", feedback:"Feedback",
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe size={15} className="text-white"/>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">MenaML</span>
              <div className="text-[10px] text-gray-400 -mt-0.5">Participant Portal</div>
            </div>
          </div>
        </div>

        {/* Event chip */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
            <Calendar size={11} className="text-emerald-600 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">MENA Summit 2026</div>
              <div className="text-[9px] text-gray-400">Apr 15–18, Dubai</div>
            </div>
            <Pill label="Accepted" color="bg-emerald-100 text-emerald-700"/>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key || item.children?.some(c => c.key === active);
            const locked = item.requiresAccepted && !accepted;
            const hasChildren = !!item.children;
            const isSectionOpen = hasChildren && !!openSections[item.key];

            return (
              <div key={item.key}>
                <button
                  onClick={() => {
                    if (locked) return;
                    if (hasChildren) setOpenSections(o=>({...o,[item.key]:!o[item.key]}));
                    else setActive(item.key);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : locked ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-emerald-600" : locked ? "text-gray-300" : "text-gray-400"}/>
                  <span className="flex-1 text-left text-xs">{item.label}</span>
                  {item.badge && <span className="text-xs">{item.badge}</span>}
                  {locked && <Lock size={11} className="text-gray-300"/>}
                  {hasChildren && !locked && (
                    isSectionOpen ? <ChevronUp size={12} className="text-gray-300"/> : <ChevronDown size={12} className="text-gray-300"/>
                  )}
                </button>
                {hasChildren && isSectionOpen && !locked && (
                  <div className="ml-5 mt-0.5 space-y-0.5">
                    {item.children!.map(child => (
                      <button key={child.key} onClick={() => setActive(child.key)}
                        className={`w-full text-left text-xs px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                          active === child.key ? "text-emerald-700 font-semibold bg-emerald-50" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}>
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${active === child.key ? "bg-emerald-500" : "bg-gray-300"}`}/>
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">MR</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">Mohammed Al-Rashid</div>
              <div className="text-[9px] text-gray-400">Participant · KAUST</div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600"><Settings size={12}/></button>
            <button onClick={onLogout} title="Sign out" className="p-1 text-gray-400 hover:text-red-600"><LogOut size={12}/></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900">{pageTitle[active]}</h1>
            <p className="text-[10px] text-gray-500">MENA Summit 2026 · April 15–18, Dubai</p>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={14}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>
          </button>
          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-medium border-0">28 days</Badge>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
