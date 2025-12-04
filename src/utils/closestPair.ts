import type { Aircraft } from '../types';

export interface Point {
  id: string;
  x: number;
  y: number;
}

export interface ClosestPairResult {
  pairs: [Point, Point][];
  minDistance: number;
}

function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function bruteForce(points: Point[]): ClosestPairResult {
  let minDist = Infinity;
  const pairs: [Point, Point][] = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i], points[j]);
      if (d < minDist - 1e-9) {
        minDist = d;
        pairs.length = 0;
        pairs.push([points[i], points[j]]);
      } else if (Math.abs(d - minDist) < 1e-9) {
        pairs.push([points[i], points[j]]);
      }
    }
  }
  return { minDistance: minDist, pairs };
}

function stripClosest(strip: Point[], delta: number): ClosestPairResult {
  let minDist = delta;
  const pairs: [Point, Point][] = [];

  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < minDist; j++) {
      const d = distance(strip[i], strip[j]);
      if (d < minDist - 1e-9) {
        minDist = d;
        pairs.length = 0;
        pairs.push([strip[i], strip[j]]);
      } else if (Math.abs(d - minDist) < 1e-9) {
        pairs.push([strip[i], strip[j]]);
      }
    }
  }
  return { minDistance: minDist, pairs };
}

function closestRec(Px: Point[], Py: Point[]): ClosestPairResult {
  const n = Px.length;
  if (n <= 3) return bruteForce(Px);

  const mid = Math.floor(n / 2);
  const midpointX = Px[mid].x;

  const Qx = Px.slice(0, mid);
  const Rx = Px.slice(mid);

  const Qy = Py.filter(p => p.x <= midpointX);
  const Ry = Py.filter(p => p.x > midpointX);

  const left = closestRec(Qx, Qy);
  const right = closestRec(Rx, Ry);

  let minDist = Math.min(left.minDistance, right.minDistance);
  let candidatePairs: [Point, Point][] = [];

  if (left.minDistance < right.minDistance) {
    candidatePairs = left.pairs;
  } else if (right.minDistance < left.minDistance) {
    candidatePairs = right.pairs;
  } else {
    candidatePairs = [...left.pairs, ...right.pairs];
  }

  const strip = Py.filter(p => Math.abs(p.x - midpointX) < minDist);
  const stripResult = stripClosest(strip, minDist);

  if (stripResult.minDistance < minDist - 1e-9) {
    minDist = stripResult.minDistance;
    candidatePairs = stripResult.pairs;
  } else if (Math.abs(stripResult.minDistance - minDist) < 1e-9) {
    candidatePairs = [...candidatePairs, ...stripResult.pairs];
  }

  // Eliminar duplicados
  const seen = new Set<string>();
  const uniquePairs: [Point, Point][] = [];
  for (const [a, b] of candidatePairs) {
    const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePairs.push([a, b]);
    }
  }

  return { minDistance: minDist, pairs: uniquePairs };
}

export function findClosestPairs(aircrafts: Aircraft[]): ClosestPairResult {
  if (aircrafts.length < 2) return { minDistance: Infinity, pairs: [] };

  const points: Point[] = aircrafts.map(ac => ({ id: ac.id, x: ac.x, y: ac.y }));
  const Px = [...points].sort((a, b) => a.x - b.x);
  const Py = [...points].sort((a, b) => a.y - b.y);

  return closestRec(Px, Py);
}
