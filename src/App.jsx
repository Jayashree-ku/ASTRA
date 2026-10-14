import { useAstraStore } from './store/useAstraStore';
import BaseSpaceScene from './scenes/BaseSpaceScene';
import HUD from './components/HUD';
import LandingPanel from './components/LandingPanel';
import ExoplanetPanel from './components/ExoplanetPanel';
import NetworkPanel from './components/NetworkPanel';
import SoundscapePanel from './components/SoundscapePanel';
import ShowcaseModal from './components/ShowcaseModal';
import AndroidMockupFrame from './components/AndroidMockupFrame';
import './App.css';

function PanelOverlay() {
  const activeSection = useAstraStore((s) => s.activeSection);

  return (
    <div className="panel-overlay">
      {activeSection === 'landing'     && <LandingPanel />}
      {activeSection === 'exoplanet'   && <ExoplanetPanel />}
      {activeSection === 'network'     && <NetworkPanel />}
      {activeSection === 'soundscapes' && <SoundscapePanel />}
    </div>
  );
}

function MainExperience() {
  return (
    <div className="app-root">
      {/* Persistent 3D deep-space canvas */}
      <BaseSpaceScene />

      {/* HUD navigation */}
      <HUD />

      {/* Section-specific 2D overlay panels */}
      <PanelOverlay />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AndroidMockupFrame>
        <MainExperience />
      </AndroidMockupFrame>

      {/* Showcase Modal containing real Web & Android pictures */}
      <ShowcaseModal />
    </>
  );
}
