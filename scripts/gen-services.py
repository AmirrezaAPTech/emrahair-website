"""Build src/lib/services.ts from the parsed Kolay Randevu catalogue."""
import json
import re
import sys

src_json, out_ts = sys.argv[1], sys.argv[2]
cats = json.load(open(src_json, encoding="utf-8"))
by_id = {s["id"]: s for c in cats for s in c["services"]}

# Prices as published on kolayrandevu.com/isletme/emrahair (2026-11-04).
PRICES = {
    "Saç Yıkama": (100, None), "Saç Kaynağı": (150, 250), "Fön": (500, 750), "Kırık Fön": (600, None),
    "Maşa": (1500, 2500), "Örgü": (1500, 3000), "Saç Kesimi": (1750, 2000), "at kuyruğu": (2000, None),
    "İtalyan Dip Boyama": (2000, 3000), "authentic salon bakımı": (2500, None), "parlatma servisi": (2500, None),
    "Amonyaksız dip boyama": (2500, 3500), "igora dip boyama": (2500, 3500), "Cila saç": (2500, 4000),
    "Topuz": (3000, 3500), "Nişan Saçı": (4000, 7500), "Perma": (4000, 7500),
    "keratin botox sakinleştirici bakım": (4000, 8000), "Saç Boyama": (5000, 10000),
    "keratin düzleştirici bakım": (5000, 15000), "dip açma boyama": (6500, 9000), "Gelin Başı": (7500, 15000),
    "Röfle ve Gölge": (8000, 10000), "brushlight": (8000, 12000), "Sombre": (8000, 15000),
    "Air touch balyaj": (10000, 20000), "balyaj": (10000, 20000), "Ombre": (10000, 20000),
    "Kalıcı Oje Çıkarma": (200, None), "Manikür": (800, None), "Pedikür": (1000, None),
    "Kalıcı Oje El": (1000, 1500), "Kalıcı Oje Ayak": (1200, None), "Oje Uygulama": (100, None),
    "Dudak Üstü": (150, None), "Kaş Boyama": (500, None), "Kaş Alma": (600, None),
    "çene ağda": (200, None), "Ağda (koltuk altı)": (300, None), "Ağda (kol)": (600, None),
    "Ağda (bacak )": (1000, None), "Ağda (Bölgesel)": (1000, None), "Ağda (Tüm Vücut)": (3500, None),
}

# Display name (tr, en). Kolay Randevu's own casing is uneven; the site tidies it.
NAMES = {
    "Saç Yıkama": ("Saç Yıkama", "Hair Wash"), "Saç Kaynağı": ("Saç Kaynağı", "Hair Extensions (per strand)"),
    "Fön": ("Fön", "Blow-dry"), "Kırık Fön": ("Kırık Fön", "Textured Blow-dry"), "Maşa": ("Maşa", "Curling-iron Styling"),
    "Örgü": ("Örgü", "Braiding"), "Saç Kesimi": ("Saç Kesimi", "Haircut"), "at kuyruğu": ("At Kuyruğu", "Ponytail Styling"),
    "İtalyan Dip Boyama": ("İtalyan Dip Boyama", "Italian Root Color"),
    "authentic salon bakımı": ("Authentic Salon Bakımı", "Authentic Salon Treatment"),
    "parlatma servisi": ("Parlatma Servisi", "Gloss Service"),
    "Amonyaksız dip boyama": ("Amonyaksız Dip Boyama", "Ammonia-free Root Color"),
    "igora dip boyama": ("Igora Dip Boyama", "Igora Root Color"), "Cila saç": ("Saç Cilası", "Hair Glaze"),
    "Topuz": ("Topuz", "Updo"), "Nişan Saçı": ("Nişan Saçı", "Engagement Hair"), "Perma": ("Perma", "Perm"),
    "keratin botox sakinleştirici bakım": ("Keratin Botox Bakımı", "Keratin Botox Treatment"),
    "Saç Boyama": ("Saç Boyama", "Full Color"),
    "keratin düzleştirici bakım": ("Keratin Düzleştirici Bakım", "Keratin Smoothing Treatment"),
    "dip açma boyama": ("Dip Açma Boyama", "Root Lift & Color"), "Gelin Başı": ("Gelin Başı", "Bridal Hair"),
    "Röfle ve Gölge": ("Röfle & Gölge", "Highlights & Lowlights"), "brushlight": ("Brushlight", "Brushlight"),
    "Sombre": ("Sombre", "Sombré"), "Air touch balyaj": ("Air Touch Balyaj", "Air Touch Balayage"),
    "balyaj": ("Balyaj", "Balayage"), "Ombre": ("Ombre", "Ombré"),
    "Saç Bakımı": ("Saç Bakımı", "Hair Treatment"), "Saç Renk Değişimi": ("Saç Renk Değişimi", "Color Change"),
    "Saç Dip Boyama": ("Saç Dip Boyama", "Root Color"), "Keratin Bakım": ("Keratin Bakım", "Keratin Care"),
    "Brezilya Fönü": ("Brezilya Fönü", "Brazilian Blow-out"),
    "Kalıcı Oje Çıkarma": ("Kalıcı Oje Çıkarma", "Gel Polish Removal"), "Manikür": ("Manikür", "Manicure"),
    "Pedikür": ("Pedikür", "Pedicure"), "Kalıcı Oje El": ("Kalıcı Oje · El", "Gel Polish · Hands"),
    "Kalıcı Oje Ayak": ("Kalıcı Oje · Ayak", "Gel Polish · Feet"), "Oje Uygulama": ("Oje Uygulama", "Nail Polish"),
    "Dudak Üstü": ("Dudak Üstü", "Upper Lip"), "Kaş Boyama": ("Kaş Boyama", "Brow Tint"), "Kaş Alma": ("Kaş Alma", "Brow Shaping"),
    "çene ağda": ("Çene Ağda", "Chin Wax"), "Ağda (koltuk altı)": ("Ağda · Koltuk Altı", "Wax · Underarm"),
    "Ağda (kol)": ("Ağda · Kol", "Wax · Arms"), "Ağda (bacak )": ("Ağda · Bacak", "Wax · Legs"),
    "Ağda (Bölgesel)": ("Ağda · Bölgesel", "Wax · Single Area"), "Ağda (Tüm Vücut)": ("Ağda · Tüm Vücut", "Wax · Full Body"),
}

