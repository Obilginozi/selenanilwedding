# Selen & Anıl — Düğün Davetiyesi

Tek sayfa (single page), koyu ve romantik temalı düğün davetiyesi. Saf HTML/CSS/JS — derleme (build) adımı yoktur. Mobil öncelikli tasarlanmıştır.

**Canlı:** [selenanilwedding.xyz](https://selenanilwedding.xyz)

## Özellikler

- Hero bölümü: isimler, tarih, mekan ve davet metni
- Büyük güne canlı **geri sayım** (gün / saat / dakika / saniye)
- **Hikayemiz** zaman çizelgesi
- Romantik **güzel sözler** kartları
- **Etkinlik bilgisi** + yol tarifi (harita) bağlantısı
- Detaylı **Takvime Ekle** (Apple Takvim / Google Takvim / Outlook / `.ics`)
  - iOS, Android ve masaüstü platform tespiti ile önerilen seçenek öne çıkar
- Kaydırmaya bağlı yumuşak animasyonlar, dökülen yaprak efekti
- `prefers-reduced-motion` desteği (hareket azaltma)

## Etkinlik Bilgileri

| | |
|---|---|
| **Çift** | Selen & Anıl |
| **Tarih** | 20 Eylül 2026, Pazar |
| **Saat** | 19:00 (Europe/Istanbul, UTC+3) |
| **Mekan** | Başoğlu Elit Kır Bahçesi, Çerkez Taş Köprü Köyü, Merkez / Düzce |

## Dosya Yapısı

```
.
├── index.html        # Tüm bölümler
├── css/styles.css    # Koyu/romantik tema, responsive
├── js/main.js        # Geri sayım, takvime ekle, animasyonlar
├── assets/           # favicon vb.
├── CNAME             # Custom domain: selenanilwedding.xyz
├── .nojekyll         # Jekyll işlemesini kapatır
└── README.md
```

## Yerel Önizleme

Derleme gerekmez. Basit bir statik sunucu yeterlidir:

```bash
# Python ile
python3 -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

Ya da `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz (takvim `.ics` indirme ve fontlar için yerel sunucu önerilir).

## GitHub Pages ile Yayınlama

1. Bu klasörü repoya gönderin (`main` dalı, kök dizin):

   ```bash
   git init
   git add .
   git commit -m "Selen & Anıl düğün davetiyesi"
   git branch -M main
   git remote add origin https://github.com/Obilginozi/selenanilwedding.git
   git push -u origin main
   ```

2. GitHub'da repo > **Settings > Pages**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `root` (`/`) seçin, **Save**.

3. **Custom domain:** Pages ayarında `selenanilwedding.xyz` yazılı olmalı (repodaki `CNAME` dosyası bunu otomatik ayarlar). Doğrulama tamamlanınca **Enforce HTTPS** kutusunu işaretleyin.

### DNS Ayarları (zaten yapıldıysa atlayın)

Domain sağlayıcısında:

- **A kayıtları** (apex `selenanilwedding.xyz` için), dördü de:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- **CNAME kaydı** (`www` için): `obilginozi.github.io`

> DNS ve HTTPS sertifikasının yayılması birkaç dakika ile birkaç saat sürebilir.

## İçeriği Düzenleme

- **Metinler / sözler / hikaye:** `index.html` içinden doğrudan düzenleyin (placeholder metinler kullanıcı tarafından güncellenmek üzere konuldu).
- **Etkinlik tarihi / mekan / harita:** Tek noktadan değiştirin → `js/main.js` içindeki `EVENT` nesnesi (takvim ve geri sayım buradan beslenir). Geri sayım hedefi ayrıca `index.html`'de `#countdown` öğesinin `data-target` değerindedir.
- **Renkler / tema:** `css/styles.css` en üstteki `:root` değişkenleri (`--gold`, `--rose`, `--wine` vb.).
