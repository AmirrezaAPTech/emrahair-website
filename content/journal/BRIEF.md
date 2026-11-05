# Journal article brief (Emrahair)

Emrahair is a women's hair salon in Bahçeşehir 1. Kısım (Başakşehir, İstanbul), founder Emrah Çabkur
(Echosline Türkiye Ambassador). Site: Turkish default, English at /en. Journal articles answer real search
questions and hand readers to the service pages.

## File format
One JSON file per article per locale: `content/journal/<locale>/<slug>.json`, UTF-8, 2-space indent.

```json
{
  "key": "ombre-sombre",                      // same in tr and en: pairs the translations
  "slug": "ombre-sombre-balyaj-farki",        // ASCII kebab-case, locale-specific, = filename
  "title": "H1, natural, contains the main keyword",
  "seoTitle": "<title>, max 60 chars INCLUDING the suffix ' | Emrahair'",
  "description": "meta description, 140–155 chars, keyword early, ends with a reason to click",
  "publishedAt": "2026-11-06",
  "updatedAt": null,
  "tags": ["Balyaj"],
  "hero": null,
  "heroAlt": "",
  "lede": "1–2 sentence intro that directly answers the search question",
  "sections": [
    { "heading": "H2 (question-style where natural)", "body": ["paragraph", "paragraph"], "list": ["optional bullet", "..."] }
  ],
  "faq": [ { "q": "question as people type it", "a": "2–4 sentence answer" } ],
  "relatedPages": ["/balyaj", "/sac-boyama"]
}
```
- `list` is optional per section. 5–7 sections. 3–4 FAQ items (they become FAQPage schema; must be self-contained).
- Length: Turkish 750–1,050 words of body text; English similar.
- Internal links inside paragraphs: markdown `[anchor text](/route-key)` using ONLY these route keys:
  `/balyaj` `/sac-boyama` `/sac-kesimi` `/keratin` `/gelin-saci` `/manikur-pedikur` `/kas-agda` `/hizmetler`
  (price list) `/emrah-cabkur` `/iletisim`. The same keys in both languages (the site maps them to each
  locale's URL). 2–4 links per article, anchor text descriptive (not "buraya tıklayın").
- Prices: NEVER write a TL amount. Insert the token `[[<service id>]]` and the site renders the live price
  (e.g. "Air Touch balyaj [[383324-1]] aralığındadır"). Ids and services are in `src/lib/services.ts`.
- Leave `hero` null and `heroAlt` "" (the editor assigns images).

## Facts rule (strict)
Only state facts about Emrahair that are in: `src/lib/services.ts` (services, prices, who performs them),
`src/lib/site.ts` (address, hours, phone, team, ratings, reviews), `src/i18n/pages/tr/*.json` (existing page
copy). Do NOT invent: products/brands used (except Echosline, which is the founder's ambassadorship),
free consultations, guarantees, durations specific to this salon, awards, years of experience, parking,
payment methods, "best in Bahçeşehir". General hair-care knowledge is fine if accurate and stated
generally ("genellikle", "çoğu saçta"). No medical/health claims, no "zararsız/garantili", no exclamation
marks, no em dashes (use commas or colons), no AI filler ("günümüzde", "sonuç olarak", "unutmayın ki",
"In today's world", "it's important to note").

## Voice
Turkish: native, warm, clear, written for a woman in Bahçeşehir searching on her phone; "siz" form;
Turkish characters correct (ş ğ ı İ ç ö ü). Use the target keywords naturally in the title, lede, one H2
and the description, never stuffed. English: US spelling, the same content adapted (not word-for-word),
for English-speaking residents of Bahçeşehir; keep Turkish service names where people would see them on a
price list only if helpful.

## Validate before finishing
Run a quick Python/Node check: JSON parses, seoTitle ≤ 60, description 140–155, slug == filename,
every [[id]] exists in services.ts, every link key is in the allowed list, no "—" character, no "!".
