import { useState, useCallback, useEffect, useRef } from 'react';
import { useAstraStore } from '../store/useAstraStore';
import { INITIAL_NODES, INITIAL_LINKS, PRIMARY_STRIKE_LINK, SOURCE_NODE, TARGET_NODE } from '../utils/networkData';
import { buildAdjacency, dijkstra, pathToLinkIds } from '../utils/dijkstra';
import { playImpactFx, playChimeFx, playPingFx } from '../utils/audioEngine';
import Network3DView from './Network3DView';
import styles from './NetworkPanel.module.css';

const DISCLAIMER = 'SIMULATION — This is not real radio communication. Routing is computed by Dijkstra\'s algorithm on simulated data.';

export default function NetworkPanel() {
  const {
    networkNodes, setNetworkNodes,
    networkLinks, setNetworkLinks,
    currentRoute, setCurrentRoute,
    disruptedLinks, setDisruptedLinks,
    asteroidActive, setAsteroidActive,
    dataQueued, setDataQueued,
    resetNetwork,
  } = useAstraStore();

  const [log, setLog] = useState([]);
  const [routeLinkIds, setRouteLinkIds] = useState([]);
  const [routeCost, setRouteCost] = useState(null);
  const [asteroidProgress, setAsteroidProgress] = useState(0); // 0–1
  const asteroidAnimRef = useRef();

  const logIdRef = useRef(0);
  const addLog = useCallback((msg, type = 'info') => {
    logIdRef.current += 1;
    setLog((prev) => [...prev.slice(-19), { id: logIdRef.current, msg, type, ts: Date.now() }]);
  }, []);

  // Initialize network on mount
  useEffect(() => {
    setNetworkNodes(INITIAL_NODES);
    setNetworkLinks(INITIAL_LINKS.map((l) => ({ ...l })));
    // Compute initial route
    const adj = buildAdjacency(INITIAL_NODES, INITIAL_LINKS, new Set());
    const result = dijkstra(adj, SOURCE_NODE, TARGET_NODE);
    if (result) {
      setCurrentRoute(result.path);
      setRouteLinkIds(pathToLinkIds(result.path, INITIAL_LINKS));
      setRouteCost(result.totalCost);
      addLog(`Initial route: ${result.path.join(' → ')} (cost ${result.totalCost})`, 'success');
    }
  }, []); // eslint-disable-line

  const handleTriggerAsteroid = useCallback(() => {
    if (asteroidActive) return;
    setAsteroidActive(true);
    setAsteroidProgress(0);
    addLog('ASTEROID DETECTED — Impact trajectory confirmed.', 'warn');

    // Animate asteroid strike over 1.5s
    let start = null;
    const duration = 1500;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setAsteroidProgress(p);
      if (p < 1) {
        asteroidAnimRef.current = requestAnimationFrame(animate);
      } else {
        // Strike complete — disrupt primary link
        playImpactFx();
        const strikeLink = PRIMARY_STRIKE_LINK;
        const newDisrupted = [strikeLink];
        setDisruptedLinks(newDisrupted);

        // Update link availability in store
        setNetworkLinks((prev) =>
          prev.map((l) => l.id === strikeLink ? { ...l, available: false } : l)
        );

        addLog(`Link ${strikeLink} DESTROYED by asteroid impact!`, 'error');
        addLog('Rerouting via Dijkstra...', 'info');

        // Recompute route excluding disrupted link
        const currentNodes = INITIAL_NODES;
        const currentLinks = INITIAL_LINKS;
        const adj = buildAdjacency(currentNodes, currentLinks, new Set(newDisrupted));
        const result = dijkstra(adj, SOURCE_NODE, TARGET_NODE);

        if (result) {
          setCurrentRoute(result.path);
          setRouteLinkIds(pathToLinkIds(result.path, currentLinks));
          setRouteCost(result.totalCost);
          setDataQueued(false);
          setTimeout(() => playChimeFx(), 300);
          addLog(`Alternative route found: ${result.path.join(' → ')} (cost ${result.totalCost})`, 'success');
          addLog('Observation data transmission re-established.', 'success');
        } else {
          setCurrentRoute([]);
          setRouteLinkIds([]);
          setRouteCost(null);
          setDataQueued(true);
          addLog('No viable route available! Data queued for later transmission.', 'error');
        }

        setAsteroidActive(false);
        setAsteroidProgress(0);
      }
    };
    asteroidAnimRef.current = requestAnimationFrame(animate);
  }, [asteroidActive, setAsteroidActive, setDisruptedLinks, setNetworkLinks, setCurrentRoute, setDataQueued, addLog]);

  const handleReset = useCallback(() => {
    playPingFx();
    cancelAnimationFrame(asteroidAnimRef.current);
    resetNetwork();
    setNetworkNodes(INITIAL_NODES);
    setNetworkLinks(INITIAL_LINKS.map((l) => ({ ...l })));
    setLog([]);
    setAsteroidProgress(0);

    // Recompute initial route
    const adj = buildAdjacency(INITIAL_NODES, INITIAL_LINKS, new Set());
    const result = dijkstra(adj, SOURCE_NODE, TARGET_NODE);
    if (result) {
      setCurrentRoute(result.path);
      setRouteLinkIds(pathToLinkIds(result.path, INITIAL_LINKS));
      setRouteCost(result.totalCost);
      addLog('Network reset. Optimal route restored.', 'success');
    }
  }, [resetNetwork, setNetworkNodes, setNetworkLinks, setCurrentRoute, addLog]);

  useEffect(() => () => cancelAnimationFrame(asteroidAnimRef.current), []);

  const links = networkLinks.length > 0 ? networkLinks : INITIAL_LINKS;
  const nodes = networkNodes.length > 0 ? networkNodes : INITIAL_NODES;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>ASTEROID DISRUPTION COMM NETWORK</h2>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
      </div>

      {/* 3D Network Visualisation */}
      <div className={styles.networkViewport}>
        <Network3DView
          nodes={nodes}
          links={links}
          currentRoute={currentRoute}
          routeLinkIds={routeLinkIds}
          disruptedLinks={disruptedLinks}
          asteroidProgress={asteroidProgress}
          asteroidActive={asteroidActive}
        />
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={handleTriggerAsteroid}
          disabled={asteroidActive || disruptedLinks.length > 0}
        >
          {asteroidActive ? 'ASTEROID INCOMING...' : 'TRIGGER ASTEROID DISRUPTION'}
        </button>
        <button className={styles.btn} onClick={handleReset}>
          RESET NETWORK
        </button>
      </div>

      {/* Route Info */}
      <div className={styles.routeInfo}>
        <div className={styles.routeRow}>
          <span className={styles.routeLabel}>CURRENT ROUTE:</span>
          <span className={styles.routePath}>
            {currentRoute.length > 0 ? currentRoute.join(' → ') : (dataQueued ? 'DATA QUEUED' : 'COMPUTING...')}
          </span>
        </div>
        {routeCost !== null && (
          <div className={styles.routeRow}>
            <span className={styles.routeLabel}>TOTAL COST:</span>
            <span className={styles.routeValue}>{routeCost} units</span>
          </div>
        )}
        {dataQueued && (
          <div className={`${styles.routeRow} ${styles.queued}`}>
            DATA QUEUED — No viable route. Awaiting link restoration.
          </div>
        )}
      </div>

      {/* Link Status Table */}
      <div className={styles.linkTable}>
        <div className={styles.tableHeader}>LINK STATUS</div>
        <table>
          <thead>
            <tr>
              <th>LINK</th>
              <th>FROM</th>
              <th>TO</th>
              <th>COST</th>
              <th>STATUS</th>
              <th>ROUTE</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => {
              const disrupted = disruptedLinks.includes(link.id);
              const inRoute = routeLinkIds.includes(link.id);
              return (
                <tr key={link.id} className={disrupted ? styles.rowDisrupted : inRoute ? styles.rowActive : ''}>
                  <td>{link.id.replace('link-', '')}</td>
                  <td>{link.from}</td>
                  <td>{link.to}</td>
                  <td>{link.cost}</td>
                  <td>
                    <span className={disrupted ? styles.statusDown : styles.statusUp}>
                      {disrupted ? 'DISRUPTED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td>{inRoute ? <span className={styles.inRoute}>IN USE</span> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Event Log */}
      <div className={styles.logPanel}>
        <div className={styles.tableHeader}>MISSION LOG</div>
        <div className={styles.logList}>
          {log.length === 0 && <div className={styles.logEmpty}>Awaiting events...</div>}
          {[...log].reverse().map((entry) => (
            <div key={entry.id} className={`${styles.logEntry} ${styles['log_' + entry.type]}`}>
              <span className={styles.logTs}>{new Date(entry.ts).toLocaleTimeString()}</span>
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