GROUPS = [
    ("color", ["Air touch balyaj", "balyaj", "Sombre", "Ombre", "brushlight", "Röfle ve Gölge", "Saç Renk Değişimi",
               "Saç Boyama", "dip açma boyama", "İtalyan Dip Boyama", "Amonyaksız dip boyama", "igora dip boyama", "Saç Dip Boyama"]),
    ("cut", ["Saç Kesimi", "Fön", "Kırık Fön", "Brezilya Fönü", "Maşa", "Örgü", "at kuyruğu", "Topuz", "Nişan Saçı",
             "Gelin Başı", "Saç Yıkama"]),
    ("care", ["keratin düzleştirici bakım", "keratin botox sakinleştirici bakım", "Keratin Bakım", "Saç Bakımı",
              "authentic salon bakımı", "parlatma servisi", "Cila saç", "Perma", "Saç Kaynağı"]),
    ("nails", ["Manikür", "Pedikür", "Kalıcı Oje El", "Kalıcı Oje Ayak", "Kalıcı Oje Çıkarma", "Oje Uygulama"]),
    ("brows", ["Kaş Alma", "Kaş Boyama", "Dudak Üstü"]),
    ("wax", ["Ağda (Bölgesel)", "Ağda (koltuk altı)", "Ağda (kol)", "Ağda (bacak )", "çene ağda", "Ağda (Tüm Vücut)"]),
]

