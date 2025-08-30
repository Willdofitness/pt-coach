import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 p-4 border-r">
        <h2 className="font-bold mb-4">CoachBoard</h2>
        <nav className="space-y-2">
          <Link href="/clients">Clients</Link>
          <br />
          <Link href="/exercises">Exercises</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}