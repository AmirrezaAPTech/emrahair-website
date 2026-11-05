'use client';

import { useState } from 'react';

import styles from './MapEmbed.module.css';

/**
 * Google Maps only after a click: the iframe sets Google cookies and costs
 * about a megabyte, neither of which a visitor should pay just for opening
 * the contact page.
 */
export function MapEmbed({ src, title, load, note }: { src: string; title: string; load: string; note: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className={styles.map}>
      {on ? (
        <iframe
          className={styles.frame}
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className={styles.placeholder}>
          <button className="btn" type="button" onClick={() => setOn(true)}>
            {load}
          </button>
          <p className={styles.note}>{note}</p>
        </div>
      )}
    </div>
  );
}
