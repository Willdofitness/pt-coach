import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      workouts: {
        orderBy: { createdAt: "desc" },
        include: {
          workoutExercises: { include: { exercise: true } },
        },
      },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!client) return notFound();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <form action={deleteClient}>
          <input type="hidden" name="id" value={client.id} />
          <button className="border px-3 py-1 rounded">Delete</button>
        </form>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">New workout</h2>
        <form action={createWorkout} className="space-x-2">
          <input type="hidden" name="clientId" value={client.id} />
          <input name="title" placeholder="e.g. Lower A" className="border p-1" required />
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Add workout</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Workouts</h2>
        <ul className="space-y-4">
          {client.workouts.map(w => (
            <li key={w.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <strong>{w.title || "Untitled workout"}</strong>
                <form action={deleteWorkout}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="text-sm underline">Delete</button>
                </form>
              </div>

              <form action={addExerciseToWorkout} className="mt-3 space-x-2">
                <input type="hidden" name="workoutId" value={w.id} />
                <input name="exerciseName" placeholder="Exercise name" className="border p-1" required />
                <button className="border px-2 py-1 rounded">Add exercise</button>
              </form>

              <ul className="mt-3 space-y-2">
                {w.workoutExercises.map(we => (
                  <li key={we.id} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <span>{we.exercise.name}</span>
                      <form action={logSet} className="space-x-1">
                        <input type="hidden" name="workoutExerciseId" value={we.id} />
                        <input name="weight" placeholder="kg" className="border p-1 w-20" />
                        <input name="reps" placeholder="reps" className="border p-1 w-20" />
                        <button className="text-sm border px-2 py-1 rounded">Log</button>
                      </form>
                    </div>
                    <Sets workoutExerciseId={we.id} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Notes</h2>
        <form action={addNote} className="space-x-2">
          <input type="hidden" name="clientId" value={client.id} />
          <input name="content" placeholder="Add note…" className="border p-1 w-[400px]" required />
          <button className="border px-3 py-1 rounded">Add</button>
        </form>
        <ul className="mt-3 space-y-2">
          {client.notes.map(n => <li key={n.id} className="border rounded p-2">{n.content}</li>)}
        </ul>
      </section>
    </div>
  );
}

async function Sets({ workoutExerciseId }: { workoutExerciseId: string }) {
  const sets = await prisma.workoutSet.findMany({
    where: { workoutExerciseId },
    orderBy: { setNumber: "desc" },
    take: 5,
  });
  return (
    <ul className="mt-2 text-sm text-gray-300">
      {sets.map(s => (
        <li key={s.id}>
          Set {s.setNumber}: {s.weight ?? "-"} kg × {s.achievedReps ?? "-"}
        </li>
      ))}
    </ul>
  );
}

/* ── Server Actions ─────────────────────────────────────────── */

export async function deleteClient(fd: FormData) {
  "use server";
  const id = String(fd.get("id"));
  await prisma.client.delete({ where: { id } });
}

export async function createWorkout(fd: FormData) {
  "use server";
  const clientId = String(fd.get("clientId"));
  const title = String(fd.get("title") || "Workout");
  await prisma.workout.create({ data: { clientId, title } });
}

export async function deleteWorkout(fd: FormData) {
  "use server";
  const id = String(fd.get("id"));
  await prisma.workout.delete({ where: { id } });
}

export async function addExerciseToWorkout(fd: FormData) {
  "use server";
  const workoutId = String(fd.get("workoutId"));
  const exerciseName = String(fd.get("exerciseName")).trim();

  const existing = await prisma.exercise.findFirst({
    where: { name: { equals: exerciseName, mode: "insensitive" } },
  });

  const exercise = existing ?? (await prisma.exercise.create({ data: { name: exerciseName } }));

  await prisma.workoutExercise.create({
    data: { workoutId, exerciseId: exercise.id },
  });
}

export async function logSet(fd: FormData) {
  "use server";
  const workoutExerciseId = String(fd.get("workoutExerciseId"));
  const weight = Number(fd.get("weight") || 0);
  const reps = Number(fd.get("reps") || 0);

  const count = await prisma.workoutSet.count({ where: { workoutExerciseId } });
  await prisma.workoutSet.create({
    data: {
      workoutExerciseId,
      setNumber: count + 1,
      weight,
      achievedReps: reps,
    },
  });
}

export async function addNote(fd: FormData) {
  "use server";
  const clientId = String(fd.get("clientId"));
  const content = String(fd.get("content"));
  await prisma.note.create({ data: { clientId, content } });
}
