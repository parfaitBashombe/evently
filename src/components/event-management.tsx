"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  Download,
} from "lucide-react";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";

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
  going: "text-emerald-400 bg-emerald-500/10",
  maybe: "text-amber-400 bg-amber-500/10",
  not_going: "text-red-400 bg-red-500/10",
};

const STATUS_LABELS: Record<RsvpStatus, string> = {
  going: "Going",
  maybe: "Maybe",
  not_going: "Not going",
};

const EVENT_STATUS_STYLE: Record<EventStatus, string> = {
  draft: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  published: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
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
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${EVENT_STATUS_STYLE[eventStatus]}`}
            >
              {eventStatus}
            </span>
          </div>
          {event.eventDate && (
            <p className="text-sm text-muted-foreground">
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
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </a>
          )}
          <Link href={`/events/${event.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === id
                ? "border-violet-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Event status</p>
              {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex gap-2">
              {(["draft", "published", "cancelled"] as EventStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all disabled:opacity-50 ${
                    eventStatus === s
                      ? EVENT_STATUS_STYLE[s]
                      : "border-border text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visibility</p>
              {togglingVisibility && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleVisibilityToggle(false)}
                disabled={togglingVisibility}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
                  !isPublic
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                    : "border-border text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
                }`}
              >
                🔒 Private
              </button>
              <button
                onClick={() => handleVisibilityToggle(true)}
                disabled={togglingVisibility}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
                  isPublic
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-border text-muted-foreground hover:border-emerald-500/20 hover:text-foreground"
                }`}
              >
                🌐 Public
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPublic
                ? "Listed on the home page — anyone can discover and RSVP to this event."
                : "Invite-only — not discoverable. Only people with the link can RSVP."}
            </p>
          </div>

          {/* Invite link */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium">Invite link</p>
            {inviteUrl ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                  {inviteUrl}
                </code>
                <button
                  onClick={copyInvite}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={regenerateInvite}
                  disabled={regenerating}
                  title="Regenerate link (invalidates old link)"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={regenerateInvite}
                disabled={regenerating}
                className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground disabled:opacity-50"
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Generate invite link
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              Share this link so guests can RSVP. Regenerating creates a new link and
              invalidates the old one.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Going", value: event.goingCount, className: "text-emerald-400", icon: CheckCircle2 },
              { label: "Maybe", value: event.maybeCount, className: "text-amber-400", icon: HelpCircle },
              { label: "Not going", value: event.notGoingCount, className: "text-red-400", icon: XCircle },
              { label: "Likes", value: event.likeCount, className: "text-rose-400", icon: null },
            ].map(({ label, value, className, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/30 py-4"
              >
                {Icon && <Icon className={`h-4 w-4 ${className}`} />}
                <span className={`text-2xl font-bold tabular-nums ${className}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
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
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-1">
              {(["all", "going", "maybe", "not_going"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all ${
                    statusFilter === s
                      ? s === "all"
                        ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                        : STATUS_COLORS[s as RsvpStatus] + " border-transparent"
                      : "border-border text-muted-foreground hover:border-violet-500/20"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_LABELS[s as RsvpStatus]}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={exportCsv}
              disabled={filteredRsvps.length === 0}
              className="ml-auto"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          {filteredRsvps.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-16 text-center">
              <p className="text-sm font-medium">No attendees found</p>
              <p className="text-xs text-muted-foreground">
                {total === 0
                  ? "Share your invite link to start collecting RSVPs."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{rsvp.name}</p>
                          {rsvp.message && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                              &ldquo;{rsvp.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {rsvp.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[rsvp.status]}`}
                        >
                          {rsvp.status === "going" && <CheckCircle2 className="h-3 w-3" />}
                          {rsvp.status === "maybe" && <HelpCircle className="h-3 w-3" />}
                          {rsvp.status === "not_going" && <XCircle className="h-3 w-3" />}
                          {STATUS_LABELS[rsvp.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
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
