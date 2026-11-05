import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import type { Post } from '@/lib/journal';
import { postHref, readingMinutes } from '@/lib/journal';
import { HEROES, POST_HERO } from '@/lib/heroes';
import { plain } from './RichText';
import styles from './Journal.module.css';

export function PostCard({
  post,
  locale,
  readingLabel,
  onRequest,
  headingLevel = 'h2',
}: {
  post: Post;
  locale: string;
  readingLabel: (minutes: number) => string;
  onRequest: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const hero = HEROES[post.hero ?? POST_HERO[post.key] ?? ''];
  const Heading = headingLevel;
  const date = new Date(`${post.publishedAt}T12:00:00Z`).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <article className={styles.card}>
      {hero && (
        <span className={`media ${styles.cardMedia}`} data-reveal-media>
          <Image src={hero} alt="" sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" quality={68} />
        </span>
      )}
      <span className={styles.cardMeta}>
        <time dateTime={post.publishedAt}>{date}</time> · {readingLabel(readingMinutes(post))}
      </span>
      <Heading className={`display display--s ${styles.cardTitle}`}>
        <Link className={styles.cardLink} href={postHref(post.slug)}>
          {post.title}
        </Link>
      </Heading>
      <p className={styles.cardSummary}>{plain(post.lede, locale, onRequest)}</p>
    </article>
  );
}
