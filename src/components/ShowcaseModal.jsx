import { useState } from 'react';
import { useAstraStore } from '../store/useAstraStore';
import styles from './ShowcaseModal.module.css';

const SHOWCASE_ITEMS = [
  {
    id: 'landing',
    title: 'Mission Hub & 3D Celestial Environment',
    tagline: '“One tiny dip. A whole new world.”',
    description:
      'Genuinely immersive 3D space scene featuring a glowing star with animated corona rings, rotating exoplanets with atmospheric scattering, and procedural orbital paths.',
    webImg: '/screenshots/01_web_landing.png',
    androidImg: '/screenshots/06_android_landing.png',
    badges: ['Three.js + R3F', 'GLSL Coronas', 'OrbitControls', 'Touch & Tilt'],
  },
  {
    id: 'exoplanet',
    title: 'Exoplanet Transit Detection & Signal Processing',
    tagline: 'Light-curve generation, MAD noise estimation & box-scan dip detection',
    description:
      'Generates simulated photometry datasets, animates a planet crossing the stellar disc, identifies transit dips using robust MAD noise thresholds, tests periodicity, and grades candidates.',
    webImg: '/screenshots/02_web_exoplanet_detected.png',
    androidImg: '/screenshots/07_android_exoplanet_detected.png',
    badges: ['Sliding Window Dip Scan', 'MAD σ = 1.4826', 'Transit Animation', 'CSV Upload Supported'],
  },
  {
    id: 'network',
    title: 'Asteroid Disruption Comm Network & Dijkstra Rerouting',
    tagline: 'Scratch-implemented shortest-path calculation under active failure',
    description:
      'Interactive 3D network with Earth Command, 3 relay satellites, and Hubble-X. When an asteroid destroys the primary link, Dijkstra computes the optimal detour route in real time.',
    webImg: '/screenshots/04_web_network_rerouted.png',
    androidImg: '/screenshots/08_android_network_rerouted.png',
    badges: ['Dijkstra from Scratch', 'Dynamic Adjacency Graph', 'Asteroid 3D Trajectory', 'Queued Data Handling'],
  },
  {
    id: 'soundscapes',
    title: 'Nine Cosmic Emotions (Navarasas)',
    tagline: 'Procedural Web Audio API soundscapes with emotion-reactive 3D particles',
    description:
      'Generates original ambient textures, drones, harmonies, and pulses for Shringara, Hasya, Karuna, Raudra, Veera, Bhayanaka, Bibhatsa, Adbhuta, and Shanta. 3D particles shift color in sync.',
    webImg: '/screenshots/05_web_soundscapes.png',
    androidImg: '/screenshots/09_android_soundscapes.png',
    badges: ['Zero Pretrained Models', 'Web Audio API', 'Oscillator Synthesis', '3D Color Sync'],
  },
];

export default function ShowcaseModal() {
  const show = useAstraStore((s) => s.showGalleryModal);
  const setShow = useAstraStore((s) => s.setShowGalleryModal);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'web' | 'android'
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!show) return null;

  const current = SHOWCASE_ITEMS[selectedIdx];

  return (
    <div className={styles.overlay} onClick={() => setShow(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>FUNCTIONALITY SHOWCASE & PROOF</div>
            <h2 className={styles.title}>ASTRA — WEB & ANDROID WORKING SHOWCASE</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setShow(false)}>✕</button>
        </div>

        {/* Feature Selector Tabs */}
        <div className={styles.featureTabs}>
          {SHOWCASE_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              className={`${styles.tabBtn} ${selectedIdx === idx ? styles.activeTab : ''}`}
              onClick={() => setSelectedIdx(idx)}
            >
              <span className={styles.tabNum}>0{idx + 1}</span>
              <span className={styles.tabLabel}>{item.title.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className={styles.viewModeBar}>
          <div className={styles.viewModeGroup}>
            <span className={styles.viewModeLabel}>VIEW MODE:</span>
            <button
              className={`${styles.modeBtn} ${activeTab === 'split' ? styles.activeMode : ''}`}
              onClick={() => setActiveTab('split')}
            >
              ⚖️ Side-by-Side Dual View
            </button>
            <button
              className={`${styles.modeBtn} ${activeTab === 'web' ? styles.activeMode : ''}`}
              onClick={() => setActiveTab('web')}
            >
              💻 Desktop Web (1920×1080)
            </button>
            <button
              className={`${styles.modeBtn} ${activeTab === 'android' ? styles.activeMode : ''}`}
              onClick={() => setActiveTab('android')}
            >
              📱 Android Mobile (412×915)
            </button>
          </div>
        </div>

        {/* Gallery Content Area */}
        <div className={styles.galleryBody}>
          <div className={styles.featureMeta}>
            <h3 className={styles.featureTitle}>{current.title}</h3>
            <p className={styles.featureTagline}>{current.tagline}</p>
            <p className={styles.featureDesc}>{current.description}</p>
            <div className={styles.badgeRow}>
              {current.badges.map((b) => (
                <span key={b} className={styles.badge}>{b}</span>
              ))}
            </div>
          </div>

          {/* Picture Comparison Grid */}
          <div className={`${styles.imageGrid} ${styles[activeTab]}`}>
            {(activeTab === 'split' || activeTab === 'web') && (
              <div className={styles.imageCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDevice}>DESKTOP WEB VIEW</span>
                  <span className={styles.cardRes}>1920 × 1080 · Chrome / Edge</span>
                </div>
                <div className={styles.imageFrame}>
                  <img src={current.webImg} alt={`${current.title} on Web`} />
                </div>
                <div className={styles.cardCaption}>Live desktop rendering with full mouse camera navigation</div>
              </div>
            )}

            {(activeTab === 'split' || activeTab === 'android') && (
              <div className={`${styles.imageCard} ${styles.androidCard}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDevice}>ANDROID MOBILE VIEW</span>
                  <span className={styles.cardRes}>412 × 915 · Touch & PWA Standalone</span>
                </div>
                <div className={styles.imageFrame}>
                  <img src={current.androidImg} alt={`${current.title} on Android`} />
                </div>
                <div className={styles.cardCaption}>Responsive touch-optimized layout with safe-area notch support</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span>🌐 Web URL: <code>http://localhost:5173/</code></span>
            <span>📱 Android Mobile Wi-Fi URL: <code>http://10.174.194.230:5173/</code></span>
          </div>
          <button className={styles.doneBtn} onClick={() => setShow(false)}>
            RETURN TO MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
