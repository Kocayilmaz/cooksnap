import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MealCard from "@/components/MealCard";
import { getMealsByArea } from "@/lib/mealdb/client";
import { getAreaLabel } from "@/lib/mealdb/areaMeta";

interface CuisinePageProps {
  params: Promise<{ a: string }>;
}

export default async function CuisinePage({ params }: CuisinePageProps) {
  const { a } = await params;
  const areaName = decodeURIComponent(a);
  const meals = await getMealsByArea(areaName).catch(() => null);

  if (meals === null) notFound();

  return (
    <div className="flex flex-1 justify-center bg-surface-warm px-4 py-12">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-surface-text-muted transition-colors hover:text-brand-orange"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Anasayfaya dön
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-brand-red">
          {getAreaLabel(areaName)} Mutfağı
        </h1>

        {meals.length === 0 ? (
          <p className="text-sm text-surface-text-muted">Bu mutfakta tarif bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
