# 🎬 fair-playwright Demo Guide

Bu guide size **fair-playwright** reporter'ın tüm özelliklerini gösterecek demo testleri nasıl çalıştıracağınızı anlatıyor.

---

## 📋 Demo Testler

`tests/ecommerce.demo.spec.ts` dosyasında 3 test var:

### 1️⃣ **Başarılı Senaryo** 
**Test:** `successful user registration and purchase flow`

**3 MAJOR Step:**
- 🔐 User Registration (3 minor steps)
- 🛒 Product Selection (3 minor steps)
- 💳 Checkout and Payment (4 minor steps)

**Sonuç:** Tüm steplar başarılı 

---

### 2️⃣ **Hata Senaryosu** 
**Test:** `user registration with payment failure`

**3 MAJOR Step:**
- 🔐 User Registration (3 minor steps) 
- 🛒 Add Products to Cart (4 minor steps) 
- 💳 Payment Processing (4 minor steps)  **FAILS HERE!**

**Sonuç:** Ödeme aşamasında kasıtlı hata!

---

### 3️⃣ **Mixed Mode** 🔀
**Test:** `mixed mode: quick login and detailed checkout`

**Hybrid yaklaşım:**
- Inline mode ile hızlı steplar
- Declarative mode ile detaylı flow
- Her iki API'yi birlikte kullanma örneği

---

##  Testleri Çalıştırma

### Yöntem 1: Tüm Demo Testleri

```bash
cd test-project
npx playwright test ecommerce.demo.spec.ts
```

### Yöntem 2: Tek Bir Test

```bash
# Sadece başarılı senaryo
npx playwright test ecommerce.demo.spec.ts -g "successful user registration"

# Sadece hata senaryosu
npx playwright test ecommerce.demo.spec.ts -g "payment failure"

# Sadece mixed mode
npx playwright test ecommerce.demo.spec.ts -g "mixed mode"
```

### Yöntem 3: UI Mode (Recommended! )

```bash
npx playwright test ecommerce.demo.spec.ts --ui
```

**UI mode'da:**
- Her step'i tek tek izleyebilirsin
- Hangi step'te hata olduğunu görürsün
- Progressive output'u canlı görebilirsin

---

## 📺 Ne Göreceksin?

### Terminal Çıktısı (Progressive Mode)

```
🎭 Fair Playwright Reporter
Running 3 test(s)...

Progress: 1/3 tests (33%)
✓ 1 ✗ 0

Running:
  ▶ [MAJOR] User Registration (523ms)
    ▸ [minor] Fill user information (234ms)

────────────────────────────────────────────

✓ successful user registration and purchase flow (2.1s)

Progress: 2/3 tests (66%)
✓ 1 ✗ 0

Running:
  ▶ [MAJOR] Payment Processing (1523ms)
    ▸ [minor] Process payment transaction (812ms)

✗ user registration with payment failure
  Error: Locator.click: Timeout 2000ms exceeded

  Failed steps:
    ✗ [MAJOR] Payment Processing
      ✗ [minor] Process payment transaction
        Error: waiting for locator('.non-existent-payment-button')

────────────────────────────────────────────

✗ 1 failed
✓ 2 passed

Total: 3 test(s)
Duration: 8.45s

 AI Summary: ./test-results/ai-summary.md
```

---

## 📄 AI Summary (ai-summary.md)

Test bittikten sonra `test-results/ai-summary.md` dosyası oluşur:

```markdown
# Test Results

**Status**:  FAILED (2/3 tests passed)
**Duration**: 8.45s

##  Failed Tests

### user registration with payment failure

**Steps Executed**:
1.  [MAJOR] User Registration (845ms)
   -  [minor] Open registration form (234ms)
   -  [minor] Fill registration details (189ms)
   -  [minor] Submit registration (156ms)

2.  [MAJOR] Add Products to Cart (1234ms)
   -  [minor] Search for products (345ms)
   -  [minor] Add premium product (234ms)
   -  [minor] Apply discount code (189ms)
   -  [minor] Calculate total (156ms)

3.  [MAJOR] Payment Processing (2341ms)
   -  [minor] Enter payment details (234ms)
   -  [minor] Verify credit card (189ms)
   -  [minor] Process payment transaction (1812ms)
     Error: Locator.click: Timeout 2000ms exceeded

**Artifacts**:
- screenshot: ./test-results/screenshot.png
- trace: ./test-results/trace.zip
```

---

##  Her Test'in Detayları

### Test 1: Successful Flow 

**MAJOR Step 1: User Registration**
- Navigate to registration page → 
- Fill user information → 
- Verify account created → 

**MAJOR Step 2: Product Selection**
- Browse product catalog → 
- Select product and add to cart → 
- Verify cart contents → 

**MAJOR Step 3: Checkout and Payment**
- Go to checkout → 
- Fill shipping information → 
- Process payment → 
- Send confirmation email → 

**Terminal'de göreceğin:**
```
✓ successful user registration and purchase flow (2.1s)
```

---

### Test 2: Payment Failure 

