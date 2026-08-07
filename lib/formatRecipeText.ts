/** Tarif başlığı + adımlarını panoya kopyalanacak düz metne çevirir (bkz. CopyRecipeButton). */
export function buildRecipeText(title: string, steps: string[]): string {
  const numberedSteps = steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return `${title}\n\n${numberedSteps}`;
}
