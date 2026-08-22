import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMealById } from "@/lib/mealdb/client";
import RecipeVideoEmbed from "@/components/RecipeVideoEmbed";

interface MealPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPage({ params }: MealPageProps) {
  const { id } = await params;
  const meal = await getMealById(id);

  if (!meal) notFound();

  return (
    <div className="flex flex-1 justify-center bg-surface-warm px-4 py-12">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface-card p-8 shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-surface-text-muted transition-colors hover:text-brand-orange"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Anasayfaya dön
        </Link>

        <Image
          src={meal.thumbnail}
          alt={meal.name}
          width={640}
          height={480}
          className="w-full rounded-xl object-cover"
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-red">{meal.name}</h1>
          <p className="text-sm text-surface-text-muted">
            {[meal.category, meal.area].filter(Boolean).join(" · ")}
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">Malzemeler</h2>
          <ul className="flex flex-col gap-1 text-sm text-surface-text-muted">
            {meal.ingredients.map((ingredient) => (
              <li key={ingredient.name}>
                {ingredient.measure ? `${ingredient.measure} ` : ""}
                {ingredient.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">Hazırlanışı</h2>
          <p className="whitespace-pre-line text-sm text-surface-text-muted">{meal.instructions}</p>
        </section>

        {meal.youtubeVideoId && <RecipeVideoEmbed videoId={meal.youtubeVideoId} title={meal.name} />}
      </main>
    </div>
  );
}
