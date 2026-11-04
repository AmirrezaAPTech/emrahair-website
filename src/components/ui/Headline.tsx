import type { ElementType } from 'react';

interface Props {
  /**
   * Lines exactly as the translator broke them. Line breaks are editorial, so
   * they belong in the message catalogue rather than to `text-wrap: balance`:
   * German and Russian do not break where English does.
   */
  lines: readonly string[];
  /** The one word that carries the meaning, appended to the final line. */
  accent?: string;
  as?: ElementType;
  size?: 'hero' | 'xl' | 'l' | 'm' | 's';
  id?: string;
  className?: string;
}

/**
 * Every headline on the site. Each line gets its own mask so the type can rise
 * through a fixed window rather than fade in, which is what makes it read as
 * printed rather than animated.
 */
export function Headline({
  lines,
  accent,
  as: Tag = 'h2',
  size = 'xl',
  id,
  className,
}: Props) {
  const visible = lines.filter((line, i) => line !== '' || i === lines.length - 1);

  return (
    <Tag
      id={id}
      className={['display', `display--${size}`, 'display--masked', className]
        .filter(Boolean)
        .join(' ')}
    >
      {visible.map((line, i) => {
        const isLast = i === visible.length - 1;
        return (
          <span className="display__line" key={i} data-reveal-line>
            <span>
              {line}
              {isLast && accent ? <em>{accent}</em> : null}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
