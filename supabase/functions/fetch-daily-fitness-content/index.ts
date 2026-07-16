import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    const results: Record<string, unknown>[] = [];

    // ---------- 1) Fetch random exercise from wger.de ----------
    try {
      const exerciseRes = await fetch(
        "https://wger.de/api/v2/exerciseinfo/?language=2&limit=50&format=json",
      );
      const exerciseJson = await exerciseRes.json();
      const exercises = exerciseJson.results ?? [];

      if (exercises.length > 0) {
        const randomExercise =
          exercises[Math.floor(Math.random() * exercises.length)];

        const translation = randomExercise.translations?.find(
          (t: { language: number }) => t.language === 2,
        ) ?? randomExercise.translations?.[0];

        const exerciseRow = {
          content_type: "exercise",
          title: translation?.name ?? "Untitled Exercise",
          description: (translation?.description ?? "").replace(/<[^>]*>/g, ""),
          image_url: randomExercise.images?.[0]?.image ?? null,
          category: randomExercise.category?.name ?? null,
          source: "wger.de",
          raw_data: randomExercise,
        };

        const { error } = await supabase
          .from("daily_fitness_content")
          .insert(exerciseRow);

        if (error) throw error;
        results.push({ type: "exercise", status: "inserted", title: exerciseRow.title });
      }
    } catch (err) {
      results.push({ type: "exercise", status: "failed", error: String(err) });
    }

    // ---------- 2) Fetch random healthy meal from TheMealDB ----------
    try {
      const mealRes = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php",
      );
      const mealJson = await mealRes.json();
      const meal = mealJson.meals?.[0];

      if (meal) {
        const mealRow = {
          content_type: "meal",
          title: meal.strMeal,
          description: meal.strInstructions?.slice(0, 500) ?? null,
          image_url: meal.strMealThumb ?? null,
          category: meal.strCategory ?? null,
          source: "themealdb.com",
          raw_data: meal,
        };

        const { error } = await supabase
          .from("daily_fitness_content")
          .insert(mealRow);

        if (error) throw error;
        results.push({ type: "meal", status: "inserted", title: mealRow.title });
      }
    } catch (err) {
      results.push({ type: "meal", status: "failed", error: String(err) });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});