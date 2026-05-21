"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnalyticsCharts } from "@/components/analytics-charts";
import {
  FaCircleCheck,
  FaCircleQuestion,
  FaCircleXmark,
  FaCopy,
  FaCheck,
  FaArrowsRotate,
  FaSpinner,
  FaPen,
  FaTrashCan,
  FaArrowUpRightFromSquare,
  FaMagnifyingGlass,
  FaDownload,
} from "react-icons/fa6";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { Lock, Globe } from "lucide-react";

type Tab = "overview" | "attendees" | "analytics";
type RsvpStatus = "going" | "maybe" | "not_going";
type EventStatus = "draft" | "published" | "cancelled";

interface Rsvp {
  id: string;
  name: string;
  email: string;
  status: RsvpStatus;
  message: string | null;
  respondedAt: string;
}

interface RsvpDay {
  date: string;
  going: number;
  maybe: number;
  notGoing: number;
  total: number;
}

interface EventManagementProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    location: string | null;
    category: string | null;
    capacity: number | null;
    status: EventStatus;
    isPublic: boolean;
    eventDate: string | null;
    endDate: string | null;
    inviteToken: string | null;
    goingCount: number;
    maybeCount: number;
    notGoingCount: number;
    commentCount: number;
    likeCount: number;
    rsvps: Rsvp[];
    rsvpByDay: RsvpDay[];
  };
}

const STATUS_COLORS: Record<RsvpStatus, string> = {
  going: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
  maybe: "text-amber-400 bg-amber-500/15 border-amber-500/25",
  not_going: "text-red-400 bg-red-500/15 border-red-500/25",
};

const STATUS_LABELS: Record<RsvpStatus, string> = {
  going: "Going",
  maybe: "Maybe",
  not_going: "Not going",
};

const EVENT_STATUS_STYLE: Record<EventStatus, string> = {
  draft: "text-amber-400 bg-amber-500/15 border-amber-500/25",
  published: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
  cancelled: "text-red-400 bg-red-500/15 border-red-500/25",
};

