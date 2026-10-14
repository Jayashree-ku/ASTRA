import { create } from 'zustand';

export const useAstraStore = create((set, get) => ({
  // Navigation
  activeSection: 'landing', // 'landing' | 'exoplanet' | 'network' | 'soundscapes'
  setActiveSection: (section) => set({ activeSection: section }),

  // Emotion / Soundscape
  activeEmotion: null,
  setActiveEmotion: (emotion) => set({ activeEmotion: emotion }),
  isMuted: false,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  // Device Showcase & Preview
  deviceMode: 'responsive', // 'responsive' | 'android_mockup'
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  toggleDeviceMode: () => set((s) => ({ deviceMode: s.deviceMode === 'responsive' ? 'android_mockup' : 'responsive' })),
  showGalleryModal: false,
  setShowGalleryModal: (val) => set({ showGalleryModal: val }),

  // Exoplanet analysis state
  lightCurveData: null,
  detectedDips: [],
  analysisRunning: false,
  analysisComplete: false,
  setLightCurveData: (data) => set({ lightCurveData: data }),
  setDetectedDips: (dips) => set({ detectedDips: dips }),
  setAnalysisRunning: (v) => set({ analysisRunning: v }),
  setAnalysisComplete: (v) => set({ analysisComplete: v }),

  // Network / Dijkstra state
  networkNodes: [],
  networkLinks: [],
  currentRoute: [],
  disruptedLinks: [],
  asteroidActive: false,
  dataQueued: false,
  setNetworkNodes: (nodes) => set({ networkNodes: nodes }),
  setNetworkLinks: (linksOrUpdater) => set((state) => ({
    networkLinks: typeof linksOrUpdater === 'function'
      ? linksOrUpdater(state.networkLinks)
      : linksOrUpdater,
  })),
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setDisruptedLinks: (links) => set({ disruptedLinks: links }),
  setAsteroidActive: (v) => set({ asteroidActive: v }),
  setDataQueued: (v) => set({ dataQueued: v }),

  resetNetwork: () => set({
    disruptedLinks: [],
    currentRoute: [],
    asteroidActive: false,
    dataQueued: false,
  }),
}));
