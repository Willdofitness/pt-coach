import { prisma } from "@/lib/prisma";

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Exercises</h1>
      <form action={createExercise} className="space-x-2 mb-6">
        <input name="name" placeholder="Name" required className="border p-1" />
        <input name="category" placeholder="Category" className="border p-1" />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1">Add</button>
      </form>
      <ul className="space-y-1">
        {exercises.map((e) => (
          <li key={e.id}>{e.name}</li>
        ))}
      </ul>
    </div>
  );
}

async function createExercise(formData: FormData) {
  "use server";
  const name = String(formData.get("name"));
  const category = String(formData.get("category") || "");
  await prisma.exercise.create({ data: { name, category } });
}