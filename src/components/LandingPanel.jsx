import { useAstraStore } from '../store/useAstraStore';
import styles from './LandingPanel.module.css';

const MISSIONS = [
  {
    id: 'exoplanet',
    icon: '◉',
    title: 'EXOPLANET ANALYSIS',
    desc: 'Detect planetary transits via light-curve signal processing with real algorithm-based dip detection.',
    accent: '#00aaff',
  },
  {
    id: 'network',
    icon: '◈',
    title: 'COMM NETWORK',
    desc: "Dijkstra's shortest-path routing with live asteroid disruption simulation and automatic rerouting.",
    accent: '#00ffcc',
  },
  {
    id: 'soundscapes',
    icon: '◎',
    title: 'COSMIC SOUNDSCAPES',
    desc: 'Nine Navarasas — procedural Web Audio synthesis with particle-reactive 3D visuals.',
    accent: '#ffcc00',
  },
];

export default function LandingPanel() {
  const setActiveSection = useAstraStore((s) => s.setActiveSection);

  return (
    <div className={styles.container}>
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map((p) => (
        <div key={p} className={styles.corner} data-pos={p} />
      ))}

      <div className={styles.content}>
        {/* Hero title block */}
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          DEEP SPACE SCIENTIFIC PROTOTYPE
          <span className={styles.eyebrowLine} />
        </div>

        <h1 className={styles.title}>ASTRA</h1>
        <p className={styles.subtitle}>BEYOND THE STARS</p>
        <p className={styles.tagline}>"One tiny dip. A whole new world."</p>

        <div className={styles.divider}>
          <span className={styles.dividerGem}>◆</span>
        </div>

        <p className={styles.description}>
          An immersive real-time 3D space experience combining scientifically-grounded
          exoplanet transit detection, asteroid-disruption communication rerouting,
          and nine procedural cosmic soundscapes — fully interactive, fully simulated.
        </p>

        {/* Mission cards */}
        <div className={styles.missionGrid}>
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              className={styles.missionCard}
              style={{ '--accent': m.accent }}
              onClick={() => setActiveSection(m.id)}
            >
              <div className={styles.cardGlow} />
              <div className={styles.cardIcon} style={{ color: m.accent }}>
                {m.icon}
              </div>
              <div className={styles.cardTitle}>{m.title}</div>
              <div className={styles.cardDesc}>{m.desc}</div>
              <div className={styles.cardArrow} style={{ color: m.accent }}>→</div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          className={styles.enterBtn}
          onClick={() => setActiveSection('exoplanet')}
        >
          <span>ENTER MISSION</span>
          <span className={styles.enterArrow}>▶</span>
        </button>

        <p className={styles.hint}>
          Drag to explore the 3D space environment · Scroll to zoom
        </p>
      </div>
    </div>
  );
}
