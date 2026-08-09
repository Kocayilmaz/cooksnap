# CookSnap — Görsel Kimlik

`AGENTS.md`'deki "Görsel kimlik notu" burada karara bağlanıyor. Amaç: Liferando, Trendyol Yemek
ve Nefis Yemek Tarifleri gibi yemek sitelerindeki sıcak/canlı hissi vermek, mevcut nötr zinc
paletinin yerini almak.

## Renk paleti

Marka renkleri zaten `app/globals.css`'te tanımlı (`--brand-orange`, `--brand-orange-dark`,
`--brand-red`); bu doküman onlara ek olarak nötr ve durum renklerini karara bağlıyor.

| Rol | Token | Değer | Kullanım |
| --- | --- | --- | --- |
| Marka / vurgu | `--brand-orange` | `#f2600c` | Birincil buton, aktif seçim durumu |
| Marka / hover | `--brand-orange-dark` | `#c94e09` | Birincil buton hover |
| Marka / başlık | `--brand-red` | `#e8272b` | Logo/başlık vurgusu, ikincil aksan |
| Nötr yüzey | `--surface-warm` | `#fffaf5` | Sayfa arka planı (zinc-50 yerine) |
| Nötr kart | `--surface-card` | `#ffffff` | Kart/panel arka planı |
| Nötr kenarlık | `--surface-border` | `#f0dfd0` | Kart kenarlığı (zinc-200 yerine, sıcak ton) |
| Nötr metin | `--surface-text-muted` | `#8a7a6d` | İkincil metin (zinc-500 yerine, sıcak gri) |
| Başarı | `--state-success` | `#1a8f4f` | Onay/başarı mesajı |
| Hata | `--state-error` | `#e8272b` | Hata mesajı — `--brand-red` ile aynı, ayrı tutulmuyor |

**Karanlık mod desteklenmiyor (2026-08-09, kullanıcı kararı):** Uygulama sadece açık temada
çalışır — `prefers-color-scheme: dark` kasıtlı olarak dinlenmiyor. Yeni bir bileşen eklerken
`dark:*` Tailwind sınıfı veya karanlık moda özel bir CSS kuralı eklenmemeli.

## Tipografi

Mevcut `Geist Sans` / `Geist Mono` (Next.js varsayılanı) korunuyor; ayrı bir yemek-sitesi fontuna
geçiş şu an gerekli görülmüyor, öncelik renk/sıcaklık.

## Uygulama sırası

Palet, mevcut sıcak-yeniden-tasarım commit'leriyle (bkz. `AGENTS.md` backlog) kademeli olarak
uygulanıyor: önce yeni token'lar `globals.css`'e eklenir, sonra bileşenler tek tek zinc yerine bu
token'ları kullanacak şekilde güncellenir. Tek seferde tüm UI'ı değiştirmiyoruz.

## Do's / Don'ts

- ✅ Yeni bileşenlerde zinc-* yerine yukarıdaki token'ları kullan.
- ✅ Hata rengi için her zaman `--state-error` (kırmızı ailesi), asla turuncu kullanma —
  kullanıcı marka rengiyle hatayı karıştırmasın.
- ❌ Yeni bir marka rengi/ton eklemeden önce bu tabloyu güncelle, dağınık renk seti oluşturma.
- ❌ Karanlık mod için `dark:*` sınıfı ekleme — uygulama kasıtlı olarak sadece açık temayı destekliyor.
