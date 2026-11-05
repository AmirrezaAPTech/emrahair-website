import { contact, hours, founder, ratings } from '@/lib/site';
import { SERVICE_PAGES, pageFrom } from '@/lib/service-pages';
import { urlOf } from '@/lib/seo';
import { formatTL } from '@/lib/site';
import trPages from '@/i18n/pages/tr/balyaj.json';

/**
 * llms.txt: a plain summary for AI assistants, in Turkish (the salon's
 * language) with the English pages linked. Facts only, from the same sources
 * as the site, so an assistant quoting it quotes the salon.
 */
export const dynamic = 'force-static';

const DAY: Record<string, string> = { mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum', sat: 'Cmt', sun: 'Paz' };

export async function GET() {
  const cards = await Promise.all(
    SERVICE_PAGES.map(async (p) => {
      const tr = (await import(`@/i18n/pages/tr/${p.key}.json`)).default as typeof trPages;
      const en = (await import(`@/i18n/pages/en/${p.key}.json`)).default as typeof trPages;
      return `- [${tr.card.title}](${urlOf(p.route, 'tr')}): ${tr.card.summary} ${formatTL(pageFrom(p), 'tr')} ₺’den başlayan fiyatlar. English: [${en.card.title}](${urlOf(p.route, 'en')})`;
    }),
  );

  const body = `# Emrahair — Bahçeşehir Kuaför

> Bahçeşehir 1. Kısım’da (Başakşehir, İstanbul) bayan kuaförü. Kurucu ${founder.name}, ${founder.title}. Air Touch balyaj, saç boyama, saç kesimi, keratin bakım, gelin saçı, manikür-pedikür, kaş ve ağda. Online randevu Kolay Randevu üzerinden.

- Adres: ${contact.district}, ${contact.street}, ${contact.postal} ${contact.city}
- Telefon: ${contact.phone} · WhatsApp: ${contact.mobile}
- Çalışma saatleri: ${hours.map((h) => `${DAY[h.day]} ${h.open ? `${h.open}–${h.close}` : 'kapalı'}`).join(', ')}
- Değerlendirmeler: Kolay Randevu ${ratings.kolayRandevu.score} (${ratings.kolayRandevu.count}), Google ${ratings.google.score} (${ratings.google.count})
- Instagram: ${contact.instagram}
- Randevu: ${ratings.kolayRandevu.url}

## Hizmetler

${cards.join('\n')}

## Sayfalar

- [Fiyat listesi 2026](${urlOf('/hizmetler', 'tr')}) · [Price list](${urlOf('/hizmetler', 'en')})
- [Emrah Çabkur](${urlOf('/emrah-cabkur', 'tr')})
- [İletişim ve yol tarifi](${urlOf('/iletisim', 'tr')}) · [Contact](${urlOf('/iletisim', 'en')})
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
