import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#080c18]">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Aurora glow */}
      <div
        className="pointer-events-none absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
        style={{
          background: "radial-gradient(ellipse, rgba(0,74,198,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2.5 transition-opacity hover:opacity-70">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-extrabold text-sm"
          style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
        >
          E
        </span>
        <span className="text-base font-extrabold tracking-tight text-white">Evently</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1528] shadow-2xl shadow-black/40">
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, #004ac6, #7c3aed, transparent)" }}
          />
          {children}
        </div>
      </div>

      <p className="mt-8 text-xs text-white/30">
        By continuing, you agree to our terms.{" "}
        <Link href="/" className="text-[#60a5fa] hover:underline underline-offset-2">
          Back to home
        </Link>
      </p>
    </div>
  );
}
