import styles from './TransitAnimation.module.css';

/**
 * TransitAnimation — Shows a planet crossing in front of its star.
 * progress: 0 (planet at left) → 1 (planet at right).
 */
export default function TransitAnimation({ progress = 0 }) {
  // Planet x goes from -20% to 120% of container
  const pct = -10 + progress * 130;

  // Star brightness dims during transit (planet center = 0.5)
  const inTransit = progress > 0.3 && progress < 0.7;
  const brightness = inTransit ? 0.75 + 0.25 * Math.abs((progress - 0.5) / 0.2) : 1;

  return (
    <div className={styles.container}>
      <div className={styles.label}>TRANSIT IN PROGRESS — Planetary Crossing Detected</div>
      <div className={styles.scene}>
        {/* Star */}
        <div
          className={styles.star}
          style={{ filter: `brightness(${brightness}) blur(${inTransit ? 1 : 0}px)` }}
        />
        {/* Planet */}
        <div
          className={styles.planet}
          style={{ left: `${pct}%` }}
        />
        {/* Flux bar */}
        <div className={styles.fluxBar}>
          <div
            className={styles.fluxFill}
            style={{ width: `${brightness * 100}%` }}
          />
        </div>
        <div className={styles.fluxLabel}>STELLAR FLUX: {(brightness * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}
