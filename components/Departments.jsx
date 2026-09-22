import { DEPARTMENTS } from '@/lib/departments';
import styles from './Departments.module.css';

const byId = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d]));

/*
 * Each row is a repeating "tile" traced from the design. Coordinates are design points,
 * relative to the tile origin (the left edge of the leftmost pill).
 * `seam` is the connector to the neighbouring tile so the chain stays continuous while it scrolls.
 */
const ROWS = {
  desktop: [
    {
      key: 'd',
      width: 1699.2,
      height: 200,
      pill: { w: 255.3, h: 62.4, y: 71.4 },
      pills: [
        { id: 'ent', x: 0 },
        { id: 'surgery', x: 283.2 },
        { id: 'urology', x: 566.4 },
        { id: 'neurology', x: 849.6 },
        { id: 'cardiology', x: 1132.8 },
        { id: 'orthopedics', x: 1416 },
      ],
      lines: [
        'M607.4 129.5C607.4 129.5 542 195.4 362 71.4C318 47.4 237 5.5 66 71.4',
        'M1571 71.4C1571 71.4 1439.1 11.5 1272 85.5',
        'M1160 123.5C1160 123.5 1001.7 199.4 890 123.5',
        'M869 86.4C869 86.4 852.4 45.2 768 46.3C738.7 48.5 694 46.5 608 113.5',
        'M27.2 123.5C27.2 123.5 -131.1 199.4 -242.8 123.5',
      ],
      dots: [
        [1571, 72.1],
        [1151.8, 125.1],
        [869.4, 88.3],
        [64.9, 72.1],
        [19, 125.1],
      ],
      dotR: 8.6,
      stroke: 1,
    },
  ],
  mobile: [
    {
      key: 'm1',
      width: 557.4,
      height: 140,
      pill: { w: 167.5, h: 40.9, y: 54.3 },
      pills: [
        { id: 'ent', x: 0 },
        { id: 'surgery', x: 185.8 },
        { id: 'urology', x: 371.6 },
      ],
      lines: [
        'M570.2 64.1C570.2 64.1 559.3 37.2 503.9 37.8C484.7 39.3 455.4 38 398.9 81.9',
        'M398.5 92.4C398.5 92.4 355.6 135.7 237.5 54.3C208.7 38.6 155.5 11.1 43.3 54.3',
        'M17.9 88.5C17.9 88.5 -85.9 138.3 -159.3 88.5',
      ],
      dots: [
        [570.45, 65.45],
        [42.65, 54.75],
        [438.65, 54.25],
      ],
      dotR: 5.65,
      stroke: 0.66,
    },
    {
      key: 'm2',
      width: 557.4,
      height: 140,
      pill: { w: 167.5, h: 40.9, y: 55.3 },
      pills: [
        { id: 'neurology', x: 0 },
        { id: 'cardiology', x: 185.8 },
        { id: 'orthopedics', x: 371.7 },
      ],
      lines: [
        'M473.3 55.3C473.3 55.3 386.8 16 277.2 64.5',
        'M203.7 89.5C203.7 89.5 99.8 139.3 26.5 89.5',
        'M101.6 55.3C101.6 55.3 15.1 16 -94.3 64.5',
      ],
      dots: [
        [473.35, 55.75],
        [198.35, 90.55],
        [13.05, 66.45],
      ],
      dotR: 5.65,
      stroke: 0.66,
    },
  ],
};

const COPIES = 6;
const rem = (v) => `${v / 10}rem`;

function Tile({ row, hidden }) {
  const { width, height, pill } = row;
  const viewBox = `0 0 ${width} ${height}`;
  return (
    <div className={styles.tile} style={{ width: rem(width), height: rem(height) }} aria-hidden={hidden || undefined}>
      <svg className={styles.layer} viewBox={viewBox} aria-hidden="true">
        {row.lines.map((d) => (
          <path key={d} d={d} fill="none" stroke="#1E3C95" strokeWidth={row.stroke} />
        ))}
      </svg>
      <ul className={styles.pills}>
        {row.pills.map((p) => {
          const dept = byId[p.id];
          return (
            <li
              key={p.id}
              className={`${styles.pill} ${styles[dept.color]}`}
              style={{ left: rem(p.x), top: rem(pill.y), width: rem(pill.w), height: rem(pill.h) }}
            >
              {dept.label}
            </li>
          );
        })}
      </ul>
      <svg className={styles.layer} viewBox={viewBox} aria-hidden="true">
        {row.dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={row.dotR} fill={`url(#dept-dot)`} />
        ))}
      </svg>
    </div>
  );
}

function Row({ row, className, reverse }) {
  return (
    <div className={`${styles.row} ${className}`}>
      <div
        className={`${styles.track} ${reverse ? styles.reverse : ''}`}
        style={{ '--tile': rem(row.width), '--origin-copies': 2 }}
      >
        {Array.from({ length: COPIES }, (_, i) => (
          <Tile key={i} row={row} hidden={i !== 2} />
        ))}
      </div>
    </div>
  );
}

export default function Departments() {
  return (
    <section className={styles.section} aria-labelledby="departments-title">
      <svg width="0" height="0" className={styles.defs} aria-hidden="true">
        <defs>
          <radialGradient id="dept-dot">
            <stop offset="3%" stopColor="#99EDE0" />
            <stop offset="97%" stopColor="#1A94B2" />
          </radialGradient>
        </defs>
      </svg>
      <div className={`frame ${styles.titleFrame}`}>
        <h2 id="departments-title" className={styles.title}>
          מחלקות בית החולים השונות <br className="br-mobile" />
          עומדות לשירותכם
        </h2>
      </div>
      <div className={styles.strip}>
        {ROWS.desktop.map((row) => (
          <Row key={row.key} row={row} className={styles.rowDesktop} />
        ))}
        {ROWS.mobile.map((row, i) => (
          <Row key={row.key} row={row} className={`${styles.rowMobile} ${styles[`rowMobile${i + 1}`]}`} reverse={i === 1} />
        ))}
      </div>
    </section>
  );
}
