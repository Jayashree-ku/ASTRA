/**
 * networkData.js — Static network topology for the asteroid communication network.
 *
 * Nodes: Earth, 3 relay satellites (Alpha, Beta, Gamma), distant telescope (Hubble-X)
 * Links: weighted by cost (latency + reliability factor). All bidirectional.
 *
 * 3D positions are in a normalized coordinate space (-5 to 5).
 */

export const INITIAL_NODES = [
  {
    id: 'earth',
    label: 'Earth Command',
    position: [0, 0, 0],
    color: '#00aaff',
    type: 'earth',
  },
  {
    id: 'sat-alpha',
    label: 'Relay Alpha',
    position: [2.5, 1.5, -1],
    color: '#00ffcc',
    type: 'satellite',
  },
  {
    id: 'sat-beta',
    label: 'Relay Beta',
    position: [-1.5, 2.5, 1],
    color: '#00ffcc',
    type: 'satellite',
  },
  {
    id: 'sat-gamma',
    label: 'Relay Gamma',
    position: [0.5, -1.5, 2.5],
    color: '#00ffcc',
    type: 'satellite',
  },
  {
    id: 'telescope',
    label: 'Hubble-X Telescope',
    position: [3.5, 3.5, -3],
    color: '#ffcc00',
    type: 'telescope',
  },
];

export const INITIAL_LINKS = [
  { id: 'link-earth-alpha',   from: 'earth',     to: 'sat-alpha', cost: 2,  available: true },
  { id: 'link-earth-beta',    from: 'earth',     to: 'sat-beta',  cost: 3,  available: true },
  { id: 'link-earth-gamma',   from: 'earth',     to: 'sat-gamma', cost: 4,  available: true },
  { id: 'link-alpha-beta',    from: 'sat-alpha', to: 'sat-beta',  cost: 2,  available: true },
  { id: 'link-alpha-telescope', from: 'sat-alpha', to: 'telescope', cost: 1, available: true },
  { id: 'link-beta-gamma',    from: 'sat-beta',  to: 'sat-gamma', cost: 3,  available: true },
  { id: 'link-beta-telescope', from: 'sat-beta', to: 'telescope', cost: 2,  available: true },
  { id: 'link-gamma-telescope', from: 'sat-gamma', to: 'telescope', cost: 5, available: true },
];

/** The primary link that the asteroid strikes (Earth → Alpha) */
export const PRIMARY_STRIKE_LINK = 'link-earth-alpha';
export const SOURCE_NODE = 'earth';
export const TARGET_NODE = 'telescope';