**MAJOR Step 1: User Registration** 
- Open registration form → 
- Fill registration details → 
- Submit registration → 

**MAJOR Step 2: Add Products to Cart** 
- Search for products → 
- Add premium product → 
- Apply discount code → 
- Calculate total → 

**MAJOR Step 3: Payment Processing** 
- Enter payment details → 
- Verify credit card → 
- **Process payment transaction →  FAILS HERE!**
- Generate receipt → ⏸️ SKIPPED

**Terminal'de göreceğin:**
```
✗ user registration with payment failure
  Error: Locator.click: Timeout 2000ms exceeded
  at tests/ecommerce.demo.spec.ts:123:45

  Failed steps:
    ✗ [MAJOR] Payment Processing
      ✗ [minor] Process payment transaction
        Error: waiting for locator('.non-existent-payment-button')
```

---

### Test 3: Mixed Mode 🔀

**Inline Mode Steps:**
- Navigate to site → 
- Quick login → 

**Declarative Mode - MAJOR Step:**
- Detailed Checkout Process
  - Add item to cart → 
  - Review order → 
  - Complete purchase → 

**Inline Mode Final Check:**
- Verify success → 

---

##  İnceleme Önerileri

### 1. Progressive Output'u İzle
```bash
# Terminal'de canlı görmek için
npx playwright test ecommerce.demo.spec.ts
```

**Dikkat et:**
- Progress bar nasıl ilerliyor
- Running steps nasıl gösteriliyor
- MAJOR/MINOR badges
- Renkli çıktılar ( yeşil,  kırmızı)

### 2. AI Summary'yi İncele
```bash
# Test bittikten sonra
cat test-results/ai-summary.md
```

**Dikkat et:**
- MAJOR/MINOR hierarchy
- Failed step'lerin detayları
- Screenshot/trace linkleri
- Structured markdown format

### 3. JSON Output'u İncele
```bash
# JSON formatını görmek için
cat test-results/results.json | jq .
```

**Dikkat et:**
- Machine-readable format
- Tam test data
- API/analytics için ideal

### 4. UI Mode'da Adım Adım İzle
```bash
npx playwright test ecommerce.demo.spec.ts --ui
```

**Dikkat et:**
- Her step'i tek tek çalıştır
- Failed step'te ne olduğunu gör
- Screenshot'ları hemen gör

---

##  Ne Öğreneceksin?

### MAJOR/MINOR Hierarchy
- `e2e.major()` → Büyük iş akışları
- `e2e.minor()` → Küçük detay adımlar
- Declarative mode → Karmaşık flow'lar için ideal

### Error Handling
- Failed step'ler nasıl raporlanıyor
- Error messages nasıl gösteriliyor
- MAJOR step fail olunca diğer step'ler skip ediliyor

### Progressive Terminal
- Canlı progress tracking
- Running steps gösterimi
- Auto-clear completed tests
- CI detection (local vs CI farklı output)

### AI-Optimized Output
- Claude Code için ideal format
- Structured markdown
- Context-rich error reports

---

## 🐛 Debugging

### Test Fail Olursa Ne Yapmalı?

1. **Terminal output'a bak**
   - Hangi step fail oldu?
   - Error message ne diyor?

2. **AI summary'yi oku**
   ```bash
   cat test-results/ai-summary.md
   ```
   - Tüm step history
   - Failed step details
   - Screenshot/trace links

3. **UI Mode'da tekrar çalıştır**
   ```bash
   npx playwright test ecommerce.demo.spec.ts --ui -g "payment failure"
   ```
   - Step by step incele
   - Screenshot'ları gör
   - Trace'i açarak debug et

4. **Trace viewer**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```
   - Network requests
   - DOM snapshots
   - Console logs

---

##  Expected Results

### Tüm testleri çalıştırınca:
```
Running 3 test(s)...

✓ successful user registration and purchase flow (2.1s)
✗ user registration with payment failure (4.5s)
✓ mixed mode: quick login and detailed checkout (1.8s)

────────────────────────────────────────────

✗ 1 failed
✓ 2 passed

Total: 3 test(s)
Duration: 8.45s

 AI Summary: ./test-results/ai-summary.md
```

**Bu normal!** 1 test intentionally fail ediliyor.

---

## 🎓 Sonraki Adımlar

1. **Kendi testlerini yaz**
   - Bu dosyayı template olarak kullan
   - Kendi e2e flow'larını ekle
   - MAJOR/MINOR hierarchy ile organize et

2. **Gerçek projeye entegre et**
   ```bash
   npm install -D fair-playwright
   ```

3. **CI'da test et**
   - GitHub Actions'da çalıştır
   - AI summary'yi artifact olarak kaydet
   - Failed testleri otomatik analiz et

---

## 📞 Yardım

Sorun mu yaşıyorsun?

1. GitHub Issues: https://github.com/baranaytass/fair-playwright/issues
2. Documentation: README.md ve CLAUDE.md dosyalarına bak
3. Examples: Bu dosyayı referans al

---

**Keyifli testler!** 
