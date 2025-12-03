export type Point = { x: number; y: number; id: string };

export interface ClosestPairResult {
  distance: number;
  pair: [Point, Point] | null;
}

export interface Aircraft {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  callsign: string;
  collisionState: 'safe' | 'warning' | 'danger' | 'collision';
  passengers: number;
  pilotName: string;
  origin: string;
  destination: string;
}

export interface CollisionHistoryItem extends Omit<Aircraft, 'collisionState'> {
  finalCollisionState: 'warning' | 'danger' | 'collision';
  timestamp: number;
}

export interface AircraftState {
  aircrafts: Aircraft[];
  collisionHistory: CollisionHistoryItem[];
  closestPairIds: [string, string] | null;
}

export type Action =
  | { type: 'SET_AIRCRAFTS'; payload: Aircraft[] }
  | { type: 'UPDATE_AIRCRAFT_POSITIONS' };
