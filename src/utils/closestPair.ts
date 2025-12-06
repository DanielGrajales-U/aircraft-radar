import { type Point, type Aircraft, toPoint } from '../types';

// Distancia euclidiana
const dist = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// 1. Caso Base y Fuerza Bruta O(n^2) para n < 4
const closestPairBruteForce = (P: Point[]): { distance: number, ids: [string, string] } => {
  let minDistance = Infinity;
  let closestIds: [string, string] = [P[0].id, P[1].id]; // Inicialización segura

  for (let i = 0; i < P.length; i++) {
    for (let j = i + 1; j < P.length; j++) {
      const distance = dist(P[i], P[j]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIds = [P[i].id, P[j].id];
      }
    }
  }
  return { distance: minDistance, ids: closestIds };
};

// 2. Combinar (Cálculo en la Banda Central) O(n)
const closestPairStrip = (strip: Point[], delta: number, currentClosestIds: [string, string]): { distance: number, ids: [string, string] } => {
  let minDistance = delta;
  let closestIds = currentClosestIds;

  // La banda ya está ordenada por Y desde el pre-procesamiento
  // Se recorre, comparando cada punto con los 7 siguientes.
  for (let i = 0; i < strip.length; i++) {
    // En el peor caso, solo se necesitan 7 comparaciones
    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < minDistance; j++) {
      const distance = dist(strip[i], strip[j]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIds = [strip[i].id, strip[j].id];
      }
    }
  }
  return { distance: minDistance, ids: closestIds };
};

// 3. Función Recursiva de Dividir y Vencer
const closestPairRec = (Px: Point[], Py: Point[]): { distance: number, ids: [string, string] } => {
  const n = Px.length;

  // Caso base
  if (n <= 3) {
    return closestPairBruteForce(Px);
  }

  // Dividir: Partición de puntos
  const mid = Math.floor(n / 2);
  const midPoint = Px[mid];

  const PxL = Px.slice(0, mid);
  const PxR = Px.slice(mid);

  // Particionar Py de forma eficiente basado en midPoint.x
  const PyL: Point[] = [];
  const PyR: Point[] = [];
  for (const p of Py) {
    // Asignar el punto central al lado derecho por simplicidad
    if (p.x < midPoint.x) {
      PyL.push(p);
    } else {
      PyR.push(p);
    }
  }

  // Conquistar: Llamadas recursivas
  const { distance: deltaL, ids: idsL } = closestPairRec(PxL, PyL);
  const { distance: deltaR, ids: idsR } = closestPairRec(PxR, PyR);

  // Combinar: Encontrar el mínimo global (delta)
  let delta = deltaL;
  let closestIds = idsL;

  if (deltaR < delta) {
    delta = deltaR;
    closestIds = idsR;
  }

  // Crear la banda central (strip)
  const strip: Point[] = Py.filter(p => Math.abs(p.x - midPoint.x) < delta);

  // Encontrar el par más cercano dentro de la banda central
  const stripResult = closestPairStrip(strip, delta, closestIds);

  return stripResult;
};

// Función principal que pre-procesa y llama al algoritmo
export const findClosestPair = (points: Point[]): { distance: number, ids: [string, string] | null } => {
  if (points.length < 2) {
    return { distance: Infinity, ids: null };
  }

  // Pre-procesamiento: Ordenar Puntos
  const Px = [...points].sort((a, b) => a.x - b.x); // Ordenado por X
  const Py = [...points].sort((a, b) => a.y - b.y); // Ordenado por Y

  const result = closestPairRec(Px, Py);

  // Asegurarse de que el orden de IDs sea canónico para la comparación [id1, id2] donde id1 < id2
  const canonicalIds: [string, string] = result.ids.sort() as [string, string];

  return { distance: result.distance, ids: canonicalIds };
};


// ---------------------------------------------------------------------------------
// Función para ser utilizada en el Hook/Reducer
// ---------------------------------------------------------------------------------

export interface CollisionRiskAnalysis {
  minDistance: number;
  newClosestPairIds: [string, string] | null;
  newCollisionStates: Record<string, Aircraft['collisionState']>;
}

export const analyzeCollisionRisk = (activeAircrafts: Aircraft[], DANGER_THRESHOLD: number, WARNING_THRESHOLD: number): CollisionRiskAnalysis => {
  const points: Point[] = activeAircrafts.map(ac => toPoint(ac));

  const { distance: minDistance, ids: newClosestPairIds } = findClosestPair(points);

  const newCollisionStates: Record<string, Aircraft['collisionState']> = {};

  activeAircrafts.forEach(ac => {
    newCollisionStates[ac.id] = 'safe';
  });

  if (newClosestPairIds) {
    const [id1, id2] = newClosestPairIds;

    // Identificar estado de riesgo
    if (minDistance < DANGER_THRESHOLD) {
      newCollisionStates[id1] = 'danger';
      newCollisionStates[id2] = 'danger';
    } else if (minDistance < WARNING_THRESHOLD) {
      newCollisionStates[id1] = 'warning';
      newCollisionStates[id2] = 'warning';
    }
  }

  // Asignar el estado a todos los aviones que estén cerca del riesgo (Opcional, pero se mantiene la simplicidad
  // de solo aplicar el estado de riesgo al par más cercano).

  return {
    minDistance,
    newClosestPairIds,
    newCollisionStates
  };
};
