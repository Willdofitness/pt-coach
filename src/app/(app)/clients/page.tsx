import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <form action={createClient} className="space-x-2 mb-6">
        <input name="name" placeholder="Name" required className="border p-1" />
        <input name="email" placeholder="Email (optional)" className="border p-1" />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1">Add</button>
      </form>
      <ul className="space-y-1">
        {clients.map((c) => (
          <li key={c.id}>
            <Link href={`/clients/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function createClient(formData: FormData) {
  "use server";
  const name = String(formData.get("name"));
  const email = String(formData.get("email") || "");
  // bootstrap: use first coach
  const coach = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: { email: "owner@example.com", role: "COACH" },
  });
  await prisma.client.create({ data: { name, email: email || null, coachId: coach.id } });
}