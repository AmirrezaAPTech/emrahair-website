import styles from './Wordmark.module.css';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  sub?: string;
  stacked?: boolean;
  className?: string;
}

/**
 * The salon has no logo file, so the mark is the name alone, tracked out in
 * the grotesque, with its subline. Swap in the real logo if one is supplied.
 */
export function Wordmark({ size = 'sm', sub, stacked = false, className }: Props) {
  return (
    <span className={[styles.wordmark, styles[size], stacked && styles.stacked, className].filter(Boolean).join(' ')}>
      <span className={styles.type}>
        <span className={styles.name}>Emrahair</span>
        {sub ? <span className={styles.sub}>{sub}</span> : null}
      </span>
    </span>
  );
}
