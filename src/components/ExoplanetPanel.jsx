import { useState, useRef, useCallback, useEffect } from 'react';
import { useAstraStore } from '../store/useAstraStore';
import { generateLightCurve, detectTransits, parseCSV } from '../utils/lightCurve';
import { playPingFx, playChimeFx } from '../utils/audioEngine';
import TransitAnimation from './TransitAnimation';
import styles from './ExoplanetPanel.module.css';

const DISCLAIMER = '⚠ SIMULATED DATA — Not real telescope observations. Educational prototype only.';

export default function ExoplanetPanel() {
  const {
    lightCurveData, setLightCurveData,
    detectedDips, setDetectedDips,
    analysisRunning, setAnalysisRunning,
    analysisComplete, setAnalysisComplete,
  } = useAstraStore();

  const [result, setResult] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [transitProgress, setTransitProgress] = useState(0); // 0–1, planet crossing
  const canvasRef = useRef();
  const animFrameRef = useRef();

  // Generate simulated dataset
  const handleGenerate = useCallback(() => {
    playPingFx();
    const data = generateLightCurve({
      numPoints: 800,
      observationDays: 30,
      transitPeriodDays: 7.3,
      transitDepth: 0.016,
      transitDurationDays: 0.28,
      noiseLevel: 0.003,
    });
    setLightCurveData(data);
    setDetectedDips([]);
    setAnalysisComplete(false);
    setResult(null);
    setCsvError('');
  }, [setLightCurveData, setDetectedDips, setAnalysisComplete]);

  // CSV upload
  const handleCSV = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (!parsed) {
        setCsvError('CSV must have "time" and "flux" columns with >10 rows.');
        return;
      }
      playPingFx();
      setCsvError('');
      setLightCurveData({ time: parsed.time, flux: parsed.flux, metadata: { source: `Uploaded: ${file.name}`, numPoints: parsed.time.length } });
      setDetectedDips([]);
      setAnalysisComplete(false);
      setResult(null);
    };
    reader.readAsText(file);
  }, [setLightCurveData, setDetectedDips, setAnalysisComplete]);

  // Run analysis
  const handleAnalyze = useCallback(() => {
    if (!lightCurveData) return;
    playPingFx();
    setAnalysisRunning(true);
    setTransitProgress(0);

    // Animate planet crossing (runs over ~2s)
    let start = null;
    const duration = 2000;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setTransitProgress(p);
      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Run actual detection after animation
        const r = detectTransits(lightCurveData.time, lightCurveData.flux);
        setDetectedDips(r.dips);
        setResult(r);
        setAnalysisRunning(false);
        setAnalysisComplete(true);
        playChimeFx();
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [lightCurveData, setAnalysisRunning, setDetectedDips, setAnalysisComplete]);

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  // Draw light curve on canvas
  useEffect(() => {
    if (!lightCurveData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { time, flux } = lightCurveData;
    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 20, right: 20, bottom: 36, left: 50 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const minT = time[0], maxT = time[time.length - 1];
    const minF = Math.min(...flux) - 0.002;
    const maxF = Math.max(...flux) + 0.002;

    const tx = (t) => pad.left + ((t - minT) / (maxT - minT)) * plotW;
    const ty = (f) => pad.top + plotH - ((f - minF) / (maxF - minF)) * plotH;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#020814';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,200,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * plotH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(0,200,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(0,200,255,0.6)';
    ctx.font = '10px Courier New';
    ctx.fillText('Flux', 4, pad.top + plotH / 2);
    ctx.fillText('Time (days)', pad.left + plotW / 2 - 30, H - 6);

    // Detected dip regions (highlight before drawing line)
    if (detectedDips && detectedDips.length > 0) {
      detectedDips.forEach((dip) => {
        const x1 = tx(dip.windowStart);
        const x2 = tx(dip.windowEnd);
        ctx.fillStyle = 'rgba(0,238,255,0.08)';
        ctx.fillRect(x1, pad.top, x2 - x1, plotH);
        // Dip marker
        ctx.strokeStyle = '#00eeff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(tx(dip.centerTime), pad.top);
        ctx.lineTo(tx(dip.centerTime), pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Light curve line
    ctx.beginPath();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < time.length; i++) {
      const x = tx(time[i]);
      const y = ty(flux[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Dip labels
    if (detectedDips && detectedDips.length > 0) {
      ctx.fillStyle = '#00eeff';
      ctx.font = 'bold 10px Courier New';
      detectedDips.forEach((dip, idx) => {
        ctx.fillText(`T${idx + 1}`, tx(dip.centerTime) + 3, pad.top + 14);
      });
    }
  }, [lightCurveData, detectedDips]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>EXOPLANET TRANSIT ANALYSIS</h2>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={handleGenerate}>
          GENERATE DATASET
        </button>
        <label className={styles.btn} style={{ cursor: 'pointer' }}>
          UPLOAD CSV
          <input type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleAnalyze}
          disabled={!lightCurveData || analysisRunning}
        >
          {analysisRunning ? 'ANALYSING...' : 'RUN ANALYSIS'}
        </button>
      </div>
      {csvError && <p className={styles.error}>{csvError}</p>}

      {lightCurveData && (
        <div className={styles.metaRow}>
          <span className={styles.metaBadge}>SOURCE: {lightCurveData.metadata?.source}</span>
          <span className={styles.metaBadge}>{lightCurveData.metadata?.numPoints} POINTS</span>
          <span className={styles.metaBadge}>{lightCurveData.metadata?.observationDays ?? '?'} DAYS</span>
        </div>
      )}

      {/* Transit animation strip */}
      {analysisRunning && (
        <TransitAnimation progress={transitProgress} />
      )}

      {/* Light curve canvas */}
      {lightCurveData && (
        <div className={styles.chartWrap}>
          <canvas
            ref={canvasRef}
            width={820}
            height={220}
            className={styles.chart}
          />
        </div>
      )}

      {/* Results */}
      {analysisComplete && result && (
        <div className={styles.results}>
          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>TRANSIT EVENTS</div>
              <div className={styles.resultValue}>{result.dips.length}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>MAX SNR</div>
              <div className={styles.resultValue}>{result.snr.toFixed(1)}σ</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>PERIODIC?</div>
              <div className={styles.resultValue}>{result.periodicityResult.isPeriodic ? 'YES' : 'NO'}</div>
            </div>
            {result.periodicityResult.period && (
              <div className={styles.resultCard}>
                <div className={styles.resultLabel}>PERIOD</div>
                <div className={styles.resultValue}>{result.periodicityResult.period.toFixed(2)}d</div>
              </div>
            )}
          </div>

          <div
            className={styles.assessment}
            style={{ borderColor: result.candidateAssessment.color, color: result.candidateAssessment.color }}
          >
            <span className={styles.grade}>{result.candidateAssessment.grade}</span>
            <span>{result.candidateAssessment.label}</span>
          </div>

          {result.dips.length > 0 && (
            <div className={styles.dipTable}>
              <div className={styles.tableHeader}>DETECTED TRANSIT EVENTS</div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CENTER (days)</th>
                    <th>DEPTH</th>
                    <th>SNR</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dips.map((d, i) => (
                    <tr key={i}>
                      <td>T{i + 1}</td>
                      <td>{d.centerTime.toFixed(3)}</td>
                      <td>{(d.depth * 100).toFixed(3)}%</td>
                      <td>{d.snr.toFixed(1)}σ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className={styles.footNote}>
            Signal detection used a sliding-window box scan with robust MAD noise estimation.
            Periodicity assessed by inter-dip gap consistency. Results apply to simulated data only.
          </p>
        </div>
      )}
    </div>
  );
}
