/** TheMealDB kategori adları İngilizce (filter.php/URL bunu bekliyor), bu
 * yüzden ekranda gösterilecek Türkçe etiket ve kısa açıklamalar burada elle
 * tutuluyor (AI çevirisi her ana sayfa yüklemesinde yavaş/gereksiz olurdu). */
export const CATEGORY_LABELS_TR: Record<string, string> = {
  Breakfast: "Kahvaltı",
  Chicken: "Tavuk",
  Pasta: "Makarna",
  Dessert: "Tatlı",
  Vegetarian: "Vejetaryen",
  Seafood: "Deniz Ürünleri",
  Beef: "Dana Eti",
  Vegan: "Vegan",
  Side: "Yan Yemek",
  Starter: "Başlangıç",
  Pork: "Domuz Eti",
  Lamb: "Kuzu Eti",
  Miscellaneous: "Diğer",
  Goat: "Keçi Eti",
};

export const CATEGORY_DESCRIPTIONS_TR: Record<string, string> = {
  Breakfast: "Güne enerjik başlamak için kahvaltılık tarifler.",
  Chicken: "Tavuk etiyle hazırlanan pratik ve lezzetli tarifler.",
  Pasta: "Her damak zevkine uygun makarna çeşitleri.",
  Dessert: "Tatlı kriziniz için nefis tarifler.",
  Vegetarian: "Et içermeyen, sebze ağırlıklı doyurucu tarifler.",
  Seafood: "Balık ve deniz ürünleriyle hazırlanan tarifler.",
  Beef: "Dana etiyle yapılan klasik ve doyurucu yemekler.",
  Vegan: "Hayvansal ürün içermeyen bitkisel tarifler.",
  Side: "Ana yemeklerin yanına yakışan garnitürler.",
  Starter: "Sofraya iştah açıcı başlangıçlar.",
  Pork: "Domuz etiyle hazırlanan tarifler.",
  Lamb: "Kuzu etiyle yapılan geleneksel lezzetler.",
  Miscellaneous: "Kategorilere sığmayan farklı tarifler.",
  Goat: "Keçi etiyle hazırlanan özel tarifler.",
};

/** Kategori barında bu sırayla, en başta gösterilecek olanlar — geri kalan
 * kategoriler TheMealDB'den geldiği sırayla bunların ardından eklenir. */
export const FEATURED_CATEGORY_ORDER = [
  "Breakfast",
  "Chicken",
  "Pasta",
  "Dessert",
  "Vegetarian",
  "Seafood",
];

export function getCategoryLabel(name: string): string {
  return CATEGORY_LABELS_TR[name] ?? name;
}

export function getCategoryDescription(name: string): string {
  return CATEGORY_DESCRIPTIONS_TR[name] ?? "";
}

/** Kategorileri, öne çıkanlar en başta olacak şekilde sıralar. */
export function sortCategoriesFeaturedFirst<T extends { name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    const indexA = FEATURED_CATEGORY_ORDER.indexOf(a.name);
    const indexB = FEATURED_CATEGORY_ORDER.indexOf(b.name);
    const rankA = indexA === -1 ? FEATURED_CATEGORY_ORDER.length : indexA;
    const rankB = indexB === -1 ? FEATURED_CATEGORY_ORDER.length : indexB;
    return rankA - rankB;
  });
}
