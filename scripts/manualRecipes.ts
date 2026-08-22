/**
 * Elle yazılan, Türk/bölgesel mutfağın gerçek tarifleri — TheMealDB'nin zayıf
 * olduğu alan (bkz. plan: logical-sauteeing-oasis.md, "(B) sürekli el yapımı
 * ekleme"). Kaynak dil her zaman Türkçe; scripts/seedRecipes.ts --append bunu
 * okuyup lib/ai/translateRecipe.ts ile RECIPE_LANGUAGES'teki diğer 5 dile
 * çevirip Firestore'a yazar.
 *
 * imageURL boş bırakılanlar için: Wikimedia Commons'tan uygun bir görsel
 * bulunup public/recipe-images/ altına indirilecek, ya da kullanıcı kendi
 * fotoğrafını ekleyecek (bkz. plan). Boş image ile seed edilmez — doldurulana
 * kadar bu dosyada bekler.
 */

export interface ManualRecipeInput {
  /** Firestore doküman id'si (slug, boşluksuz). */
  id: string;
  /** FEATURED_CATEGORY_ORDER ile eşleşen İngilizce kategori adı (bkz. lib/mealdb/categoryMeta.ts). */
  category: string;
  /** public/ altında yerel yol, ör. "/recipe-images/mercimek-corbasi.jpg". */
  imageURL: string;
  title: string;
  ingredients: { name: string; measure: string }[];
  steps: string[];
}

