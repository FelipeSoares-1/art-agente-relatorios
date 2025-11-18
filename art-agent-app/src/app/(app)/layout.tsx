import Image from "next/image";
import Link from "next/link";

// This layout provides the navigation header for the main application.
// Fonts, global styles, and schedulers are handled by the root layout (app/layout.tsx).

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b-4 border-red-600 shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <Image src="/Artplan_logo.png" alt="Artplan" width={32} height={32} className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-red-600">A.R.T</h1>
              <p className="text-xs text-gray-500">Agente de Relatórios e Tendências</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition font-semibold">
              🏠 Home
            </Link>
            <Link href="/feeds" className="text-gray-700 hover:text-red-600 transition font-semibold">
              📰 Fontes
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-red-600 transition font-semibold">
              🏷️ Tags
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-red-600 transition font-semibold">
              📊 Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}