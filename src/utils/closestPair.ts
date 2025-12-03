import { type Point, type ClosestPairResult } from '../types';
import { calculateDistance } from './math';

const DANGER_THRESHOLD = 1;
const WARNING_THRESHOLD = 5;

export const bruteForceClosestPair = (P: Point[]): ClosestPairResult => {
  let minDistance = Infinity;
  let closestPair: [Point, Point] | null = null;
  if (P.length < 2) return { distance: Infinity, pair: null };

  for (let i = 0; i < P.length - 1; i++) {
    for (let j = i + 1; j < P.length; j++) {
      const dist = calculateDistance(P[i], P[j]);
      if (dist < minDistance) {
        minDistance = dist;
        closestPair = [P[i], P[j]];
      }
    }
  }
  return { distance: minDistance, pair: closestPair };
};

export function closestPair(Px: Point[], Py: Point[]): ClosestPairResult {
  const n = Px.length;

  if (n <= 3) {
    return bruteForceClosestPair(Px);
  }

  // DIVIDIR:
  const mid = Math.floor(n / 2);
  const Px_L = Px.slice(0, mid);
  const Px_R = Px.slice(mid);
  const medianX = Px_L[Px_L.length - 1].x;

  // Reconstruir Py_L y Py_R en O(n)
  const Py_L: Point[] = [];
  const Py_R: Point[] = [];
  for (const p of Py) {
    if (p.x <= medianX) {
      Py_L.push(p);
    } else {
      Py_R.push(p);
    }
  }

  // CONQUISTAR (Llamadas Recursivas):
  const resL = closestPair(Px_L, Py_L);
  const resR = closestPair(Px_R, Py_R);

  // COMBINAR:
  let delta = Math.min(resL.distance, resR.distance);
  let closest = resL.distance < resR.distance ? resL : resR;

  // Buscar en la banda central de ancho 2 * delta
  const Sy: Point[] = Py.filter(p => p.x >= medianX - delta && p.x <= medianX + delta);

  // Búsqueda eficiente en la banda (solo se comparan puntos a lo sumo a 7 vecinos)
  for (let i = 0; i < Sy.length; i++) {
    // Optimización: solo 7 comparaciones, verificando que la diferencia en Y sea < delta
    for (let j = i + 1; j < Sy.length && (Sy[j].y - Sy[i].y) < delta; j++) {
      const dist = calculateDistance(Sy[i], Sy[j]);
      if (dist < delta) {
        delta = dist;
        closest = { distance: dist, pair: [Sy[i], Sy[j]] };
      }
    }
  }

  return closest;
}

// --- Lógica para el Reducer (aplicación de Closest Pair) ---

export const analyzeCollisionRisk = (
  activeAircrafts: Point[],
  dangerThreshold: number,
  warningThreshold: number
) => {
  // 1. ORDENAR (Costo O(n log n) en cada tick)
  const Px = [...activeAircrafts].sort((a, b) => a.x - b.x);
  const Py = [...activeAircrafts].sort((a, b) => a.y - b.y);

  // 2. ENCONTRAR EL PAR MÁS CERCANO
  const closestResult = closestPair(Px, Py);
  const minDistance = closestResult.distance;
  const closestPairIds = closestResult.pair ? new Set(closestResult.pair.map(p => p.id)) : new Set();
  const newClosestPairIds: [string, string] | null = closestResult.pair
    ? [closestResult.pair[0].id, closestResult.pair[1].id]
    : null;

  const newCollisionStates: Record<string, 'safe' | 'warning' | 'danger'> = {};

  // 3. ASIGNAR ESTADOS DE RIESGO
  activeAircrafts.forEach(p => {
    let newState: 'safe' | 'warning' | 'danger' = 'safe';

    if (closestPairIds.has(p.id)) {
      if (minDistance < dangerThreshold) {
        newState = 'danger'; // Máximo riesgo (casi colisión)
      } else if (minDistance < warningThreshold) {
        newState = 'warning'; // Riesgo medio
      }
    }
    newCollisionStates[p.id] = newState;
  });

  return {
    newCollisionStates,
    minDistance,
    newClosestPairIds
  };
};