# Who performs what, from each person's kolayrandevu.com/kisi page.
STAFF_SERVICES = {
    "emrah": "Air touch balyaj, Amonyaksız dip boyama, at kuyruğu, authentic salon bakımı, balyaj, brushlight, Cila saç, dip açma boyama, Fön, Gelin Başı, igora dip boyama, İtalyan Dip Boyama, keratin botox sakinleştirici bakım, keratin düzleştirici bakım, Kırık Fön, Maşa, Nişan Saçı, Ombre, Örgü, parlatma servisi, Perma, Röfle ve Gölge, Saç Boyama, Saç Kaynağı, Saç Kesimi, Saç Yıkama, Sombre, Topuz",
    "serdar": "Amonyaksız dip boyama, at kuyruğu, authentic salon bakımı, balyaj, Brezilya Fönü, brushlight, Cila saç, dip açma boyama, Fön, Gelin Başı, igora dip boyama, İtalyan Dip Boyama, Keratin Bakım, keratin botox sakinleştirici bakım, keratin düzleştirici bakım, Kırık Fön, Maşa, Nişan Saçı, Ombre, Örgü, parlatma servisi, Perma, Röfle ve Gölge, Saç Bakımı, Saç Boyama, Saç Dip Boyama, Saç Kaynağı, Saç Kesimi, Saç Renk Değişimi, Saç Yıkama, Sombre, Topuz",
    "merve": "Amonyaksız dip boyama, Cila saç, Fön, igora dip boyama, İtalyan Dip Boyama, keratin botox sakinleştirici bakım, keratin düzleştirici bakım, Kırık Fön, Maşa, Saç Boyama, Saç Yıkama",
    "zeynep": "Amonyaksız dip boyama, at kuyruğu, authentic salon bakımı, Cila saç, dip açma boyama, Fön, igora dip boyama, İtalyan Dip Boyama, keratin botox sakinleştirici bakım, keratin düzleştirici bakım, Kırık Fön, Maşa, Örgü, Saç Boyama, Saç Kaynağı, Saç Yıkama, Topuz",
    "gizem": "Ağda (bacak ), Ağda (Bölgesel), Ağda (kol), Ağda (koltuk altı), Ağda (Tüm Vücut), çene ağda, Dudak Üstü, Kalıcı Oje Ayak, Kalıcı Oje Çıkarma, Kalıcı Oje El, Kaş Alma, Kaş Boyama, Manikür, Oje Uygulama, Pedikür",
}
norm = lambda s: re.sub(r"\s+", " ", s).strip().casefold()
staff_of = {}
for person, lst in STAFF_SERVICES.items():
    for n in lst.split(", "):
        staff_of.setdefault(norm(n), []).append(person)

name_to_id = {s["name"]: s["id"] for s in by_id.values()}
SIGNATURE = {"Air touch balyaj", "balyaj", "Saç Kesimi", "keratin botox sakinleştirici bakım", "Gelin Başı", "Sombre"}

used = set()
lines = []
for key, names in GROUPS:
    lines.append(f"  {{\n    key: '{key}',\n    items: [")
    for n in names:
        sid = name_to_id[n]
        used.add(n)
        lo, hi = PRICES.get(n, (None, None))
        tr, en = NAMES[n]
        staff = staff_of.get(norm(n), [])
        price = "null" if lo is None else (f"{{ min: {lo}, max: {hi} }}" if hi else f"{{ min: {lo} }}")
        sig = ", signature: true" if n in SIGNATURE else ""
        lines.append(
            f"      {{ id: '{sid}', tr: {json.dumps(tr, ensure_ascii=False)}, en: {json.dumps(en, ensure_ascii=False)}, "
            f"price: {price}, staff: [{', '.join(repr(p) for p in staff)}]{sig} }},"
        )
    lines.append("    ],\n  },")

missing = set(name_to_id) - used
assert not missing, f"unmapped services: {missing}"

header = '''/**
 * The full menu, exactly as the salon publishes it on Kolay Randevu
 * (kolayrandevu.com/isletme/emrahair, read 2026-11-04). Generated by
 * scripts/gen-services.py — edit prices there or here, not in components.
 *
 *   id     Kolay Randevu's own service key. It is what the booking link
 *          carries (hizmetler[]=<id>), so it must never be retyped by hand.
 *   price  TL, as published. A range means "depends on length and density";
 *          the salon confirms the final price at the chair.
 *   staff  who performs it, from each person's Kolay Randevu page.
 */

export type StaffKey = 'emrah' | 'serdar' | 'merve' | 'zeynep' | 'gizem';

export type Service = {
  id: string;
  tr: string;
  en: string;
  /** null: the salon publishes no price for it; quoted at the chair. */
  price: { min: number; max?: number } | null;
  staff: StaffKey[];
  signature?: boolean;
};

export type ServiceGroupKey = 'color' | 'cut' | 'care' | 'nails' | 'brows' | 'wax';

export type ServiceGroup = { key: ServiceGroupKey; items: Service[] };

export const SERVICE_GROUPS: ServiceGroup[] = [
'''
footer = '''];

export const ALL_SERVICES: Service[] = SERVICE_GROUPS.flatMap((g) => g.items);

export const serviceById = new Map(ALL_SERVICES.map((s) => [s.id, s]));

/** The lowest published price in a group, for the "from" line on a card. */
export const fromPrice = (key: ServiceGroupKey) =>
  Math.min(...(SERVICE_GROUPS.find((g) => g.key === key)?.items ?? []).flatMap((s) => (s.price ? [s.price.min] : [])));
'''
open(out_ts, "w", encoding="utf-8", newline="\n").write(header + "\n".join(lines) + "\n" + footer)
print("services:", len(used), "groups:", len(GROUPS))