export const EventManagement = ({ event }: EventManagementProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [inviteToken, setInviteToken] = useState(event.inviteToken);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | "all">("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [eventStatus, setEventStatus] = useState<EventStatus>(event.status);
  const [isPublic, setIsPublic] = useState(event.isPublic);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const inviteUrl = inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/e/${inviteToken}`
    : null;

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateInvite = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/events/${event.id}/invite`, { method: "POST" });
      const data = await res.json();
      if (data.token) setInviteToken(data.token);
    } finally {
      setRegenerating(false);
    }
  };

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (newStatus === eventStatus) return;
    setUpdatingStatus(true);
    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, status: newStatus }),
      });
      setEventStatus(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVisibilityToggle = async (pub: boolean) => {
    if (pub === isPublic) return;
    setTogglingVisibility(true);
    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, status: eventStatus, isPublic: pub }),
      });
      setIsPublic(pub);
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const filteredRsvps = useMemo(() => {
    let list = event.rsvps;
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [event.rsvps, statusFilter, search]);

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Status", "Message", "Date"],
      ...filteredRsvps.map((r) => [
        r.name,
        r.email,
        STATUS_LABELS[r.status],
        r.message ?? "",
        new Date(r.respondedAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "-")}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = event.goingCount + event.maybeCount + event.notGoingCount;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "attendees", label: `Attendees (${total})` },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{event.title}</h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${EVENT_STATUS_STYLE[eventStatus]}`}
            >
              {eventStatus}
            </span>
          </div>
          {event.eventDate && (
            <p className="text-sm text-white/45">
              {new Date(event.eventDate).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {event.location && ` · ${event.location}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {inviteToken && (
            <a
              href={`/e/${inviteToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <FaArrowUpRightFromSquare className="h-3.5 w-3.5" />
              Preview
            </a>
          )}
          <Link href={`/events/${event.id}/edit`}>
            <span className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/55 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              <FaPen className="h-3.5 w-3.5" />
              Edit
            </span>
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <FaTrashCan className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-0 border-b border-white/8">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === id
                ? "border-[#60a5fa] text-[#60a5fa]"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Status change */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0e1528] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Event status</p>
              {updatingStatus && <FaSpinner className="h-4 w-4 animate-spin text-white/35" />}
            </div>
            <div className="flex gap-2">
              {(["draft", "published", "cancelled"] as EventStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all disabled:opacity-50 ${
                    eventStatus === s
                      ? EVENT_STATUS_STYLE[s]
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0e1528] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Visibility</p>
              {togglingVisibility && <FaSpinner className="h-4 w-4 animate-spin text-white/35" />}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleVisibilityToggle(false)}
                disabled={togglingVisibility}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                  !isPublic
                    ? "border-[#004ac6]/30 bg-[#004ac6]/15 text-[#60a5fa]"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                <Lock className="h-3 w-3" /> Private
              </button>
              <button
                onClick={() => handleVisibilityToggle(true)}
                disabled={togglingVisibility}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                  isPublic
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                <Globe className="h-3 w-3" /> Public
              </button>
            </div>
            <p className="text-xs text-white/40">
              {isPublic
                ? "Listed on the home page — anyone can discover and RSVP to this event."
                : "Invite-only — not discoverable. Only people with the link can RSVP."}
            </p>
          </div>

          {/* Invite link */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0e1528] p-5">
            <p className="text-sm font-semibold text-white">Invite link</p>
            {inviteUrl ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/55">
                  {inviteUrl}
                </code>
                <button
                  onClick={copyInvite}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <FaCheck className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <FaCopy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={regenerateInvite}
                  disabled={regenerating}
                  title="Regenerate link (invalidates old link)"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <FaArrowsRotate className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={regenerateInvite}
                disabled={regenerating}
                className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-sm text-white/40 transition-colors hover:border-[#004ac6]/40 hover:text-[#60a5fa] disabled:opacity-50"
              >
                {regenerating ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaArrowsRotate className="h-4 w-4" />
                )}
                Generate invite link
              </button>
            )}
            <p className="text-xs text-white/40">
              Share this link so guests can RSVP. Regenerating creates a new link and
              invalidates the old one.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Going", value: event.goingCount, valueClass: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", Icon: FaCircleCheck, iconClass: "text-emerald-400" },
              { label: "Maybe", value: event.maybeCount, valueClass: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/25", Icon: FaCircleQuestion, iconClass: "text-amber-400" },
              { label: "Not going", value: event.notGoingCount, valueClass: "text-red-400", bg: "bg-red-500/15 border-red-500/25", Icon: FaCircleXmark, iconClass: "text-red-400" },
              { label: "Likes", value: event.likeCount, valueClass: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/25", Icon: null, iconClass: "" },
            ].map(({ label, value, valueClass, bg, Icon, iconClass }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-4 ${bg}`}
              >
                {Icon && <Icon className={`h-4 w-4 ${iconClass}`} />}
                <span className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</span>
                <span className="text-xs text-white/40 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Attendees tab ── */}
      {tab === "attendees" && (
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 transition-colors"
              />
            </div>

            <div className="flex gap-1">
              {(["all", "going", "maybe", "not_going"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? s === "all"
                        ? "border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa]"
                        : STATUS_COLORS[s as RsvpStatus]
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_LABELS[s as RsvpStatus]}
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              disabled={filteredRsvps.length === 0}
              className="ml-auto flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <FaDownload className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>

          {/* Table */}
          {filteredRsvps.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-[#0e1528] py-16 text-center">
              <p className="text-sm font-semibold text-white">No attendees found</p>
              <p className="text-xs text-white/40">
                {total === 0
                  ? "Share your invite link to start collecting RSVPs."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/4">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wide hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wide hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-white">{rsvp.name}</p>
                          {rsvp.message && (
                            <p className="text-xs text-white/40 mt-0.5 max-w-xs truncate">
                              &ldquo;{rsvp.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/40 hidden sm:table-cell">
                        {rsvp.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[rsvp.status]}`}
                        >
                          {rsvp.status === "going" && <FaCircleCheck className="h-3 w-3" />}
                          {rsvp.status === "maybe" && <FaCircleQuestion className="h-3 w-3" />}
                          {rsvp.status === "not_going" && <FaCircleXmark className="h-3 w-3" />}
                          {STATUS_LABELS[rsvp.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40 hidden md:table-cell">
                        {new Date(rsvp.respondedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Analytics tab ── */}
      {tab === "analytics" && (
        <AnalyticsCharts
          goingCount={event.goingCount}
          maybeCount={event.maybeCount}
          notGoingCount={event.notGoingCount}
          rsvpByDay={event.rsvpByDay}
          totalLikes={event.likeCount}
          totalComments={event.commentCount}
          capacity={event.capacity}
        />
      )}

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};