export const MANUAL_RECIPES: ManualRecipeInput[] = [
  {
    id: "mercimek-corbasi",
    category: "Starter",
    imageURL: "/recipe-images/mercimek-corbasi.jpg",
    title: "Mercimek Çorbası",
    ingredients: [
      { name: "Kırmızı mercimek", measure: "1.5 su bardağı" },
      { name: "Soğan", measure: "1 adet, doğranmış" },
      { name: "Havuç", measure: "1 adet, doğranmış" },
      { name: "Patates", measure: "1 adet, doğranmış" },
      { name: "Domates salçası", measure: "1 yemek kaşığı" },
      { name: "Tereyağı", measure: "2 yemek kaşığı" },
      { name: "Un", measure: "1 yemek kaşığı" },
      { name: "Su", measure: "6 su bardağı" },
      { name: "Tuz", measure: "1 tatlı kaşığı" },
      { name: "Kimyon", measure: "1 tatlı kaşığı" },
    ],
    steps: [
      "Tereyağını tencerede eritin, doğranmış soğanı ekleyip pembeleşene kadar kavurun.",
      "Havuç ve patatesi ekleyip 2-3 dakika daha kavurun.",
      "Salça ve unu ekleyip 1 dakika kavurun, hamur kokusu geçsin.",
      "Yıkanmış mercimeği ekleyin, üzerine sıcak suyu ilave edip karıştırın.",
      "Kaynadıktan sonra kısık ateşte sebzeler tamamen yumuşayana kadar (yaklaşık 25 dakika) pişirin.",
      "Blenderdan geçirip pürüzsüz hale getirin, tuz ve kimyonu ekleyip 5 dakika daha kaynatıp servis edin.",
    ],
  },
  {
    id: "karniyarik",
    category: "Beef",
    imageURL: "/recipe-images/karniyarik.jpg",
    title: "Karnıyarık",
    ingredients: [
      { name: "Patlıcan", measure: "6 adet, orta boy" },
      { name: "Kıyma", measure: "400 gram" },
      { name: "Soğan", measure: "1 adet, doğranmış" },
      { name: "Sarımsak", measure: "2 diş, doğranmış" },
      { name: "Domates", measure: "3 adet, biri iri doğranmış, ikisi dilim" },
      { name: "Yeşil biber", measure: "3 adet, uzunlamasına yarım" },
      { name: "Domates salçası", measure: "1 yemek kaşığı" },
      { name: "Sıvı yağ", measure: "kızartmak için" },
      { name: "Tuz ve karabiber", measure: "yeterli miktarda" },
      { name: "Maydanoz", measure: "1 tutam, doğranmış" },
    ],
    steps: [
      "Patlıcanları soyup çizgili şekilde soyun (alaca), tuzlu suda 15 dakika bekletip kurulayın.",
      "Patlıcanları sıvı yağda her tarafı yumuşayana kadar kızartıp kağıt havluya alın.",
      "Ayrı bir tavada soğan ve sarımsağı kavurun, kıymayı ekleyip rengi dönene kadar pişirin.",
      "İri doğranmış domatesi, salçayı, tuz ve karabiberi ekleyip 5 dakika daha pişirin, maydanozu ekleyin.",
      "Kızarmış patlıcanları fırın kabına dizin, ortalarını hafifçe yarıp kıymalı harcı doldurun.",
      "Her patlıcanın üzerine bir dilim domates ve yarım yeşil biber yerleştirin.",
      "180°C fırında 20-25 dakika, üzeri hafif kızarana kadar pişirip sıcak servis edin.",
    ],
  },
  {
    id: "menemen",
    category: "Breakfast",
    imageURL: "/recipe-images/menemen.jpg",
    title: "Menemen",
    ingredients: [
      { name: "Yumurta", measure: "4 adet" },
      { name: "Domates", measure: "3 adet, rendelenmiş" },
      { name: "Yeşil biber (sivri)", measure: "2 adet, doğranmış" },
      { name: "Tereyağı", measure: "2 yemek kaşığı" },
      { name: "Tuz", measure: "yeterli miktarda" },
      { name: "Pul biber", measure: "1 tatlı kaşığı (isteğe bağlı)" },
    ],
    steps: [
      "Tereyağını tavada eritin, doğranmış biberleri ekleyip 2-3 dakika kavurun.",
      "Rendelenmiş domatesi ekleyip suyunu salıp çekene kadar orta ateşte pişirin.",
      "Tuz ve isteğe bağlı pul biberi ekleyin.",
      "Yumurtaları doğrudan tavaya kırın, hafifçe karıştırıp kıvamına göre (sulu ya da katı) pişirin.",
      "Sıcak sıcak, yanında ekmekle servis edin.",
    ],
  },
  {
    id: "baklava",
    category: "Dessert",
    imageURL: "/recipe-images/baklava.jpg",
    title: "Baklava",
    ingredients: [
      { name: "Yufka (baklavalık)", measure: "20 yaprak" },
      { name: "İç ceviz ya da Antep fıstığı", measure: "2.5 su bardağı, dövülmüş" },
      { name: "Tereyağı", measure: "250 gram, eritilmiş" },
      { name: "Şeker", measure: "3 su bardağı (şerbet için)" },
      { name: "Su", measure: "2.5 su bardağı (şerbet için)" },
      { name: "Limon suyu", measure: "birkaç damla (şerbet için)" },
    ],
    steps: [
      "Şerbet için şeker ve suyu kaynatıp limon suyunu ekleyin, 10 dakika kaynattıktan sonra soğumaya bırakın.",
      "Fırın tepsisini eritilmiş tereyağıyla yağlayın, bir yufkayı serip yağlayın; bunu 10 yufka için tekrarlayın.",
      "Dövülmüş cevizi/fıstığı eşit şekilde serpin.",
      "Kalan 10 yufkayı da tek tek yağlayarak üzerine dizin.",
      "Baklavayı eşkenar dörtgen (baklava dilimi) şeklinde kesin, üzerine kalan eritilmiş tereyağını gezdirin.",
      "180°C fırında üzeri altın rengi olana kadar (yaklaşık 35-40 dakika) pişirin.",
      "Fırından çıkar çıkmaz soğumuş şerbeti sıcak baklavanın üzerine yavaşça dökün, dinlendirip servis edin.",
    ],
  },
  {
    id: "zeytinyagli-taze-fasulye",
    category: "Vegan",
    imageURL: "/recipe-images/zeytinyagli-taze-fasulye.jpg",
    title: "Zeytinyağlı Taze Fasulye",
    ingredients: [
      { name: "Taze fasulye", measure: "500 gram, ayıklanmış" },
      { name: "Soğan", measure: "1 adet, yarım ay doğranmış" },
      { name: "Domates", measure: "2 adet, rendelenmiş" },
      { name: "Zeytinyağı", measure: "1/2 su bardağı" },
      { name: "Şeker", measure: "1 tatlı kaşığı" },
      { name: "Tuz", measure: "yeterli miktarda" },
      { name: "Su", measure: "1 su bardağı" },
    ],
    steps: [
      "Zeytinyağını geniş bir tencerede ısıtıp soğanı hafifçe kavurun.",
      "Fasulyeleri ekleyip birkaç dakika çevirin.",
      "Rendelenmiş domatesi, tuzu ve şekeri ekleyip karıştırın.",
      "Suyu ilave edip kısık ateşte, kapağı kapalı şekilde fasulyeler yumuşayana kadar (yaklaşık 30-35 dakika) pişirin.",
      "Ilık ya da soğuk olarak servis edin.",
    ],
  },
  {
    id: "tavuk-sis",
    category: "Chicken",
    imageURL: "/recipe-images/tavuk-sis.jpg",
    title: "Tavuk Şiş",
    ingredients: [
      { name: "Tavuk göğsü", measure: "600 gram, küp doğranmış" },
      { name: "Yoğurt", measure: "3 yemek kaşığı" },
      { name: "Sıvı yağ", measure: "2 yemek kaşığı" },
      { name: "Sarımsak", measure: "2 diş, ezilmiş" },
      { name: "Domates salçası", measure: "1 yemek kaşığı" },
      { name: "Kırmızı biber salçası", measure: "1 tatlı kaşığı (isteğe bağlı)" },
      { name: "Tuz, karabiber, kimyon", measure: "yeterli miktarda" },
      { name: "Yeşil ve kırmızı biber, soğan", measure: "şişe dizmek için" },
    ],
    steps: [
      "Yoğurt, sıvı yağ, sarımsak, salçalar ve baharatları karıştırıp marinat hazırlayın.",
      "Tavuk küplerini marinatla iyice harmanlayıp en az 2 saat (tercihen bir gece) buzdolabında bekletin.",
      "Marine olmuş tavukları biber ve soğan parçalarıyla şişlere dizin.",
      "Izgara ya da fırında (220°C) arada çevirerek tavuk iyice pişip hafif kızarana kadar (yaklaşık 15-20 dakika) pişirin.",
      "Pilav ya da lavaş ile sıcak servis edin.",
    ],
  },
];
