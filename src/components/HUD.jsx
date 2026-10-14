import { useAstraStore } from '../store/useAstraStore';
import styles from './HUD.module.css';

const NAV_ITEMS = [
  { id: 'landing',     label: 'Mission Hub',          icon: '◈' },
  { id: 'exoplanet',   label: 'Exoplanet Analysis',   icon: '◉' },
  { id: 'network',     label: 'Comm Network',          icon: '◎' },
  { id: 'soundscapes', label: 'Cosmic Soundscapes',   icon: '◑' },
];

export default function HUD() {
  const activeSection       = useAstraStore((s) => s.activeSection);
  const setActiveSection    = useAstraStore((s) => s.setActiveSection);
  const deviceMode          = useAstraStore((s) => s.deviceMode);
  const toggleDeviceMode    = useAstraStore((s) => s.toggleDeviceMode);
  const setShowGalleryModal = useAstraStore((s) => s.setShowGalleryModal);

  return (
    <nav className={styles.hud}>
      <div className={styles.brand} onClick={() => setActiveSection('landing')}>
        <span className={styles.brandName}>ASTRA</span>
        <span className={styles.brandTag}>BEYOND THE STARS</span>
      </div>

      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.navBtn} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Action shortcuts & device mode */}
      <div className={styles.actions}>
        <button
          className={styles.galleryBtn}
          onClick={() => setShowGalleryModal(true)}
          title="View Web & Android functionality pictures"
        >
          <span className={styles.actionIcon}>📷</span>
          <span className={styles.actionLabel}>SHOWCASE PICTURES</span>
        </button>

        <button
          className={`${styles.deviceBtn} ${deviceMode === 'android_mockup' ? styles.deviceActive : ''}`}
          onClick={toggleDeviceMode}
          title="Toggle Android Device Frame Simulation"
        >
          <span className={styles.actionIcon}>{deviceMode === 'android_mockup' ? '💻' : '📱'}</span>
          <span className={styles.actionLabel}>
            {deviceMode === 'android_mockup' ? 'DESKTOP WEB' : 'ANDROID FRAME'}
          </span>
        </button>

        {/* Live status dot */}
        <div className={styles.statusBar}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>NOMINAL</span>
        </div>
      </div>
    </nav>
  );
}
