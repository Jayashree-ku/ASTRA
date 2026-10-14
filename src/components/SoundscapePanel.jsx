import { useState, useEffect, useCallback } from 'react';
import { useAstraStore } from '../store/useAstraStore';
import { EMOTION_CONFIG, playEmotion, stopAudio, setMuted } from '../utils/audioEngine';
import styles from './SoundscapePanel.module.css';

const EMOTIONS = Object.keys(EMOTION_CONFIG);

const RASA_DESC = {
  Shringara: 'The rasa of love, beauty and aesthetic delight. Warm harmonics and gentle pulses evoke the tender depths of cosmic romance.',
  Hasya:     'The rasa of joy and laughter. Bright ascending tones and playful overtones mirror the levity of distant nebulae.',
  Karuna:    'The rasa of sorrow and compassion. Minor drones and descending lines reflect the weight of stellar collapse.',
  Raudra:    'The rasa of fury and wrath. Dissonant intervals and heavy noise capture the violence of a supernova.',
  Veera:     'The rasa of heroism and valor. Powerful fifths and a steady march evoke the courage of space exploration.',
  Bhayanaka: 'The rasa of terror and fear. Unstable tremolo and eerie intervals reflect the terror of the void.',
  Bibhatsa:  'The rasa of disgust and revulsion. Clustered, harsh frequencies mirror the uncanny and disturbing.',
  Adbhuta:   'The rasa of wonder and amazement. High harmonics and bright shimmer capture the sublime of deep space.',
  Shanta:    'The rasa of peace and serenity. Pure tones at 136.1 Hz (the OM frequency) settle the mind into stillness.',
};

export default function SoundscapePanel() {
  const { activeEmotion, setActiveEmotion, isMuted, toggleMute } = useAstraStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelect = useCallback((name) => {
    setActiveEmotion(name);
    setIsPlaying(true);
    playEmotion(name, isMuted);
  }, [setActiveEmotion, isMuted]);

  const handleStop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
  }, []);

  const handleMute = useCallback(() => {
    toggleMute();
    setMuted(!isMuted);
  }, [toggleMute, isMuted]);

  // Resume / re-mute when mute changes while playing
  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  const current = activeEmotion ? EMOTION_CONFIG[activeEmotion] : null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>NINE COSMIC EMOTIONS — NAVARASAS</h2>
        <p className={styles.subtitle}>
          Procedural soundscapes generated via Web Audio API synthesis.
          No audio samples. No AI music model.
        </p>
      </div>

      {/* Now playing banner */}
      {current && isPlaying && (
        <div className={styles.nowPlaying} style={{ borderColor: current.color, color: current.color }}>
          <span className={styles.playDot} style={{ background: current.color }} />
          NOW PLAYING: {current.label}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={handleStop}
          disabled={!isPlaying}
        >
          STOP
        </button>
        <button
          className={`${styles.btn} ${isMuted ? styles.btnMuted : ''}`}
          onClick={handleMute}
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
      </div>

      {/* Rasa grid */}
      <div className={styles.rasaGrid}>
        {EMOTIONS.map((name) => {
          const cfg = EMOTION_CONFIG[name];
          const isActive = activeEmotion === name && isPlaying;
          return (
            <button
              key={name}
              className={`${styles.rasaCard} ${isActive ? styles.rasaActive : ''}`}
              style={isActive ? { borderColor: cfg.color, boxShadow: `0 0 24px ${cfg.color}44` } : {}}
              onClick={() => handleSelect(name)}
            >
              <div className={styles.rasaOrb} style={{ background: `radial-gradient(circle, ${cfg.color}88, transparent 70%)` }} />
              <div className={styles.rasaName}>{name}</div>
              <div className={styles.rasaLabel}>{cfg.label.split('—')[1]?.trim()}</div>
              {isActive && (
                <div className={styles.activeIndicator}>
                  <span /><span /><span />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Description */}
      {activeEmotion && (
        <div
          className={styles.description}
          style={{ borderColor: current?.color + '55' }}
        >
          <div className={styles.descTitle} style={{ color: current?.color }}>
            {activeEmotion}
          </div>
          <p className={styles.descText}>{RASA_DESC[activeEmotion]}</p>
        </div>
      )}

      <p className={styles.footNote}>
        Each soundscape is synthesized in real-time using oscillators, LFOs, noise generators and filters.
        Particle colors in the 3D scene shift to reflect the active emotion.
      </p>
    </div>
  );
}
