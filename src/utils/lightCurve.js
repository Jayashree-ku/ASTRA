/**
 * lightCurve.js — Simulated stellar light-curve generator and transit detector.
 *
 * This is a SIMULATED dataset for educational/prototype purposes.
 * It is NOT real telescope data. Labels clearly mark this.
 *
 * Algorithm:
 *  1. Generate a baseline flux with realistic Gaussian noise.
 *  2. Inject periodic transit dips at a known orbital period.
 *  3. Detect dips using a box-least-squares style sliding window.
 *  4. Evaluate repetition and signal-to-noise.
 */

// ── helpers ──────────────────────────────────────────────────────────────────

function gaussianNoise(mean = 0, std = 1) {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function linspace(start, end, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(start + (i / (n - 1)) * (end - start));
  }
  return arr;
}

// ── dataset generation ────────────────────────────────────────────────────────

/**
 * generateLightCurve(options) → { time, flux, metadata }
 *
 * Returns a simulated stellar photometry dataset with injected transits.
 */
export function generateLightCurve({
  numPoints = 1000,
  observationDays = 30,
  transitPeriodDays = 7.3,     // orbital period
  transitDepth = 0.015,        // fractional flux decrease (1.5%)
  transitDurationDays = 0.25,  // transit window
  noiseLevel = 0.003,          // Gaussian noise std
  injectedTransits = true,
} = {}) {
  const time = linspace(0, observationDays, numPoints);
  const flux = [];

  for (let i = 0; i < numPoints; i++) {
    let f = 1.0; // normalized baseline flux

    // Inject transits at periodic intervals
    if (injectedTransits) {
      const phase = time[i] % transitPeriodDays;
      const midPhase = transitPeriodDays * 0.1; // offset from period start
      if (Math.abs(phase - midPhase) < transitDurationDays / 2) {
        // Smooth trapezoidal transit shape
        const x = Math.abs(phase - midPhase) / (transitDurationDays / 2);
        const shape = x < 0.7 ? 1.0 : (1.0 - x) / 0.3;
        f -= transitDepth * Math.max(0, shape);
      }
    }

    // Add stellar variability (low-frequency sine)
    f += 0.001 * Math.sin(2 * Math.PI * time[i] / 5.7);

    // Add Gaussian noise
    f += gaussianNoise(0, noiseLevel);

    flux.push(f);
  }

  return {
    time,
    flux,
    metadata: {
      source: 'SIMULATED — Not real telescope data',
      observationDays,
      transitPeriodDays,
      transitDepth,
      transitDurationDays,
      noiseLevel,
      numPoints,
      injectedTransits,
    },
  };
}

// ── transit detection ─────────────────────────────────────────────────────────

/**
 * detectTransits(time, flux, options)
 *
 * Sliding-window box scan: finds time windows where mean flux is significantly
 * below the overall median. Returns detected dip events.
 */
export function detectTransits(time, flux, {
  windowFraction = 0.025,  // window width as fraction of total time
  sigmaThreshold = 3.5,    // detection significance threshold (σ)
  minRepetitions = 2,      // minimum number of dips to call it periodic
} = {}) {
  const n = flux.length;
  const totalTime = time[n - 1] - time[0];
  const windowSize = Math.max(3, Math.floor(n * windowFraction));

  // Global statistics
  const sorted = [...flux].sort((a, b) => a - b);
  const median = sorted[Math.floor(n / 2)];
  const mad = sorted.reduce((acc, v) => acc + Math.abs(v - median), 0) / n;
  const sigma = mad * 1.4826; // robust noise estimate

  const dips = [];
  let i = 0;

  while (i < n - windowSize) {
    const window = flux.slice(i, i + windowSize);
    const windowMean = window.reduce((a, b) => a + b, 0) / windowSize;
    const depth = median - windowMean;
    const snr = depth / sigma;

    if (snr > sigmaThreshold) {
      // Find the minimum point in this dip
      let minIdx = i;
      for (let j = i; j < i + windowSize; j++) {
        if (flux[j] < flux[minIdx]) minIdx = j;
      }

      dips.push({
        centerTime: time[minIdx],
        centerIdx: minIdx,
        depth: depth,
        snr: snr,
        windowStart: time[i],
        windowEnd: time[Math.min(i + windowSize - 1, n - 1)],
        flux: windowMean,
      });

      i += windowSize; // jump past this dip
    } else {
      i++;
    }
  }

  // Check for periodicity
  const periodicityResult = assessPeriodicity(dips, totalTime);

  return {
    dips,
    sigma,
    median,
    snr: dips.length > 0 ? Math.max(...dips.map((d) => d.snr)) : 0,
    periodicityResult,
    candidateAssessment: assessCandidate(dips, periodicityResult),
  };
}

function assessPeriodicity(dips, totalTime) {
  if (dips.length < 2) return { isPeriodic: false, period: null, confidence: 0 };

  const times = dips.map((d) => d.centerTime);
  const gaps = [];
  for (let i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);

  if (gaps.length === 0) return { isPeriodic: false, period: null, confidence: 0 };

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + Math.pow(b - avgGap, 2), 0) / gaps.length;
  const stdGap = Math.sqrt(variance);
  const consistency = 1 - Math.min(1, stdGap / avgGap);

  return {
    isPeriodic: consistency > 0.6 && dips.length >= 2,
    period: avgGap,
    consistency,
    confidence: consistency * Math.min(1, dips.length / 4),
  };
}

function assessCandidate(dips, periodicity) {
  if (dips.length === 0) return { grade: 'F', label: 'No transit detected', color: '#ff4444' };

  const maxSnr = Math.max(...dips.map((d) => d.snr));

  if (dips.length >= 3 && periodicity.isPeriodic && periodicity.confidence > 0.7 && maxSnr > 5) {
    return { grade: 'A', label: 'Strong Exoplanet Candidate', color: '#00ffcc' };
  } else if (dips.length >= 2 && periodicity.isPeriodic && maxSnr > 4) {
    return { grade: 'B', label: 'Probable Transit Signal', color: '#00ccff' };
  } else if (dips.length >= 1 && maxSnr > 3.5) {
    return { grade: 'C', label: 'Transit-Like Feature', color: '#ffcc00' };
  } else {
    return { grade: 'D', label: 'Inconclusive', color: '#ff8800' };
  }
}

/**
 * parseCSV(text) → { time, flux } | null
 * Accepts CSV with columns: time, flux (header row expected).
 */
export function parseCSV(text) {
  try {
    const lines = text.trim().split('\n');
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const tIdx = header.findIndex((h) => h.includes('time') || h === 't');
    const fIdx = header.findIndex((h) => h.includes('flux') || h === 'f' || h.includes('bright'));

    if (tIdx === -1 || fIdx === -1) return null;

    const time = [];
    const flux = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const t = parseFloat(cols[tIdx]);
      const f = parseFloat(cols[fIdx]);
      if (!isNaN(t) && !isNaN(f)) {
        time.push(t);
        flux.push(f);
      }
    }

    return time.length > 10 ? { time, flux } : null;
  } catch {
    return null;
  }
}
