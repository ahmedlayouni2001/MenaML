import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe, Bell, CheckCircle2, Clock, AlertCircle, ChevronRight, FileText,
  Star, Users, Filter, Download, Eye, ThumbsUp, ThumbsDown, MessageSquare,
  Settings, LogOut, BarChart3, Flag, ArrowLeft, Send, RefreshCw, Search,
  Shield, ChevronDown, Minus, Info, Inbox, Check, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageKey = "queue" | "myreviews" | "stats" | "conflicts";

// ─── Data ─────────────────────────────────────────────────────────────────────
const applications = [
  {
    id: "APP-0124", name: "Ahmed Al-Rashid",       institution: "KAUST",           country: "SA",
    type: "Participant", field: "Natural Language Processing",
    abstract: "This work presents a novel approach to cross-lingual transfer learning for low-resource Arabic dialects using adapter modules. We demonstrate significant improvements on multiple benchmarks including AraBERT and ORCA with up to 8.3% F1 gain over baseline models.",
    status: "pending", flagged: false,
    scores: { originality: 0, significance: 0, clarity: 0, feasibility: 0 },
    travel: true, scholarship: true, date: "Mar 15",
  },
  {
    id: "APP-0117", name: "Maya Ibrahim",           institution: "AUB",             country: "LB",
    type: "Poster",  field: "Computer Vision",
    abstract: "We propose a lightweight convolutional architecture for real-time object detection optimised for edge deployment in resource-constrained environments, achieving 94.2% mAP on COCO while running at 47fps on a Raspberry Pi 4.",
    status: "pending", flagged: false,
    scores: { originality: 0, significance: 0, clarity: 0, feasibility: 0 },
    travel: false, scholarship: false, date: "Mar 14",
  },
  {
    id: "APP-0109", name: "Ziad Haddad",            institution: "LAU",             country: "LB",
    type: "Participant", field: "Reinforcement Learning",
    abstract: "A multi-agent reinforcement learning framework for autonomous traffic management in MENA urban environments, trained on simulated Cairo and Beirut intersection data with reward shaping for cultural driving norms.",
    status: "pending", flagged: true,
    scores: { originality: 0, significance: 0, clarity: 0, feasibility: 0 },
    travel: true, scholarship: true, date: "Mar 13",
  },
  {
    id: "APP-0098", name: "Sara Al-Otaibi",         institution: "Saudi Aramco DT", country: "SA",
    type: "Speaker", field: "AI in Energy",
    abstract: "Industrial AI applications for predictive maintenance in upstream oil and gas: lessons from deploying anomaly detection models on 40,000+ sensors across Aramco's Eastern Province facilities.",
    status: "reviewed", flagged: false,
    scores: { originality: 4, significance: 5, clarity: 5, feasibility: 5 },
    travel: false, scholarship: false, date: "Mar 12",
    decision: "accepted",
  },
  {
    id: "APP-0089", name: "Kareem Nour",            institution: "Cairo Univ.",     country: "EG",
    type: "Participant", field: "Healthcare AI",
    abstract: "Deep learning-based diabetic retinopathy screening system evaluated on 12,000 fundus images from Egyptian ophthalmology clinics, with explainability via Grad-CAM and deployment via WhatsApp bot.",
    status: "reviewed", flagged: false,
    scores: { originality: 3, significance: 4, clarity: 4, feasibility: 4 },
    travel: true, scholarship: true, date: "Mar 12",
    decision: "accepted",
  },
  {
    id: "APP-0074", name: "Rania Khalil",           institution: "NYU Abu Dhabi",   country: "AE",
    type: "Poster",  field: "Federated Learning",
    abstract: "Privacy-preserving federated learning for medical imaging across Gulf hospitals without centralising patient data, using differential privacy and secure aggregation protocols.",
    status: "reviewed", flagged: false,
    scores: { originality: 2, significance: 3, clarity: 2, feasibility: 2 },
    travel: false, scholarship: false, date: "Mar 11",
    decision: "rejected",
  },
  {
    id: "APP-0061", name: "Faris Nasser",           institution: "JUST",            country: "JO",
    type: "Participant", field: "Speech Recognition",
    abstract: "End-to-end Arabic speech recognition using conformer architecture fine-tuned on Jordanian dialect data, achieving 8.4% WER on a new benchmark dataset we release publicly.",
    status: "pending", flagged: false,
    scores: { originality: 0, significance: 0, clarity: 0, feasibility: 0 },
    travel: true, scholarship: true, date: "Mar 10",
  },
];

