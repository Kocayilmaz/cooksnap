import RecipeVideoEmbed from "@/components/RecipeVideoEmbed";
import FavoriteButton from "@/components/FavoriteButton";
import CopyRecipeButton from "@/components/CopyRecipeButton";
import type { RecipeSuggestion } from "@/lib/types/recipe";

interface RecipeMessageCardProps {
  recipe: RecipeSuggestion;
}

/** Sohbet akışındaki bir AI yanıtının tek bir tarif kartı — daha önce
 * app/chat/page.tsx'te doğrudan yazılan listeyi, tekrar mesaj başına
 * kullanılabilecek şekilde ayrı bileşene çıkarır. */
export default function RecipeMessageCard({ recipe }: RecipeMessageCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{recipe.title}</p>
        <div className="flex shrink-0 items-center gap-3">
          <CopyRecipeButton title={recipe.title} steps={recipe.steps} />
          <FavoriteButton
            equipment={recipe.equipment}
            title={recipe.title}
            steps={recipe.steps}
            videoId={recipe.videoId}
          />
        </div>
      </div>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-surface-text-muted">
        {recipe.steps.map((step, stepIndex) => (
          <li key={stepIndex}>{step}</li>
        ))}
      </ol>
      {recipe.videoId && <RecipeVideoEmbed videoId={recipe.videoId} title={recipe.title} />}
    </div>
  );
}
