// src/types.ts

// Tipo fundamental para el algoritmo de par más cercano
export interface Point {
  id: string; // ID del avión
  x: number;
  y: number;
}

// Interfaz principal de la Aeronave
export interface Aircraft extends Point {
  dx: number;
  dy: number;
  callsign: string;
  collisionState: 'safe' | 'warning' | 'danger' | 'collision';
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;
}

// Resultado del algoritmo de Par Más Cercano
export interface ClosestPairResult {
  distance: number;
  p1: Point;
  p2: Point;
}

// Interfaz para el historial de colisiones
export interface CollisionHistoryItem extends Omit<Aircraft, 'collisionState'> {
  finalCollisionState: 'warning' | 'danger' | 'collision';
  timestamp: number;
  distance: number; // Guardar la distancia al colisionar
}

// Acciones del Reducer
export type Action =
  | { type: 'SET_AIRCRAFTS'; payload: Aircraft[] }
  | { type: 'UPDATE_AIRCRAFT_POSITIONS' };

// Estado del contexto (revisar la implementación del hook)
export interface AircraftState {
  aircrafts: Aircraft[];
  collisionHistory: CollisionHistoryItem[];
  closestPairIds: [string, string] | null; // Para resaltar en el panel
}

// Utilidad para convertir Aircraft a Point
export const toPoint = (ac: Aircraft): Point => ({ id: ac.id, x: ac.x, y: ac.y });