const myConflicts = [
  { name: "Sara Al-Otaibi", institution: "Saudi Aramco DT", reason: "Co-authored paper 2024", id: "APP-0098" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
);

const typeColor: Record<string, string> = {
  Participant: "bg-blue-50 text-blue-700",
  Poster:      "bg-green-50 text-green-700",
  Speaker:     "bg-purple-50 text-purple-700",
};

const ScoreStar = ({ value, max = 5, onChange }: { value: number; max?: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <button key={i} onClick={() => onChange(i + 1)}>
        <Star size={14} className={i < value ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
      </button>
    ))}
  </div>
);

// ─── Page: Review Queue ───────────────────────────────────────────────────────
type AppType = typeof applications[0];

function QueuePage({ onOpen }: { onOpen: (app: AppType) => void }) {
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "flagged">("all");
  const [search, setSearch] = useState("");

  const shown = applications.filter(a => {
    if (filter === "pending")  return a.status === "pending";
    if (filter === "reviewed") return a.status === "reviewed";
    if (filter === "flagged")  return a.flagged;
    return true;
  }).filter(a =>
    search === "" ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.field.toLowerCase().includes(search.toLowerCase()) ||
    a.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Review Queue</h2>
          <p className="text-xs text-gray-500 mt-0.5">7 assigned · deadline Apr 5</p>
        </div>
        <Button size="sm" variant="outline" className="text-xs gap-1.5">
          <Download size={12} /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-300"
            placeholder="Search applicants, fields..."
          />
        </div>
        {(["all", "pending", "reviewed", "flagged"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors flex-shrink-0 ${
              filter === f ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            {f}{f === "flagged" ? ` (${applications.filter(a => a.flagged).length})` : f === "pending" ? ` (${applications.filter(a => a.status === "pending").length})` : f === "reviewed" ? ` (${applications.filter(a => a.status === "reviewed").length})` : ` (${applications.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-gray-100 shadow-none">
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["ID", "Applicant", "Type", "Field", "Applied", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((app, i) => (
                <tr key={app.id}
                  className="border-b border-gray-50 hover:bg-emerald-50/40 cursor-pointer transition-colors"
                  onClick={() => onOpen(app)}>
                  <td className="px-4 py-2.5 font-mono text-gray-400 text-[10px]">{app.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {app.flagged && <Flag size={11} className="text-amber-400 flex-shrink-0" />}
                      <div>
                        <div className="font-semibold text-gray-800">{app.name}</div>
                        <div className="text-[10px] text-gray-400">{app.institution} · {app.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><Pill label={app.type} color={typeColor[app.type]} /></td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-[140px] truncate">{app.field}</td>
                  <td className="px-4 py-2.5 text-gray-400">{app.date}</td>
                  <td className="px-4 py-2.5">
                    {app.status === "reviewed" ? (
                      <Pill
                        label={(app as any).decision === "accepted" ? "Accepted" : "Rejected"}
                        color={(app as any).decision === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
                      />
                    ) : (
                      <Pill label="Pending" color="bg-amber-100 text-amber-700" />
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <ChevronRight size={13} className="text-gray-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Application Detail ─────────────────────────────────────────────────
const criteria = [
  { key: "originality" as const,   label: "Originality",            desc: "Novel contribution vs. state-of-the-art" },
  { key: "significance" as const,  label: "Significance",           desc: "Impact and importance of the work" },
  { key: "clarity" as const,       label: "Clarity",                desc: "Quality of writing and presentation" },
  { key: "feasibility" as const,   label: "Feasibility",            desc: "Soundness of methodology and approach" },
];

function DetailPage({ app, onBack, onSubmit }: { app: AppType; onBack: () => void; onSubmit: (app: AppType) => void }) {
  const [scores, setScores] = useState({ ...app.scores });
  const [decision, setDecision] = useState<"accepted" | "rejected" | "info" | null>(
    (app as any).decision ?? null
  );
  const [comment, setComment] = useState("");
  const [flagged, setFlagged] = useState(app.flagged);
  const [submitted, setSubmitted] = useState(app.status === "reviewed");

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = criteria.length * 5;
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const isConflict = myConflicts.some(c => c.id === app.id);

  function handleSubmit() {
    if (!decision) return;
    setSubmitted(true);
    onSubmit({ ...app, status: "reviewed", scores, flagged, decision } as any);
  }

  if (isConflict) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={13} /> Back to queue
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <Shield size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-800">Conflict of Interest Declared</div>
            <p className="text-xs text-amber-700 mt-1">
              You declared a conflict with <strong>{app.name}</strong> ({myConflicts.find(c => c.id === app.id)?.reason}).
              This application has been reassigned to another reviewer. You cannot view or score it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="h-4 border-l border-gray-200" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{app.name}</span>
            <Pill label={app.type} color={typeColor[app.type]} />
            {app.scholarship && <Pill label="Scholarship" color="bg-purple-100 text-purple-700" />}
            {app.travel && <Pill label="Travel Grant" color="bg-blue-100 text-blue-700" />}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{app.institution} · {app.country} · {app.field} · {app.id}</div>
        </div>
        <button
          onClick={() => setFlagged(f => !f)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
            flagged ? "bg-amber-50 border-amber-200 text-amber-700" : "border-gray-200 text-gray-500 hover:border-amber-300"
          }`}>
          <Flag size={11} />{flagged ? "Flagged" : "Flag"}
        </button>
      </div>

      {submitted && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${
          decision === "accepted" ? "bg-green-50 border-green-200" :
          decision === "rejected" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
        }`}>
          <CheckCircle2 size={14} className={decision === "accepted" ? "text-green-600" : decision === "rejected" ? "text-red-500" : "text-blue-500"} />
          <span className={`text-xs font-medium ${decision === "accepted" ? "text-green-700" : decision === "rejected" ? "text-red-600" : "text-blue-700"}`}>
            Review submitted · Decision: {decision === "info" ? "Request more info" : decision}
          </span>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw size={11} /> Edit
          </button>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* Left: abstract + info */}
        <div className="col-span-3 space-y-4">
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Abstract / Statement</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-gray-700 leading-relaxed">{app.abstract}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-2.5">
              {[
                { label: "Type",              value: app.type },
                { label: "Research Field",    value: app.field },
                { label: "Institution",       value: app.institution },
                { label: "Country",           value: app.country },
                { label: "Travel Grant",      value: app.travel ? "Requested" : "Not requested" },
                { label: "Scholarship",       value: app.scholarship ? "Requested" : "Not requested" },
                { label: "Date Submitted",    value: app.date },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-gray-400">{f.label}</div>
                  <div className="text-xs font-semibold text-gray-800 mt-0.5">{f.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviewer comment */}
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Review Comments</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                disabled={submitted}
                rows={4}
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-emerald-300 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Provide constructive feedback for the applicant (shared with them if accepted)..."
              />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Info size={11} /> Comments will be visible to applicants after decisions are released.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: scoring + decision */}
        <div className="col-span-2 space-y-4">
          {/* Score card */}
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800">Scoring Rubric</CardTitle>
                <div className="text-right">
                  <div className={`text-lg font-bold ${pct >= 70 ? "text-green-600" : pct >= 45 ? "text-amber-500" : "text-red-500"}`}>
                    {totalScore}<span className="text-xs font-normal text-gray-400">/{maxScore}</span>
                  </div>
                  <div className="text-[10px] text-gray-400">{pct}%</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Score bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {criteria.map(c => (
                <div key={c.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-700">{c.label}</div>
                      <div className="text-[10px] text-gray-400">{c.desc}</div>
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-4 text-right">{scores[c.key] || "—"}</span>
                  </div>
                  <ScoreStar
                    value={scores[c.key]}
                    onChange={v => !submitted && setScores(s => ({ ...s, [c.key]: v }))}
                  />
                </div>
              ))}

              <div className="pt-1 border-t border-gray-100 text-[11px] text-gray-400 space-y-0.5">
                <div className="flex justify-between"><span>1–2</span><span className="text-red-400">Below standard</span></div>
                <div className="flex justify-between"><span>3</span><span className="text-amber-400">Meets standard</span></div>
                <div className="flex justify-between"><span>4–5</span><span className="text-green-500">Exceeds standard</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Decision */}
          <Card className="border-gray-100 shadow-none">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Decision</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              {[
                { key: "accepted", label: "Accept",           icon: ThumbsUp,      color: "border-green-400 bg-green-50 text-green-700" },
                { key: "rejected", label: "Reject",           icon: ThumbsDown,    color: "border-red-400 bg-red-50 text-red-600" },
                { key: "info",     label: "Request More Info",icon: MessageSquare, color: "border-blue-400 bg-blue-50 text-blue-700" },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.key}
                    disabled={submitted}
                    onClick={() => setDecision(opt.key as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      decision === opt.key ? opt.color : "border-gray-100 hover:border-gray-200 text-gray-600"
                    }`}>
                    <Icon size={14} />
                    <span className="text-xs font-medium">{opt.label}</span>
                    {decision === opt.key && <CheckCircle2 size={13} className="ml-auto" />}
                  </button>
                );
              })}

              <Button
                disabled={submitted || !decision || Object.values(scores).some(v => v === 0)}
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs disabled:opacity-40 mt-1">
                <Send size={12} className="mr-1.5" />
                Submit Review
              </Button>

              {!submitted && Object.values(scores).some(v => v === 0) && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
                  <AlertCircle size={11} /> Score all 4 criteria before submitting
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Page: My Reviews ─────────────────────────────────────────────────────────
function MyReviewsPage({ apps }: { apps: AppType[] }) {
  const reviewed = apps.filter(a => a.status === "reviewed");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">My Reviews</h2>
        <p className="text-xs text-gray-500 mt-0.5">{reviewed.length} submitted · {apps.filter(a => a.status === "pending").length} remaining</p>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(reviewed.length / apps.length) * 100}%` }} />
      </div>
      <p className="text-[11px] text-gray-400">{reviewed.length} of {apps.length} completed ({Math.round((reviewed.length / apps.length) * 100)}%)</p>

      <div className="space-y-3">
        {reviewed.map(app => {
          const total = Object.values(app.scores).reduce((a, b) => a + b, 0);
          const pct = Math.round((total / 20) * 100);
          return (
            <Card key={app.id} className="border-gray-100 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    (app as any).decision === "accepted" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {(app as any).decision === "accepted"
                      ? <ThumbsUp size={14} className="text-green-600" />
                      : <ThumbsDown size={14} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">{app.name}</span>
                      <Pill label={app.type} color={typeColor[app.type]} />
                      <Pill
                        label={(app as any).decision === "accepted" ? "Accepted" : "Rejected"}
                        color={(app as any).decision === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{app.institution} · {app.field} · {app.id}</div>
                    <div className="flex items-center gap-3 mt-2">
                      {criteria.map(c => (
                        <div key={c.key} className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">{c.label.slice(0, 3)}:</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < app.scores[c.key] ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className={`ml-auto text-xs font-bold ${pct >= 70 ? "text-green-600" : pct >= 45 ? "text-amber-500" : "text-red-500"}`}>
                        {total}/20
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reviewed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={32} className="text-gray-200 mb-3" />
          <div className="text-sm font-medium text-gray-500">No reviews submitted yet</div>
          <p className="text-xs text-gray-400 mt-1">Start reviewing applications in your queue.</p>
        </div>
      )}
    </div>
  );
}

// ─── Page: Statistics ─────────────────────────────────────────────────────────
function StatsPage({ apps }: { apps: AppType[] }) {
  const accepted = apps.filter(a => (a as any).decision === "accepted").length;
  const rejected = apps.filter(a => (a as any).decision === "rejected").length;
  const reviewed = apps.filter(a => a.status === "reviewed").length;
  const avgScore = reviewed > 0
    ? (apps.filter(a => a.status === "reviewed")
        .map(a => Object.values(a.scores).reduce((x, y) => x + y, 0))
        .reduce((a, b) => a + b, 0) / reviewed)
        .toFixed(1)
    : "—";

  const byType: Record<string, number> = {};
  apps.forEach(a => { byType[a.type] = (byType[a.type] || 0) + 1; });
  const typeMax = Math.max(...Object.values(byType));

  const byCountry: Record<string, number> = {};
  apps.forEach(a => { byCountry[a.country] = (byCountry[a.country] || 0) + 1; });
  const countryMax = Math.max(...Object.values(byCountry));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">My Statistics</h2>
        <p className="text-xs text-gray-500 mt-0.5">Summary of your reviewing activity</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Assigned",   value: apps.length, color: "text-gray-900",   bg: "bg-gray-50" },
          { label: "Reviewed",   value: reviewed,    color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Accepted",   value: accepted,    color: "text-green-600",  bg: "bg-green-50" },
          { label: "Rejected",   value: rejected,    color: "text-red-500",    bg: "bg-red-50" },
        ].map(s => (
          <Card key={s.label} className="border-gray-100 shadow-none">
            <CardContent className={`p-4 ${s.bg} rounded-xl`}>
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">By Application Type</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20 flex-shrink-0">{type}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(count / typeMax) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-4 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-none">
          <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">By Country</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
              <div key={country} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-600 w-7 flex-shrink-0">{country}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(count / countryMax) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-4 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Score Distribution</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {criteria.map(c => {
            const reviewed_apps = apps.filter(a => a.status === "reviewed" && a.scores[c.key] > 0);
            const avg = reviewed_apps.length > 0
              ? reviewed_apps.reduce((sum, a) => sum + a.scores[c.key], 0) / reviewed_apps.length
              : 0;
            return (
              <div key={c.key} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 flex-shrink-0">{c.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(avg / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{avg > 0 ? avg.toFixed(1) : "—"}/5</span>
              </div>
            );
          })}
          <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
            Average overall score: <strong className="text-gray-700">{avgScore}/20</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page: Conflicts of Interest ──────────────────────────────────────────────
function ConflictsPage() {
  const [declared, setDeclared] = useState<typeof myConflicts>([...myConflicts]);
  const [newName, setNewName] = useState("");
  const [newReason, setNewReason] = useState("");

  function add() {
    if (!newName.trim()) return;
    setDeclared(d => [...d, { name: newName, institution: "—", reason: newReason, id: `APP-???` }]);
    setNewName(""); setNewReason("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Conflicts of Interest</h2>
        <p className="text-xs text-gray-500 mt-0.5">Declare any conflicts before reviewing — applications will be reassigned</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Shield size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 leading-relaxed">
          <strong>You must declare conflicts</strong> if you have co-authored with the applicant in the past 3 years,
          have a financial relationship with their institution, or have any other relationship that could compromise
          impartiality. Undisclosed conflicts may result in review disqualification.
        </div>
      </div>

      {declared.length > 0 && (
        <Card className="border-gray-100 shadow-none">
          <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Declared Conflicts</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {declared.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <Flag size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{c.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{c.institution} · {c.id}</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Reason: {c.reason}</div>
                </div>
                <button onClick={() => setDeclared(d => d.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1">
                  <X size={13} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-100 shadow-none">
        <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-sm font-semibold text-gray-800">Declare a New Conflict</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Applicant Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
              placeholder="Full name of applicant..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Reason for Conflict</label>
            <input value={newReason} onChange={e => setNewReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
              placeholder="e.g. Co-authored paper 2024, current collaborator..." />
          </div>
          <Button onClick={add} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs w-full">
            <Flag size={12} className="mr-1.5" /> Declare Conflict
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const navItems: { icon: React.ElementType; label: string; key: PageKey; badge?: string }[] = [
  { icon: Inbox,    label: "Review Queue", key: "queue",     badge: "4" },
  { icon: Check,    label: "My Reviews",   key: "myreviews" },
  { icon: BarChart3,label: "Statistics",   key: "stats" },
  { icon: Shield,   label: "Conflicts",    key: "conflicts", badge: "1" },
];

const pageTitles: Record<PageKey, string> = {
  queue: "Review Queue", myreviews: "My Reviews",
  stats: "Statistics", conflicts: "Conflicts of Interest",
};

export function ReviewerView({ onLogout }: { onLogout?: () => void } = {}) {
  const [page, setPage] = useState<PageKey>("queue");
  const [apps, setApps] = useState(applications);
  const [openApp, setOpenApp] = useState<AppType | null>(null);

  function handleSubmit(updated: AppType) {
    setApps(prev => prev.map(a => a.id === updated.id ? updated : a));
    setOpenApp(null);
    setPage("myreviews");
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">MenaML</span>
              <div className="text-[10px] text-gray-400 -mt-0.5">Reviewer Portal</div>
            </div>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
            <FileText size={11} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">MENA Summit 2026</div>
              <div className="text-[9px] text-gray-400">Applications · Deadline Apr 5</div>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500">Review progress</span>
            <span className="text-[11px] font-bold text-gray-700">
              {apps.filter(a => a.status === "reviewed").length}/{apps.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(apps.filter(a => a.status === "reviewed").length / apps.length) * 100}%` }} />
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            {apps.filter(a => a.status === "pending").length} remaining · {apps.filter(a => a.flagged).length} flagged
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = page === item.key && !openApp;
            return (
              <button key={item.key} onClick={() => { setOpenApp(null); setPage(item.key); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                <Icon size={14} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                <span className="flex-1 text-left text-xs">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.key === "conflicts" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-600"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              KI
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">Prof. Khalid Ibrahim</div>
              <div className="text-[9px] text-gray-400">Application Reviewer</div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600"><Settings size={12} /></button>
            <button onClick={onLogout} title="Sign out" className="p-1 text-gray-400 hover:text-red-600"><LogOut size={12} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900">
              {openApp ? openApp.name : pageTitles[page]}
            </h1>
            <p className="text-[10px] text-gray-500">
              {openApp ? `${openApp.id} · ${openApp.type} · ${openApp.field}` : "MENA Summit 2026 · Application Review Cycle"}
            </p>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <Badge className="bg-amber-100 text-amber-700 text-[10px] font-medium border-0">
            {apps.filter(a => a.status === "pending").length} pending
          </Badge>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {openApp
            ? <DetailPage app={openApp} onBack={() => setOpenApp(null)} onSubmit={handleSubmit} />
            : page === "queue"     ? <QueuePage onOpen={setOpenApp} />
            : page === "myreviews" ? <MyReviewsPage apps={apps} />
            : page === "stats"     ? <StatsPage apps={apps} />
            :                        <ConflictsPage />
          }
        </div>
      </main>
    </div>
  );
}
