export async function addExerciseToWorkout(fd: FormData) {
  "use server";
  const workoutId = String(fd.get("workoutId"));
  const exerciseName = String(fd.get("exerciseName")).trim();

  // Try to find by name (case-insensitive)
  const existing = await prisma.exercise.findFirst({
    where: { name: { equals: exerciseName, mode: "insensitive" } },
  });

  const exercise = existing ?? (await prisma.exercise.create({ data: { name: exerciseName } }));

  await prisma.workoutExercise.create({
    data: { workoutId, exerciseId: exercise.id },
  });
}