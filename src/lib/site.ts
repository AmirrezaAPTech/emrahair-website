/**
 * Facts, not prose. Anything a translator would touch lives in
 * src/i18n/messages/*.json; what is here is the same in both languages.
 *
 * Sources, read 2026-11-04:
 *   KR  kolayrandevu.com/isletme/emrahair — the salon's own booking page
 *   G   the Google Business Profile (via the lead record)
 *   IG  instagram.com/emrahair
 */

/**
 * The public origin every canonical, hreflang, sitemap and JSON-LD URL is
 * built on. A canonical that points at a domain the site is not served from
 * tells Google to index nothing, so it is never hard-coded:
 *   NEXT_PUBLIC_SITE_URL           set it when the salon's own domain goes live
 *   VERCEL_PROJECT_PRODUCTION_URL  Vercel's production host (emrahair-website.vercel.app)
 *   localhost                      next dev
 */
const origin = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '');

export const site = {
  name: 'EMRAHAIR',
  legalName: 'Emrahair',
  url: origin,
} as const;

export const founder = {
  name: 'Emrah Çabkur',
  /** IG bio: "🇮🇹 Echosline Türkiye Ambassador". */
  title: 'Echosline Türkiye Ambassador',
} as const;

export const contact = {
  /* KR and G agree on the building; G writes the unit 21/19, KR 19/21. */
  street: 'Kemal Sunal Cd., Galeria Çarşı No: 19/21',
  district: 'Bahçeşehir 1. Kısım Mah.',
  postal: '34488',
  city: 'Başakşehir / İstanbul',
  /* KR lists the landline, G the mobile. Both are shown: the landline for
     calls, the mobile for WhatsApp, which is how Turkish salons are reached. */
  phone: '(0212) 909 15 69',
  phoneHref: 'tel:+902129091569',
  mobile: '0546 604 51 52',
  mobileHref: 'tel:+905466045152',
  whatsapp: 'https://wa.me/905466045152',
  instagram: 'https://www.instagram.com/emrahair/',
  instagramHandle: '@emrahair',
  mapsUrl: 'https://maps.google.com/?cid=10075626301315739900',
  mapsEmbed: 'https://www.google.com/maps?q=41.0636573,28.6895602&z=16&output=embed',
  geo: { lat: 41.0636573, lng: 28.6895602 },
} as const;

/**
 * Opening hours as Kolay Randevu publishes them, because that calendar is
 * what a guest can actually book against.
 *
 * TO CONFIRM WITH THE SALON: Google lists every day 08:00–20:00, Tuesday
 * included. KR says Tuesday is closed and the other days run 09:00–19:00.
 */
export const hours = [
  { day: 'mon', open: '09:00', close: '19:00' },
  { day: 'tue', open: null, close: null },
  { day: 'wed', open: '09:00', close: '19:00' },
  { day: 'thu', open: '09:00', close: '19:00' },
  { day: 'fri', open: '09:00', close: '19:00' },
  { day: 'sat', open: '09:00', close: '19:00' },
  { day: 'sun', open: '10:00', close: '19:00' },
] as const;

/**
 * Booking hands over to Kolay Randevu.
 *
 * What the site can carry, measured against randevu3.php on 2026-11-04:
 *   hizmetler[]  one per selected service, by KR service id — supported,
 *                several at once
 *   sube         the branch id — required
 * What it cannot: the staff member. KR builds the "Personel Seçimi"
 * dropdowns in page script and reads no URL parameter for them (tried
 * <id>-personel, personel, personel_id, calisan), and the staff pages'
 * own "Randevu Al" buttons only link back to the salon page. So the site
 * shows who performs each service, and the guest picks Emrah, Serdar or
 * "Fark Etmez" on the next screen, together with the date and time.
 */
export const booking = {
  branch: '137954',
  salonPage: 'https://www.kolayrandevu.com/isletme/emrahair',
  base: 'https://www.kolayrandevu.com/randevu3.php',
} as const;

export function bookingUrl(serviceIds: readonly string[]): string {
  if (!serviceIds.length) return booking.salonPage;
  const q = serviceIds.map((id) => `hizmetler%5B%5D=${encodeURIComponent(id)}`).join('&');
  return `${booking.base}?${q}&sube=${booking.branch}`;
}

/**
 * The team, in the order the salon lists them on KR. `krId` is the value
 * KR's staff dropdown uses (null where KR offers no dropdown for that person).
 * No portraits were supplied, so cards render a monogram plate — a designed
 * state, not a hole.
 */
