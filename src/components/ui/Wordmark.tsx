import styles from './Wordmark.module.css';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  sub?: string;
  stacked?: boolean;
  className?: string;
}

/**
 * The salon has no logo file, so the mark is typographic: a Bodoni italic "e"
 * in a hairline ring (the crest's job), then the name tracked out in the
 * grotesque. Replace the ring with the real logo if the salon supplies one.
 */
export function Wordmark({ size = 'sm', sub, stacked = false, className }: Props) {
  return (
    <span className={[styles.wordmark, styles[size], stacked && styles.stacked, className].filter(Boolean).join(' ')}>
      <span className={styles.crest} aria-hidden="true">
        <span className={styles.crestLetter}>e</span>
      </span>
      <span className={styles.type}>
        <span className={styles.name}>Emrahair</span>
        {sub ? <span className={styles.sub}>{sub}</span> : null}
      </span>
    </span>
  );
}
