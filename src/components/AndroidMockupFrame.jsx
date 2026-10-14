import { useState, useEffect } from 'react';
import { useAstraStore } from '../store/useAstraStore';
import styles from './AndroidMockupFrame.module.css';

export default function AndroidMockupFrame({ children }) {
  const deviceMode = useAstraStore((s) => s.deviceMode);
  const toggleDeviceMode = useAstraStore((s) => s.toggleDeviceMode);
  const setShowGalleryModal = useAstraStore((s) => s.setShowGalleryModal);
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (deviceMode !== 'android_mockup') {
    return children;
  }

  return (
    <div className={styles.mockupWrapper}>
      {/* Top Banner with Device Controls */}
      <div className={styles.topControlBanner}>
        <div className={styles.bannerTitle}>
          <span className={styles.pulseDot} />
          <span>ANDROID SIMULATOR MODE · PIXEL 7 PRO (412 × 915)</span>
        </div>
        <div className={styles.bannerActions}>
          <button className={styles.bannerBtn} onClick={() => setShowGalleryModal(true)}>
            📷 View Proof Pictures
          </button>
          <button className={styles.bannerBtnActive} onClick={toggleDeviceMode}>
            💻 Exit to Full Desktop
          </button>
        </div>
      </div>

      {/* Android Device Body */}
      <div className={styles.phoneBody}>
        {/* Top Speaker Ear-piece */}
        <div className={styles.speaker} />

        {/* Camera Punch-hole */}
        <div className={styles.punchHole} />

        {/* Android Status Bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusTime}>{time}</div>
          <div className={styles.statusIcons}>
            <span className={styles.wifi}>📶 5G</span>
            <span className={styles.battery}>🔋 98%</span>
          </div>
        </div>

        {/* Screen Area (Children) */}
        <div className={styles.screen}>
          {children}
        </div>

        {/* Android Navigation Gesture Bar */}
        <div className={styles.navBar}>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}
