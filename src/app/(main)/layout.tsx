import Link from "next/link";
import { UserButton } from "@neondatabase/auth/react";
import { getSession } from "@/lib/auth/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let isLoggedIn = false;
  try {
    const session = await getSession();
    isLoggedIn = Boolean(session?.data);
  } catch {
    isLoggedIn = false;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#080c18]/80 backdrop-blur-md border-b border-white/8">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-10 h-[68px]">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-extrabold text-xl text-white tracking-tight">
              Evently
            </Link>
            <div className="hidden md:flex gap-0.5">
              <Link href="/dashboard" className="text-sm font-semibold text-white/55 hover:text-white transition-colors rounded-lg px-3 py-2 hover:bg-white/5">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <UserButton />
                <Link
                  href="/events/new"
                  className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:shadow-[0_0_20px_4px_rgba(0,74,198,0.4)] active:scale-95"
                  style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
                >
                  New event
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="hidden md:block text-sm font-semibold text-white/55 hover:text-white transition-colors px-4 py-2">
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:shadow-[0_0_20px_4px_rgba(0,74,198,0.4)] active:scale-95"
                  style={{ background: "linear-gradient(135deg, #004ac6, #6d28d9)" }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-[68px] flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#080c18] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <span className="font-extrabold text-xl text-white tracking-tight">Evently</span>
            <span className="text-sm text-white/35">© 2025 Evently. Built with precision.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {["Terms", "Privacy", "Tech Stack", "API Docs"].map((label) => (
              <Link key={label} href="#" className="text-sm text-white/35 hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
