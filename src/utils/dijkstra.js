/**
 * dijkstra.js — Pure Dijkstra shortest-path implementation (no libraries).
 *
 * Graph is represented as an adjacency list:
 *   { nodeId: [ { to: nodeId, cost: number, linkId: string }, ... ], ... }
 *
 * disruptedLinkIds: Set of linkId strings that are currently unavailable.
 *
 * Returns { path: [nodeId, ...], totalCost: number } or null if no path.
 */

export function buildAdjacency(nodes, links, disruptedLinkIds = new Set()) {
  const adj = {};
  nodes.forEach((n) => { adj[n.id] = []; });

  links.forEach((link) => {
    if (disruptedLinkIds.has(link.id)) return; // skip disrupted links
    adj[link.from].push({ to: link.to, cost: link.cost, linkId: link.id });
    adj[link.to].push({ to: link.from, cost: link.cost, linkId: link.id }); // undirected
  });

  return adj;
}

export function dijkstra(adj, sourceId, targetId) {
  // Priority queue implemented as a sorted array (good enough for small graphs)
  const dist = {};
  const prev = {};
  const visited = new Set();

  Object.keys(adj).forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });
  dist[sourceId] = 0;

  // Min-heap via simple array priority queue
  const pq = [{ id: sourceId, cost: 0 }];

  while (pq.length > 0) {
    // Extract minimum
    pq.sort((a, b) => a.cost - b.cost);
    const { id: u, cost: uCost } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === targetId) break;

    (adj[u] || []).forEach(({ to: v, cost: w }) => {
      if (visited.has(v)) return;
      const alt = uCost + w;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        pq.push({ id: v, cost: alt });
      }
    });
  }

  if (dist[targetId] === Infinity) return null; // no path

  // Reconstruct path
  const path = [];
  let curr = targetId;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }

  return { path, totalCost: dist[targetId] };
}

/**
 * Given a path (array of nodeIds) and link list, returns which linkIds are used.
 */
export function pathToLinkIds(path, links) {
  const used = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const link = links.find(
      (l) => (l.from === a && l.to === b) || (l.from === b && l.to === a)
    );
    if (link) used.push(link.id);
  }
  return used;
}