export const team = [
  /* krLabel is the exact text KR's "Personel Seçimi" dropdown shows, so the
     hand-off can tell the guest precisely which option to pick. */
  { key: 'emrah', name: 'Emrah Çabkur', krLabel: 'Emrah ÇABKUR', krId: '195270', bookable: true },
  { key: 'serdar', name: 'Serdar Sezer', krLabel: 'Serdar Sezer', krId: '355488', bookable: true },
  { key: 'merve', name: 'Merve Aydemir', krLabel: 'Merve Aydemir', krId: '344632', bookable: false },
  { key: 'zeynep', name: 'Zeynep Aydemir', krLabel: 'zeynep aydemir', krId: '332861', bookable: false },
  { key: 'gizem', name: 'Gizem Değişener', krLabel: 'Gizem DEĞİŞENER', krId: null, bookable: false },
] as const;

/** Ratings as published. Quotes are verbatim; KR masks surnames itself. */
export const ratings = {
  kolayRandevu: { score: 4.9, count: 297, reviews: 74, url: 'https://www.kolayrandevu.com/isletme/emrahair' },
  google: { score: 4.8, count: 43, url: 'https://maps.google.com/?cid=10075626301315739900' },
  instagramFollowers: '6.6K',
} as const;

export const reviews = [
  { source: 'Google', name: 'Edanur Ünal', quote: 'Hayatımda gördüğüm en yumuşak en parlak işlemli saçlar, bu kadar açık rengi hiç yıpratmadan yapan işinin ehli bir kuaför.' },
  { source: 'Kolay Randevu', name: 'ayt…u', quote: 'Verdiği bilgilendirmeler, kullandığı ürünler ve titizliğiyle güven veren Emrah Bey’e çok teşekkür ederim. Saçlarımla kusursuz ve memnuniyetle ayrıldım.' },
  { source: 'Google', name: 'Nagihan Erat', quote: 'Şahane saçım ve pamuk gibi el ve ayaklarımla tertemiz hissederek salondan ayrıldım. Emrah Bey’e ve manikür pedikürümü yapan Gizem Hanım’a teşekkür ediyorum.' },
  { source: 'Kolay Randevu', name: 'bah…o', quote: 'Nereye giderse gitsin verilen hizmet, değer, saygı… hepsi için peşinden gitmeye değer. İyi ki Emrahair var.' },
  { source: 'Google', name: 'Sultan Hasret', quote: 'Kızımın dalgalı, kabaran saçlarını onun istediği gibi kesebilen ve kullanma tavsiyesi verebilen tek kuaför oldu. Kesim için adresimiz burası.' },
  { source: 'Kolay Randevu', name: 'bir…ş', quote: 'Emrah Bey ve ekibinden aldığım hizmetten çok memnun kaldım, özellikle Merve Hanım’ın ilgi ve alakası için tekrar teşekkür ederim.' },
  { source: 'Google', name: 'Seda Semerci', quote: 'İlk defa gittim. İçerisi gayet temiz ve havadar. İlgili ve güler yüzlüydüler. Saç kesimi için gitmiştim, memnun kaldım.' },
  { source: 'Kolay Randevu', name: 'ker…m', quote: 'Gizem Hanım’a harika manikür ve pedikür hizmeti için çok teşekkür ederim. Gerçekten çok özenli, temiz ve titiz.' },
  { source: 'Kolay Randevu', name: 'ayn…z', quote: 'Her zaman temiz, hijyenik ve bol sohbetli bir ortam.' },
  { source: 'Kolay Randevu', name: 'mer…r', quote: 'Gizem Hanım yine müthiş iş çıkarttı, salondaki herkesin güler yüzlülüğü muhteşem.' },
  { source: 'Kolay Randevu', name: 'emi…ı', quote: 'Her zamanki gibi çok memnun çıkıyorum Emrahair’den.' },
  { source: 'Kolay Randevu', name: 'öyk…n', quote: 'Her zaman olduğu gibi şahane.' },
] as const;

/** Section ids for the nav and anchor links. */
export const SECTIONS = ['philosophy', 'services', 'work', 'atelier', 'reviews', 'contact'] as const;
export type SectionId = (typeof SECTIONS)[number];

export const TIME_ZONE = 'Europe/Istanbul';

export const formatTL = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 }).format(n);

export function priceLabel(
  price: { min: number; max?: number } | null,
  locale: string,
  onRequest: string,
): string {
  if (!price) return onRequest;
  const lo = formatTL(price.min, locale);
  return price.max ? `${lo} – ${formatTL(price.max, locale)} ₺` : `${lo} ₺`;
}
