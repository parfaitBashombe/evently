"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
  Going: "#34d399",
  Maybe: "#fbbf24",
  "Not going": "#f87171",
};

interface RsvpDay {
  date: string;
  going: number;
  maybe: number;
  notGoing: number;
  total: number;
}

interface AnalyticsChartsProps {
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  rsvpByDay: RsvpDay[];
  totalLikes: number;
  totalComments: number;
  capacity: number | null;
}

export const AnalyticsCharts = ({
  goingCount,
  maybeCount,
  notGoingCount,
  rsvpByDay,
  totalLikes,
  totalComments,
  capacity,
}: AnalyticsChartsProps) => {
  const total = goingCount + maybeCount + notGoingCount;
  const goingRate = total > 0 ? Math.round((goingCount / total) * 100) : 0;
  const capacityFill =
    capacity && total > 0
      ? Math.min(Math.round((total / capacity) * 100), 100)
      : null;

  const pieData = [
    { name: "Going", value: goingCount },
    { name: "Maybe", value: maybeCount },
    { name: "Not going", value: notGoingCount },
  ].filter((d) => d.value > 0);

  const barData = rsvpByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    Going: d.going,
    Maybe: d.maybe,
    "Not going": d.notGoing,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total RSVPs", value: total, accent: "text-white" },
          { label: "Going rate", value: `${goingRate}%`, accent: "text-emerald-400" },
          { label: "Likes", value: totalLikes, accent: "text-rose-400" },
          { label: "Comments", value: totalComments, accent: "text-[#60a5fa]" },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-[#0e1528] py-4 text-center"
          >
            <span className={`text-2xl font-bold tabular-nums ${accent}`}>
              {value}
            </span>
            <span className="text-xs text-white/35">{label}</span>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      {capacity !== null && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0e1528] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Capacity</span>
            <span className="font-medium tabular-nums text-white">
              {total} / {capacity}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[#004ac6] transition-all duration-700"
              style={{ width: `${capacityFill ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-white/45">
            {capacityFill ?? 0}% filled
          </p>
        </div>
      )}

      {/* Status breakdown */}
      {total > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white/45">
            Response breakdown
          </h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          STATUS_COLORS[
                            entry.name as keyof typeof STATUS_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0e1528",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2">
              {pieData.map(({ name, value }) => (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      background:
                        STATUS_COLORS[name as keyof typeof STATUS_COLORS],
                    }}
                  />
                  <span className="text-white/55">{name}</span>
                  <span className="ml-auto font-semibold tabular-nums text-white">
                    {value}
                  </span>
                  <span className="text-xs text-white/35">
                    ({Math.round((value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RSVPs over time */}
      {barData.length > 1 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white/45">
            RSVPs over time
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={12}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0e1528",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar
                  dataKey="Going"
                  stackId="a"
                  fill="#34d399"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Maybe"
                  stackId="a"
                  fill="#fbbf24"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Not going"
                  stackId="a"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
